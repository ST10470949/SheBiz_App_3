// REAL backend: Firebase Auth + Cloud Firestore + Cloud Storage + Cloud Functions.
// Same interface as localBackend.js, so the UI does not care which one is running.

import {
  createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, sendEmailVerification,
  sendPasswordResetEmail, GoogleAuthProvider, signInWithPopup, updatePassword, reauthenticateWithCredential,
  reauthenticateWithPopup, EmailAuthProvider, deleteUser, updateProfile as updateAuthProfile, setPersistence, browserLocalPersistence, browserSessionPersistence,
} from 'firebase/auth';
import {
  doc, collection, onSnapshot, addDoc, setDoc, deleteDoc, getDoc, getDocs, writeBatch, runTransaction,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { httpsCallable } from 'firebase/functions';
import { auth, db, storage, functions } from './firebase.js';
import { useCloudFunctions } from './config.js';
import { defaultBusiness, COLLECTIONS } from './starter.js';
import { buildCourses } from '../data/seed.js';

const fail = (code, message) => Object.assign(new Error(message), { code });

const MESSAGES = {
  'auth/email-already-in-use': 'An account with this email already exists. Try logging in.',
  'auth/invalid-credential': 'Incorrect email or password.',
  'auth/invalid-email': 'That email address is not valid.',
  'auth/user-not-found': 'No account found with that email.',
  'auth/wrong-password': 'Incorrect password. Please try again.',
  'auth/too-many-requests': 'Too many attempts. Please wait a few minutes and try again.',
  'auth/weak-password': 'Choose a stronger password (8+ characters with upper, lower and a number).',
  'auth/network-request-failed': 'No internet connection. Check your network and try again.',
  'auth/popup-closed-by-user': 'The Google sign-in window was closed before finishing.',
  'auth/requires-recent-login': 'For your security, please log out, log in again and retry.',
  'permission-denied': 'You do not have permission to do that. Make sure your email is verified.',
  'storage/unauthorized': 'You do not have permission to upload that file.',
};
const friendly = (err) => {
  if (!err) return fail('unknown', 'Something went wrong.');
  const code = err.code || '';
  const msg = MESSAGES[code] || MESSAGES[code.replace('firestore/', '')];
  if (msg) return fail(code, msg);
  if (String(code).startsWith('functions/') && err.message) return fail(code, err.message);
  return fail(code || 'unknown', err.message || 'Something went wrong. Please try again.');
};
const guard = (fn) => async (...args) => { try { return await fn(...args); } catch (e) { throw friendly(e); } };

const toUser = (u) => (u ? {
  uid: u.uid, email: u.email, emailVerified: !!u.emailVerified, displayName: u.displayName || '',
  provider: u.providerData?.[0]?.providerId || 'password',
} : null);

const authListeners = new Set();
const notify = () => authListeners.forEach((fn) => fn(toUser(auth.currentUser)));
const colRef = (uid, name) => collection(db, 'users', uid, name);
const strip = ({ id, ...rest }) => JSON.parse(JSON.stringify(rest));

async function commitInChunks(writes) {
  for (let i = 0; i < writes.length; i += 400) {
    const batch = writeBatch(db);
    writes.slice(i, i + 400).forEach((w) => w(batch));
    await batch.commit();
  }
}

async function clearCollections(uid, names) {
  const writes = [];
  for (const name of names) {
    const snap = await getDocs(colRef(uid, name));
    snap.forEach((d) => writes.push((b) => b.delete(d.ref)));
  }
  await commitInChunks(writes);
}

export const firebaseBackend = {
  mode: 'firebase',
  supportsGoogle: true,
  supportsAI: true,

  async init() { await setPersistence(auth, browserLocalPersistence); },

  onAuth(cb) {
    authListeners.add(cb);
    const unsub = onAuthStateChanged(auth, (u) => cb(toUser(u)));
    return () => { authListeners.delete(cb); unsub(); };
  },

  register: guard(async ({ fullName, email, phone, location, password, interests }) => {
    const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
    await updateAuthProfile(cred.user, { displayName: fullName.trim() });
    await setDoc(doc(db, 'users', cred.user.uid), {
      fullName: fullName.trim(), email: email.trim().toLowerCase(), phone: phone.trim(), location: location.trim(),
      interests, careerInterests: [], photoURL: '', skills: [], education: [], achievements: [],
      seeded: false, createdAt: new Date().toISOString(),
    });
    notify();
    return toUser(cred.user);
  }),

  login: guard(async (email, password, remember = true) => {
    await setPersistence(auth, remember ? browserLocalPersistence : browserSessionPersistence);
    const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
    return toUser(cred.user);
  }),

  loginGoogle: guard(async () => {
    const cred = await signInWithPopup(auth, new GoogleAuthProvider());
    const pref = doc(db, 'users', cred.user.uid);
    const snap = await getDoc(pref);
    if (!snap.exists()) {
      await setDoc(pref, {
        fullName: cred.user.displayName || '', email: cred.user.email, phone: '', location: '', interests: [], careerInterests: [],
        photoURL: cred.user.photoURL || '', skills: [], education: [], achievements: [], seeded: false, createdAt: new Date().toISOString(),
      });
    }
    return toUser(cred.user);
  }),

  logout: guard(async () => { await signOut(auth); }),

  /** Sends a 6-digit code through Cloud Functions. Falls back to Firebase's verification LINK if functions are not deployed. */
  sendCode: guard(async () => {
    const user = auth.currentUser;
    if (!user) throw fail('auth/no-user', 'Please sign in first.');
    if (useCloudFunctions) {
      try {
        await httpsCallable(functions, 'sendVerificationCode')();
        return { mode: 'code', email: user.email, expiresInMinutes: 10 };
      } catch (e) {
        if (e.code === 'functions/resource-exhausted' || e.code === 'functions/failed-precondition') throw e;
        console.warn('Cloud Function sendVerificationCode failed, falling back to link email.', e);
      }
    }
    await sendEmailVerification(user);
    return { mode: 'link', email: user.email };
  }),

  verifyCode: guard(async (code) => {
    await httpsCallable(functions, 'verifyCode')({ code });
    await auth.currentUser.reload();
    await auth.currentUser.getIdToken(true); // refresh token so Firestore rules see email_verified = true
    notify();
  }),

  reloadUser: guard(async () => {
    if (!auth.currentUser) return null;
    await auth.currentUser.reload();
    await auth.currentUser.getIdToken(true);
    notify();
    return toUser(auth.currentUser);
  }),

  sendResetEmail: guard(async (email) => {
    try { await sendPasswordResetEmail(auth, email.trim()); } catch (e) { if (e.code !== 'auth/user-not-found') throw e; }
    return { sent: true };
  }),

  changePassword: guard(async (oldPw, newPw) => {
    const u = auth.currentUser;
    await reauthenticateWithCredential(u, EmailAuthProvider.credential(u.email, oldPw));
    await updatePassword(u, newPw);
  }),

  deleteAccount: guard(async (password) => {
    const u = auth.currentUser;
    if (u.providerData[0]?.providerId === 'google.com') await reauthenticateWithPopup(u, new GoogleAuthProvider());
    else await reauthenticateWithCredential(u, EmailAuthProvider.credential(u.email, password || ''));
    await clearCollections(u.uid, COLLECTIONS);
    await deleteDoc(doc(db, 'users', u.uid));
    await deleteUser(u);
  }),

  // ---------- profile ----------
  subscribeProfile(uid, cb) {
    return onSnapshot(doc(db, 'users', uid), (snap) => cb(snap.data() || {}), (e) => console.error('profile', e));
  },
  updateProfile: guard(async (uid, patch) => { await setDoc(doc(db, 'users', uid), JSON.parse(JSON.stringify(patch)), { merge: true }); }),

  // ---------- shared content (falls back to bundled seed if the collection is empty) ----------
  async getGlobal(name) {
    // Opportunities and mentors exist only if you added real ones to Firestore (see README).
    // Courses fall back to the lessons bundled with the app.
    const list = (v) => (Array.isArray(v) ? v : []);
    const clean = {
      opportunities: (o) => ({ ...o, skills: list(o.skills), requirements: list(o.requirements), title: o.title || '', company: o.company || '', location: o.location || '', type: o.type || '', category: o.category || '', description: o.description || '' }),
      mentors: (m) => ({ ...m, skills: list(m.skills), languages: list(m.languages), availability: list(m.availability), bio: m.bio || '', title: m.title || '' }),
      courses: (c) => ({ ...c, lessons: list(c.lessons) }),
    }[name] || ((x) => x);
    try {
      const snap = await getDocs(collection(db, name));
      if (!snap.empty) return snap.docs.map((d) => clean({ id: d.id, ...d.data() }));
    } catch (e) { console.warn(`Could not read ${name}.`, e.code); }
    return name === 'courses' ? buildCourses() : [];
  },

  // ---------- per-user collections ----------
  subscribe(uid, name, cb) {
    return onSnapshot(colRef(uid, name), (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }))), (e) => console.error(name, e));
  },
  add: guard(async (uid, name, obj) => {
    const data = { createdAt: new Date().toISOString(), ...strip(obj) };
    if (obj.id) { await setDoc(doc(db, 'users', uid, name, obj.id), data); return obj.id; }
    const r = await addDoc(colRef(uid, name), data);
    return r.id;
  }),
  set: guard(async (uid, name, id, obj) => { await setDoc(doc(db, 'users', uid, name, id), strip(obj), { merge: true }); }),
  update: guard(async (uid, name, id, patch) => { await setDoc(doc(db, 'users', uid, name, id), strip(patch), { merge: true }); }),
  remove: guard(async (uid, name, id) => { await deleteDoc(doc(db, 'users', uid, name, id)); }),

  /** Atomic: the sale is created and stock reduced in ONE transaction, so stock can never go negative. */
  recordSale: guard(async (uid, { productId, quantity, customerName }) => {
    const qty = Number(quantity);
    if (!productId) throw fail('sale/product', 'Select a product first.');
    if (!Number.isInteger(qty) || qty < 1) throw fail('sale/qty', 'Quantity must be at least 1.');
    const name = (customerName || '').trim();
    let customerDoc = null;
    if (name) {
      const snap = await getDocs(colRef(uid, 'customers'));
      customerDoc = snap.docs.find((d) => String(d.data().name).toLowerCase() === name.toLowerCase()) || null;
    }
    const pref = doc(db, 'users', uid, 'products', productId);
    const sref = doc(colRef(uid, 'sales'));
    const cref = customerDoc ? customerDoc.ref : (name ? doc(colRef(uid, 'customers')) : null);
    let result;
    await runTransaction(db, async (tx) => {
      const psnap = await tx.get(pref);
      if (!psnap.exists()) throw fail('sale/product', 'That product no longer exists.');
      const product = psnap.data();
      if (qty > Number(product.stock)) throw fail('sale/stock', `Only ${product.stock} in stock for ${product.name}.`);
      const left = Number(product.stock) - qty;
      const total = qty * Number(product.price);
      let csnap = null;
      if (cref && customerDoc) csnap = await tx.get(cref);
      tx.update(pref, { stock: left });
      result = { productId, productName: product.name, quantity: qty, unitPrice: product.price, total, customerName: name, createdAt: new Date().toISOString(), _left: left };
      const { _left, ...saleData } = result;
      tx.set(sref, saleData);
      if (cref) {
        if (csnap && csnap.exists()) tx.update(cref, { totalSpent: Number(csnap.data().totalSpent || 0) + total });
        else tx.set(cref, { name, phone: '', totalSpent: total, createdAt: new Date().toISOString() });
      }
    });
    if (result._left <= 2) {
      await addDoc(colRef(uid, 'notifications'), { title: `Low stock: ${result.productName}`, body: result._left === 0 ? 'Out of stock. Restock to keep selling.' : `Only ${result._left} left.`, read: false, createdAt: new Date().toISOString() });
    }
    const { _left, ...sale } = result;
    return { id: sref.id, ...sale };
  }),

  /** First login: marks the account ready. No sample data is ever written. */
  seedUserData: guard(async (uid) => {
    const snap = await getDoc(doc(db, 'users', uid));
    const p = snap.data() || {};
    await setDoc(doc(db, 'users', uid), { seeded: true, seededAt: new Date().toISOString(), business: p.business?.name !== undefined ? p.business : defaultBusiness(p.location) }, { merge: true });
  }),
  clearBusinessData: guard(async (uid) => { await clearCollections(uid, ['products', 'sales', 'expenses', 'customers']); }),

  /** Free-plan friendly: images are shrunk in the browser and saved as small data in Firestore (no Cloud Storage needed). */
  uploadFile: guard(async (uid, folder, file) => {
    if (!file) return { url: '', name: '' };
    if (!file.type.startsWith('image/')) throw fail('file/type', 'Please choose an image (JPG or PNG).');
    if (file.size > 10 * 1024 * 1024) throw fail('file/size', 'That image is larger than 10 MB.');
    const bmp = await createImageBitmap(file);
    const max = folder === 'avatar' ? 320 : 480;
    const scale = Math.min(1, max / Math.max(bmp.width, bmp.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bmp.width * scale); canvas.height = Math.round(bmp.height * scale);
    canvas.getContext('2d').drawImage(bmp, 0, 0, canvas.width, canvas.height);
    return { url: canvas.toDataURL('image/jpeg', 0.8), name: file.name };
  }),

  submitSupport: guard(async (uid, { subject, message }) => {
    await addDoc(collection(db, 'support'), { uid, subject, message, createdAt: new Date().toISOString() });
  }),

  askAI: guard(async (payload) => {
    // Paid/Blaze setup: secure Cloud Function. Free setup: call Gemini straight from the browser with your own free key.
    if (useCloudFunctions) {
      const res = await httpsCallable(functions, 'askAI')(payload);
      return res.data.text;
    }
    const key = import.meta.env.VITE_GEMINI_API_KEY;
    if (!key) throw fail('ai/no-key', 'Add VITE_GEMINI_API_KEY to your .env to use the assistant.');
    const system = `You are SheBiz AI, a friendly career and small-business assistant for women in South Africa. Use rand (R) for money. Give practical, short answers as a title line followed by 3-5 numbered steps. You are not a lawyer or financial adviser. User context: ${JSON.stringify(payload.context || {}).slice(0, 1500)}`;
    const contents = [
      ...(payload.history || []).slice(-8).map((m) => ({ role: m.role === 'ai' ? 'model' : 'user', parts: [{ text: String(m.text).slice(0, 1500) }] })),
      { role: 'user', parts: [{ text: String(payload.question).slice(0, 500) }] },
    ];
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ systemInstruction: { parts: [{ text: system }] }, contents }),
    });
    if (!res.ok) throw fail('ai/failed', 'The assistant is unavailable right now.');
    const json = await res.json();
    const text = json.candidates?.[0]?.content?.parts?.map((x) => x.text).join('') || '';
    if (!text) throw fail('ai/empty', 'No answer was returned.');
    return text;
  }),
};

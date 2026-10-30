// SheBiz Cloud Functions (2nd gen, Node 20)
//  - sendVerificationCode : creates a 6-digit code, stores only its hash, queues an email
//  - verifyCode           : checks the code, marks the account verified
//  - askAI                : proxies a question to Gemini (key stays on the server)
const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');
const admin = require('firebase-admin');
const crypto = require('crypto');

admin.initializeApp();
const db = admin.firestore();
const GEMINI_KEY = defineSecret('GEMINI_API_KEY');

const CODE_TTL_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const LOCK_MS = 15 * 60 * 1000;
const RESEND_GAP_MS = 60 * 1000;
const MAX_PER_HOUR = 5;

const hash = (uid, code) => crypto.createHash('sha256').update(`${uid}:${code}:${process.env.GCLOUD_PROJECT}`).digest('hex');
const need = (req) => { if (!req.auth) throw new HttpsError('unauthenticated', 'Please sign in first.'); return req.auth; };

exports.sendVerificationCode = onCall({ region: 'us-central1' }, async (req) => {
  const { uid, token } = need(req);
  const email = token.email;
  if (!email) throw new HttpsError('failed-precondition', 'Your account has no email address.');
  if (token.email_verified) return { alreadyVerified: true };

  const ref = db.doc(`verifications/${uid}`);
  const now = Date.now();
  const snap = await ref.get();
  const d = snap.exists ? snap.data() : {};
  if (d.lockedUntil && d.lockedUntil > now) throw new HttpsError('resource-exhausted', 'Too many attempts. Try again in a few minutes.');
  if (d.sentAt && now - d.sentAt < RESEND_GAP_MS) throw new HttpsError('resource-exhausted', 'Please wait a minute before asking for another code.');
  const recent = (d.recent || []).filter((t) => now - t < 3600 * 1000);
  if (recent.length >= MAX_PER_HOUR) throw new HttpsError('resource-exhausted', 'Too many codes requested. Try again later.');

  const code = String(crypto.randomInt(0, 1000000)).padStart(6, '0');
  await ref.set({ codeHash: hash(uid, code), expiresAt: now + CODE_TTL_MS, attempts: 0, sentAt: now, recent: [...recent, now], lockedUntil: 0 });

  // Picked up by the "Trigger Email from Firestore" extension (collection: mail)
  await db.collection('mail').add({
    to: email,
    message: {
      subject: `${code} is your SheBiz verification code`,
      text: `Your SheBiz verification code is ${code}. It expires in 10 minutes. If you did not sign up, ignore this email.`,
      html: `<div style="font-family:Arial,sans-serif;max-width:420px;margin:auto;padding:24px"><h2 style="color:#6938FF">SheBiz</h2><p>Your verification code is</p><p style="font-size:34px;letter-spacing:8px;font-weight:800">${code}</p><p style="color:#666">It expires in 10 minutes. If you did not sign up, ignore this email.</p></div>`,
    },
  });
  return { sent: true };
});

exports.verifyCode = onCall({ region: 'us-central1' }, async (req) => {
  const { uid } = need(req);
  const code = String(req.data?.code || '').trim();
  if (!/^\d{6}$/.test(code)) throw new HttpsError('invalid-argument', 'Enter the 6-digit code.');

  const ref = db.doc(`verifications/${uid}`);
  const result = await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) return { error: 'No code was sent. Request a new one.' };
    const d = snap.data();
    const now = Date.now();
    if (d.lockedUntil && d.lockedUntil > now) return { error: 'Too many wrong attempts. Try again in 15 minutes.' };
    if (d.expiresAt < now) return { error: 'That code has expired. Request a new one.' };
    if (d.codeHash !== hash(uid, code)) {
      const attempts = (d.attempts || 0) + 1;
      tx.update(ref, attempts >= MAX_ATTEMPTS ? { attempts: 0, lockedUntil: now + LOCK_MS } : { attempts });
      return { error: attempts >= MAX_ATTEMPTS ? 'Too many wrong attempts. Try again in 15 minutes.' : `Incorrect code. ${MAX_ATTEMPTS - attempts} attempts left.` };
    }
    tx.delete(ref);
    return { ok: true };
  });
  if (result.error) throw new HttpsError('failed-precondition', result.error);

  await admin.auth().updateUser(uid, { emailVerified: true });
  await db.doc(`users/${uid}`).set({ emailVerified: true }, { merge: true });
  return { verified: true };
});

exports.askAI = onCall({ region: 'us-central1', secrets: [GEMINI_KEY], timeoutSeconds: 30 }, async (req) => {
  need(req);
  const question = String(req.data?.question || '').slice(0, 500).trim();
  if (!question) throw new HttpsError('invalid-argument', 'Ask a question.');
  const ctx = req.data?.context || {};
  const history = Array.isArray(req.data?.history) ? req.data.history.slice(-8) : [];

  const system = `You are SheBiz AI, a friendly career and small-business assistant for women in South Africa. Use rand (R) for money. Give practical, short answers as a title line followed by 3-5 numbered steps. You are not a lawyer or financial adviser; suggest a professional for legal or tax decisions.
User context: ${JSON.stringify(ctx).slice(0, 1500)}`;
  const contents = [
    ...history.map((m) => ({ role: m.role === 'ai' ? 'model' : 'user', parts: [{ text: String(m.text).slice(0, 1500) }] })),
    { role: 'user', parts: [{ text: question }] },
  ];

  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY.value()}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ systemInstruction: { parts: [{ text: system }] }, contents }),
  });
  if (!res.ok) throw new HttpsError('unavailable', 'The assistant is unavailable right now.');
  const json = await res.json();
  const text = json.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') || '';
  if (!text) throw new HttpsError('unavailable', 'No answer was returned.');
  return { text };
});

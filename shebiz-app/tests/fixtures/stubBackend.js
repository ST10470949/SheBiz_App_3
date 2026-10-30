// TEST-ONLY stand-in for firebaseBackend.js, used by vite.visual.config.js so the signed-in screens can be
// opened in a headless browser without a Firebase project. It is never part of the shipped app.
import { buildStarter } from './starter.js';
import { buildOpportunities, buildMentors, buildCourses, DEMO_USER } from './seed.js';

const listeners = new Set();
let user = { uid: 'u1', email: 'tester@example.com', emailVerified: true, displayName: 'Test User', provider: 'password' };
const profile = { ...DEMO_USER.profile, email: user.email, seeded: true, business: { name: 'Sample Test Business', location: 'Gqeberha', description: '', phone: '', social: '', cipc: false, goal: 15000, logoURL: '' } };
const starter = buildStarter({ demo: true });
const cols = Object.fromEntries(Object.entries(starter).map(([k, v]) => [k, v.map((x) => ({ ...x }))]));
const subs = new Map();
let n = 1000;
const emit = (name) => (subs.get(name) || []).forEach((cb) => cb(cols[name].map((x) => ({ ...x }))));
const profSubs = new Set();

export const firebaseBackend = {
  mode: 'firebase', supportsGoogle: false, supportsAI: true,
  async init() {},
  onAuth(cb) { listeners.add(cb); setTimeout(() => cb(user), 0); return () => listeners.delete(cb); },
  async login() { listeners.forEach((f) => f(user)); return user; },
  async register() { return user; },
  async loginGoogle() { return user; },
  async logout() { user = null; listeners.forEach((f) => f(null)); },
  async sendCode() { return { mode: 'link', email: user?.email }; },
  async verifyCode() {}, async reloadUser() { return user; }, async sendResetEmail() { return { sent: true }; },
  async changePassword() {}, async deleteAccount() {},
  subscribeProfile(uid, cb) { profSubs.add(cb); setTimeout(() => cb({ ...profile }), 0); return () => profSubs.delete(cb); },
  async updateProfile(uid, patch) { Object.assign(profile, patch); profSubs.forEach((cb) => cb({ ...profile })); },
  async getGlobal(name) { return ({ opportunities: buildOpportunities, mentors: buildMentors, courses: buildCourses }[name] || (() => []))(); },
  subscribe(uid, name, cb) { if (!subs.has(name)) subs.set(name, []); subs.get(name).push(cb); setTimeout(() => cb((cols[name] || []).map((x) => ({ ...x }))), 0); return () => {}; },
  async add(uid, name, obj) { const id = `t${n++}`; (cols[name] ||= []).push({ id, createdAt: new Date().toISOString(), ...obj }); emit(name); return id; },
  async set(uid, name, id, obj) { const l = (cols[name] ||= []); const i = l.findIndex((x) => x.id === id); if (i >= 0) l[i] = { ...l[i], ...obj }; else l.push({ id, ...obj }); emit(name); },
  async update(uid, name, id, patch) { const l = cols[name] || []; const i = l.findIndex((x) => x.id === id); if (i >= 0) l[i] = { ...l[i], ...patch }; emit(name); },
  async remove(uid, name, id) { cols[name] = (cols[name] || []).filter((x) => x.id !== id); emit(name); },
  async recordSale(uid, { productId, quantity, customerName }) {
    const p = cols.products.find((x) => x.id === productId); const q = Number(quantity);
    if (!p || q > p.stock) throw new Error(`Only ${p?.stock ?? 0} in stock.`);
    p.stock -= q; emit('products');
    const s = { id: `t${n++}`, productId, productName: p.name, quantity: q, unitPrice: p.price, total: q * p.price, customerName: customerName || '', createdAt: new Date().toISOString() };
    cols.sales.push(s); emit('sales'); return s;
  },
  async seedUserData() {}, async clearBusinessData() {},
  async uploadFile() { return { url: '', name: '' }; }, async submitSupport() {},
  async askAI() { return 'Test answer\n1. This is a stub reply used only in visual tests.\n2. Real answers come from Gemini.'; },
};

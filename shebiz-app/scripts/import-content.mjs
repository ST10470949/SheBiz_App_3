// Usage: set GOOGLE_APPLICATION_CREDENTIALS to a service-account key file, then `npm run import-content`.
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
const require = createRequire(new URL('../functions/package.json', import.meta.url));
const admin = require('firebase-admin');

admin.initializeApp();
const db = admin.firestore();
const load = (f) => JSON.parse(readFileSync(new URL(`../content/${f}`, import.meta.url), 'utf8'));
const must = (o, keys, what) => { for (const k of keys) if (!o[k] || (Array.isArray(o[k]) && !o[k].length && k !== 'requirements')) throw new Error(`${what} "${o.id || o.title || o.name}" is missing "${k}"`); };

for (const [file, coll, keys] of [
  ['opportunities.json', 'opportunities', ['id', 'title', 'company', 'location', 'type', 'category', 'deadline', 'description', 'applyUrl']],
  ['mentors.json', 'mentors', ['id', 'name', 'title', 'category', 'bio', 'skills']],
]) {
  const items = load(file);
  for (const it of items) { must(it, keys, coll); const { id, ...rest } = it; await db.collection(coll).doc(id).set(rest); }
  console.log(`${coll}: imported ${items.length}`);
}
process.exit(0);

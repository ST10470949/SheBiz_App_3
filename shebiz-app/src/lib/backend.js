import { hasFirebase } from './config.js';

/** SheBiz runs on Firebase only: real accounts, real emails, real data. */
export async function loadBackend() {
  if (!hasFirebase) {
    throw Object.assign(new Error('Firebase is not configured.'), { code: 'setup/missing-config' });
  }
  const { firebaseBackend } = await import('./firebaseBackend.js');
  return firebaseBackend;
}

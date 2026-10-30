import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { loadBackend } from '../lib/backend.js';
import { COLLECTIONS } from '../lib/starter.js';

const Ctx = createContext(null);
export const useApp = () => useContext(Ctx);

const emptyCols = () => Object.fromEntries(COLLECTIONS.map((c) => [c, []]));

export function AppProvider({ children }) {
  const [backend, setBackend] = useState(null);
  const [bootError, setBootError] = useState(null);
  const [user, setUser] = useState(undefined); // undefined = still checking, null = signed out
  const [profile, setProfile] = useState(null);
  const [cols, setCols] = useState(emptyCols());
  const [glob, setGlob] = useState({ opportunities: [], mentors: [], courses: [], loaded: false });
  const [ready, setReady] = useState(false);
  const seeding = useRef(false);

  useEffect(() => {
    let off = false;
    loadBackend().then((b) => { if (!off) setBackend(b); }).catch((e) => { console.error(e); if (!off) setBootError(e); });
    return () => { off = true; };
  }, []);

  useEffect(() => {
    if (!backend) return undefined;
    return backend.onAuth((u) => setUser(u));
  }, [backend]);

  const uid = user?.uid;
  const verified = !!user?.emailVerified;

  // live subscriptions once the user is signed in AND verified
  useEffect(() => {
    if (!backend || !uid || !verified) { setProfile(null); setCols(emptyCols()); setReady(false); return undefined; }
    const unsubs = [];
    unsubs.push(backend.subscribeProfile(uid, (p) => { setProfile(p); setReady(true); }));
    COLLECTIONS.forEach((name) => {
      unsubs.push(backend.subscribe(uid, name, (items) => setCols((c) => ({ ...c, [name]: items }))));
    });
    return () => unsubs.forEach((u) => u && u());
  }, [backend, uid, verified]);

  useEffect(() => {
    if (!backend || !uid || !verified) return undefined;
    let off = false;
    Promise.all([backend.getGlobal('opportunities'), backend.getGlobal('mentors'), backend.getGlobal('courses')]).then(([opportunities, mentors, courses]) => {
      if (!off) setGlob({ opportunities, mentors, courses, loaded: true });
    });
    return () => { off = true; };
  }, [backend, uid, verified]);

  // first login: mark the account as set up (starts empty, no sample data)
  useEffect(() => {
    if (!backend || !uid || !profile || profile.seeded !== false || seeding.current) return;
    seeding.current = true;
    backend.seedUserData(uid).catch((e) => console.error('seed failed', e)).finally(() => { seeding.current = false; });
  }, [backend, uid, profile]);

  const api = useMemo(() => {
    if (!backend || !uid) return null;
    return {
      add: (name, obj) => backend.add(uid, name, obj),
      set: (name, id, obj) => backend.set(uid, name, id, obj),
      update: (name, id, patch) => backend.update(uid, name, id, patch),
      remove: (name, id) => backend.remove(uid, name, id),
      recordSale: (p) => backend.recordSale(uid, p),
      updateProfile: (patch) => backend.updateProfile(uid, patch),
      uploadFile: (folder, file) => backend.uploadFile(uid, folder, file),
      submitSupport: (p) => backend.submitSupport(uid, p),
      clearBusinessData: () => backend.clearBusinessData(uid),
      notify: (title, body) => backend.add(uid, 'notifications', { title, body, read: false }),
    };
  }, [backend, uid]);

  const refreshUser = useCallback(async () => (backend ? backend.reloadUser() : null), [backend]);

  const value = useMemo(() => ({
    backend, bootError, user, profile, cols, glob, api, ready, refreshUser,
    ...cols,
  }), [backend, bootError, user, profile, cols, glob, api, ready, refreshUser]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

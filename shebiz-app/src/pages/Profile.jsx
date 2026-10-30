import React, { useEffect, useMemo, useRef, useState } from 'react';
import Icon from '../components/Icon.jsx';
import { Avatar, Confirm, Field, Modal, PageHeader, Progress, Skeleton, Spinner, useToast } from '../components/ui.jsx';
import { useApp } from '../state/store.jsx';
import { profileCompletion, validPhone } from '../lib/metrics.js';

const uid = () => (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`);
const TONES = ['purple', 'coral', 'gold', 'green'];
const SUGGESTED = ['Software Development', 'Business', 'Finance', 'Marketing', 'Design', 'Data & Analytics', 'Leadership', 'Education', 'Healthcare', 'Hospitality'];

// ---------- skill ----------
function SkillModal({ skill, onClose }) {
  const { profile, api } = useApp();
  const toast = useToast();
  const [name, setName] = useState(skill?.name || '');
  const [level, setLevel] = useState(skill?.level ?? 50);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const save = async (e) => {
    e.preventDefault();
    const n = name.trim();
    if (!n) { setErr('Enter a skill name.'); return; }
    if ((profile.skills || []).some((s) => s.name.toLowerCase() === n.toLowerCase() && s.id !== skill?.id)) { setErr('You already have that skill. Edit it instead.'); return; }
    setBusy(true);
    try {
      const list = skill ? profile.skills.map((s) => (s.id === skill.id ? { ...s, name: n, level: Number(level) } : s)) : [...(profile.skills || []), { id: uid(), name: n, level: Number(level) }];
      await api.updateProfile({ skills: list });
      toast.success(skill ? 'Skill updated' : `${n} added`); onClose();
    } catch (x) { toast.error(x.message); } finally { setBusy(false); }
  };
  return (
    <Modal title={skill ? 'Edit skill' : 'Add skill'} onClose={onClose} width={440} footer={<><button className="btn btn-ghost" onClick={onClose}>Cancel</button><button className="btn" form="skill-form" disabled={busy}>{busy ? <Spinner /> : 'Save skill'}</button></>}>
      <form id="skill-form" className="stack" onSubmit={save} noValidate>
        <Field label="Skill" error={err}><input value={name} onChange={(e) => { setName(e.target.value); setErr(''); }} placeholder="e.g. JavaScript" maxLength={30} /></Field>
        <div className="field"><label htmlFor="lvl">Level: <b className="c-purple">{level}%</b></label><input id="lvl" className="slider" type="range" min="0" max="100" step="1" value={level} onChange={(e) => setLevel(e.target.value)} /></div>
      </form>
    </Modal>
  );
}

// ---------- education / achievements ----------
function ListItemModal({ kind, item, onClose }) {
  const { profile, api } = useApp();
  const toast = useToast();
  const isEdu = kind === 'education';
  const key = isEdu ? 'education' : 'achievements';
  const [f, setF] = useState(isEdu ? { institution: item?.institution || '', qualification: item?.qualification || '', year: item?.year || '' } : { title: item?.title || '', description: item?.description || '' });
  const [errs, setErrs] = useState({});
  const [busy, setBusy] = useState(false);
  const save = async (e) => {
    e.preventDefault();
    const er = {};
    if (isEdu) {
      if (!f.institution.trim()) er.institution = 'Enter the institution.';
      if (!f.qualification.trim()) er.qualification = 'Enter your qualification.';
      if (f.year && !/^(19|20)\d{2}$/.test(String(f.year).trim())) er.year = 'Use a 4-digit year, e.g. 2025.';
    } else if (!f.title.trim()) er.title = 'Enter a title.';
    setErrs(er); if (Object.keys(er).length) return;
    setBusy(true);
    try {
      const clean = Object.fromEntries(Object.entries(f).map(([k, v]) => [k, String(v).trim()]));
      const cur = profile[key] || [];
      const list = item ? cur.map((x) => (x.id === item.id ? { ...x, ...clean } : x)) : [...cur, { id: uid(), ...clean }];
      await api.updateProfile({ [key]: list });
      toast.success(item ? 'Updated' : 'Added'); onClose();
    } catch (x) { toast.error(x.message); } finally { setBusy(false); }
  };
  return (
    <Modal title={`${item ? 'Edit' : 'Add'} ${isEdu ? 'education' : 'achievement'}`} onClose={onClose} footer={<><button className="btn btn-ghost" onClick={onClose}>Cancel</button><button className="btn" form="li-form" disabled={busy}>{busy ? <Spinner /> : 'Save'}</button></>}>
      <form id="li-form" className="stack" onSubmit={save} noValidate>
        {isEdu ? (
          <>
            <Field label="Institution" error={errs.institution}><input value={f.institution} onChange={(e) => setF({ ...f, institution: e.target.value })} placeholder="Nelson Mandela University" /></Field>
            <Field label="Qualification" error={errs.qualification}><input value={f.qualification} onChange={(e) => setF({ ...f, qualification: e.target.value })} placeholder="Diploma in Information Technology" /></Field>
            <Field label="Year" error={errs.year}><input value={f.year} onChange={(e) => setF({ ...f, year: e.target.value })} placeholder="2025" inputMode="numeric" maxLength={4} /></Field>
          </>
        ) : (
          <>
            <Field label="Title" error={errs.title}><input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="Web Development Certificate" /></Field>
            <Field label="Description"><input value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} placeholder="Completed course" /></Field>
          </>
        )}
      </form>
    </Modal>
  );
}

// ---------- photo ----------
function PhotoModal({ onClose }) {
  const { profile, api } = useApp();
  const toast = useToast();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);
  const pick = (e) => {
    const x = e.target.files?.[0]; if (!x) return;
    if (!x.type.startsWith('image/')) { setErr('Please choose an image (JPG or PNG).'); return; }
    if (x.size > 10 * 1024 * 1024) { setErr('That image is larger than 10 MB.'); return; }
    setErr(''); setFile(x); setPreview(URL.createObjectURL(x));
  };
  const save = async () => {
    setBusy(true);
    try { const up = await api.uploadFile('avatar', file); await api.updateProfile({ photoURL: up.url }); toast.success('Photo updated'); onClose(); } catch (x) { toast.error(x.message); } finally { setBusy(false); }
  };
  const remove = async () => {
    setBusy(true);
    try { await api.updateProfile({ photoURL: '' }); toast.success('Photo removed'); onClose(); } catch (x) { toast.error(x.message); } finally { setBusy(false); }
  };
  return (
    <Modal title="Change photo" onClose={onClose} width={440}
      footer={<>{profile.photoURL && <button className="btn btn-ghost" onClick={remove} disabled={busy} style={{ marginRight: 'auto' }}>Remove photo</button>}<button className="btn btn-ghost" onClick={onClose}>Cancel</button><button className="btn" onClick={save} disabled={!file || busy}>{busy ? <Spinner /> : 'Save photo'}</button></>}>
      <div className="center stack" style={{ alignItems: 'center' }}>
        <Avatar name={profile.fullName} photo={preview || profile.photoURL} size={140} tint="blush" />
        <Field label="Choose an image" error={err} hint="JPG or PNG, up to 10 MB"><input type="file" accept="image/*" onChange={pick} /></Field>
      </div>
    </Modal>
  );
}

export default function Profile() {
  const { profile, user, ready, api } = useApp();
  const toast = useToast();
  const [draft, setDraft] = useState(null);
  const [errs, setErrs] = useState({});
  const [saving, setSaving] = useState(false);
  const [modal, setModal] = useState(null); // {type, item}
  const [custom, setCustom] = useState('');
  const refs = { fullName: useRef(null), location: useRef(null), phone: useRef(null), interests: useRef(null) };

  const base = useMemo(() => (profile ? { fullName: profile.fullName || '', location: profile.location || '', phone: profile.phone || '', careerInterests: profile.careerInterests || [] } : null), [profile]);
  useEffect(() => { if (base) setDraft((d) => d || base); }, [base]);

  const dirty = !!(draft && base) && JSON.stringify(draft) !== JSON.stringify(base);
  const completion = useMemo(() => (profile ? profileCompletion(profile) : null), [profile]);

  if (!ready || !profile || !draft) return <><PageHeader title="My profile" /><Skeleton h={160} r={24} /></>;

  const set = (k) => (e) => { setDraft({ ...draft, [k]: e.target.value }); if (errs[k]) setErrs({ ...errs, [k]: undefined }); };
  const toggleInterest = (i) => setDraft({ ...draft, careerInterests: draft.careerInterests.includes(i) ? draft.careerInterests.filter((x) => x !== i) : [...draft.careerInterests, i] });
  const addCustom = () => { const v = custom.trim(); if (v && !draft.careerInterests.some((x) => x.toLowerCase() === v.toLowerCase())) setDraft({ ...draft, careerInterests: [...draft.careerInterests, v] }); setCustom(''); };

  const save = async () => {
    const er = {};
    if (draft.fullName.trim().length < 2) er.fullName = 'Enter your full name.';
    if (draft.phone.trim() && !validPhone(draft.phone)) er.phone = 'Use a South African number, e.g. +27 71 234 5678.';
    if (!draft.location.trim()) er.location = 'Enter your town or city.';
    setErrs(er); if (Object.keys(er).length) { toast.error('Please fix the highlighted fields.'); return; }
    setSaving(true);
    try {
      await api.updateProfile({ fullName: draft.fullName.trim(), location: draft.location.trim(), phone: draft.phone.trim(), careerInterests: draft.careerInterests });
      toast.success('Profile updated');
    } catch (x) { toast.error(x.message); } finally { setSaving(false); }
  };

  const goMissing = () => {
    const i = completion.missingIndex;
    if (i < 0) { toast.success('Your profile is complete!'); return; }
    if (i === 1) setModal({ type: 'photo' });
    else if (i === 5) setModal({ type: 'skill' });
    else if (i === 6) setModal({ type: 'education' });
    else if (i === 7) setModal({ type: 'achievement' });
    else { const r = [refs.fullName, null, refs.location, refs.phone, refs.interests][i]; r?.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }); r?.current?.focus?.(); }
  };
  const delItem = async () => {
    const { type, item } = modal;
    try {
      if (type === 'delSkill') await api.updateProfile({ skills: profile.skills.filter((s) => s.id !== item.id) });
      if (type === 'delEdu') await api.updateProfile({ education: profile.education.filter((s) => s.id !== item.id) });
      if (type === 'delAch') await api.updateProfile({ achievements: profile.achievements.filter((s) => s.id !== item.id) });
      toast.success('Removed');
    } catch (x) { toast.error(x.message); }
    setModal(null);
  };

  const skills = profile.skills || []; const education = profile.education || []; const achievements = profile.achievements || [];
  const shownInterests = [...new Set([...SUGGESTED.slice(0, 6), ...draft.careerInterests])];

  return (
    <>
      <PageHeader title="My profile" subtitle="Keep your skills, experience and interests up to date.">
        <button className="btn" onClick={save} disabled={!dirty || saving}>{saving ? <Spinner /> : 'Save changes'}</button>
      </PageHeader>

      <div className="card" style={{ marginBottom: 24 }}>
        <div className="profile-hero">
          <Avatar name={profile.fullName} photo={profile.photoURL} size={108} tint="blush" float />
          <div className="grow" style={{ minWidth: 220 }}>
            <h2 style={{ fontSize: 28 }}>{profile.fullName}</h2>
            <p className="muted" style={{ margin: '6px 0 14px' }}>{[profile.location, profile.phone, profile.email || user.email].filter(Boolean).join(' · ')}</p>
            <button className="pill pill-lav" onClick={goMissing} style={{ border: 0, cursor: 'pointer' }} title={completion.missing || 'Profile complete'}>{completion.pct}% complete{completion.missing ? `. Next: ${completion.missing.toLowerCase()}` : ''}</button>
          </div>
          <button className="btn btn-soft" onClick={() => setModal({ type: 'photo' })}><Icon name="image" size={16} /> Change photo</button>
        </div>
        <div style={{ marginTop: 18 }}><Progress value={completion.pct} label="Profile completion" /></div>
      </div>

      <div className="split-1-1" style={{ marginBottom: 24, alignItems: 'start' }}>
        <div className="card">
          <h2>Personal information</h2>
          <div className="stack" style={{ gap: 16 }}>
            <div className="form-grid">
              <Field label="Full name" error={errs.fullName}><input ref={refs.fullName} value={draft.fullName} onChange={set('fullName')} autoComplete="name" /></Field>
              <Field label="Location" error={errs.location}><input ref={refs.location} value={draft.location} onChange={set('location')} autoComplete="address-level2" /></Field>
            </div>
            <div className="field" ref={refs.interests} tabIndex={-1}>
              <label>Career interests</label>
              <div className="chips">
                {shownInterests.map((i) => {
                  const on = draft.careerInterests.includes(i);
                  return <button type="button" key={i} className="chip" aria-pressed={on} onClick={() => toggleInterest(i)} style={on ? { background: 'var(--purple)', color: '#fff' } : { background: '#f6f4fa', color: 'var(--muted)' }}>{on && <Icon name="check" size={13} stroke={3} />}{i}</button>;
                })}
              </div>
              <div className="row" style={{ marginTop: 8 }}>
                <input value={custom} onChange={(e) => setCustom(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustom(); } }} placeholder="Add another interest" aria-label="Add another career interest" maxLength={30} />
                <button type="button" className="btn btn-soft" onClick={addCustom} disabled={!custom.trim()}>Add</button>
              </div>
            </div>
            <Field label="Contact details (phone)" error={errs.phone}><input ref={refs.phone} type="tel" value={draft.phone} onChange={set('phone')} placeholder="+27 71 234 5678" autoComplete="tel" /></Field>
          </div>
        </div>

        <div className="card" id="skills">
          <div className="card-head"><h2 style={{ margin: 0 }}>Skills</h2><button className="btn btn-soft btn-sm" onClick={() => setModal({ type: 'skill' })}>+ Add skill</button></div>
          {skills.length === 0 && <EmptySkills onAdd={() => setModal({ type: 'skill' })} />}
          {skills.map((s, i) => (
            <div className="skill-row" key={s.id}>
              <b>{s.name}</b>
              <Progress value={s.level} tone={TONES[i % 4]} label={`${s.name} ${s.level}%`} />
              <span className="muted small">{s.level}%</span>
              <span className="acts">
                <button className="mini-btn" onClick={() => setModal({ type: 'skill', item: s })} aria-label={`Edit ${s.name}`}><Icon name="edit" size={15} /></button>
                <button className="mini-btn danger" onClick={() => setModal({ type: 'delSkill', item: s })} aria-label={`Remove ${s.name}`}><Icon name="x" size={15} /></button>
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="split-1-1" style={{ alignItems: 'start' }}>
        <div className="card">
          <div className="card-head"><h2 style={{ margin: 0 }}>Education</h2><button className="btn btn-soft btn-sm" onClick={() => setModal({ type: 'education' })}>+ Add</button></div>
          {education.length === 0 && <p className="muted">Add your school, college or university.</p>}
          {education.map((e) => (
            <div className="kv" key={e.id}>
              <div><strong style={{ fontSize: 16 }}>{e.institution}</strong><div className="muted">{e.qualification}</div></div>
              <div className="row" style={{ gap: 4 }}>
                {e.year && <b className="c-purple" style={{ marginRight: 8 }}>{e.year}</b>}
                <button className="mini-btn" onClick={() => setModal({ type: 'education', item: e })} aria-label={`Edit ${e.institution}`}><Icon name="edit" size={15} /></button>
                <button className="mini-btn danger" onClick={() => setModal({ type: 'delEdu', item: e })} aria-label={`Remove ${e.institution}`}><Icon name="trash" size={15} /></button>
              </div>
            </div>
          ))}
          {draft.careerInterests.length > 0 && (
            <div style={{ marginTop: 16 }}><div className="label-s" style={{ marginBottom: 8 }}>Career interests</div><div className="muted">{draft.careerInterests.join(' · ')}</div></div>
          )}
        </div>
        <div className="card">
          <div className="card-head"><h2 style={{ margin: 0 }}>Achievements</h2><button className="btn btn-soft btn-sm" onClick={() => setModal({ type: 'achievement' })}>+ Add</button></div>
          {achievements.length === 0 && <p className="muted">Add certificates, awards or projects you are proud of.</p>}
          {achievements.map((a) => (
            <div className="row" key={a.id} style={{ gap: 16, padding: '10px 0' }}>
              <span className="badge-tile"><Icon name="checkCircle" size={26} /></span>
              <div className="grow"><strong>{a.title}</strong><div className="muted small">{a.description}</div></div>
              <button className="mini-btn" onClick={() => setModal({ type: 'achievement', item: a })} aria-label={`Edit ${a.title}`}><Icon name="edit" size={15} /></button>
              <button className="mini-btn danger" onClick={() => setModal({ type: 'delAch', item: a })} aria-label={`Remove ${a.title}`}><Icon name="trash" size={15} /></button>
            </div>
          ))}
        </div>
      </div>

      {modal?.type === 'skill' && <SkillModal skill={modal.item} onClose={() => setModal(null)} />}
      {modal?.type === 'education' && <ListItemModal kind="education" item={modal.item} onClose={() => setModal(null)} />}
      {modal?.type === 'achievement' && <ListItemModal kind="achievement" item={modal.item} onClose={() => setModal(null)} />}
      {modal?.type === 'photo' && <PhotoModal onClose={() => setModal(null)} />}
      {['delSkill', 'delEdu', 'delAch'].includes(modal?.type) && <Confirm title="Remove this item?" message={`${modal.item.name || modal.item.institution || modal.item.title} will be removed from your profile.`} confirmLabel="Remove" danger onConfirm={delItem} onClose={() => setModal(null)} />}
    </>
  );
}

function EmptySkills({ onAdd }) {
  return <div className="center stack" style={{ alignItems: 'center', padding: '20px 0' }}><p className="muted">Add the skills you have so SheBiz can match you with the right opportunities.</p><button className="btn btn-sm" onClick={onAdd}>+ Add your first skill</button></div>;
}

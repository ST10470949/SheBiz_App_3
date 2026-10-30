import React, { useEffect, useMemo, useRef, useState } from 'react';
import Icon from '../components/Icon.jsx';
import { Avatar, Drawer, Field, Modal, Pill, Spinner, useToast } from '../components/ui.jsx';
import { useApp } from '../state/store.jsx';

export const GOALS = ['Career development', 'Interview preparation', 'Learn a new skill', 'Grow my business', 'Leadership & confidence', 'Finances & budgeting'];
export const TINTS = ['lav', 'blush', 'cream'];
export const tintFor = (mentor, list) => TINTS[Math.max(0, list.findIndex((m) => m.id === mentor.id)) % 3];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** Turns weekly slots like "Mon 17:30" into the next real dates. */
export function nextSlots(availability, count = 6, now = new Date()) {
  const out = [];
  for (let d = 0; d < 28 && out.length < count; d++) {
    const day = new Date(now); day.setDate(now.getDate() + d);
    for (const slot of availability) {
      const [dn, hm] = slot.split(' ');
      if (DAYS[day.getDay()] !== dn) continue;
      const [h, m] = hm.split(':').map(Number);
      const at = new Date(day); at.setHours(h, m, 0, 0);
      if (at > now) out.push({ iso: at.toISOString(), label: fmtWhen(at.toISOString(), true) });
    }
  }
  return out.sort((a, b) => a.iso.localeCompare(b.iso)).slice(0, count);
}

export function fmtWhen(iso, full = false) {
  if (!iso) return '';
  const d = new Date(iso);
  const time = d.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit', hour12: false });
  const days = (d - new Date()) / 86400000;
  const wd = d.toLocaleDateString('en-ZA', { weekday: 'long' });
  if (!full && days < 7 && days > -1) return `${wd}, ${time}`;
  return `${d.toLocaleDateString('en-ZA', { weekday: 'short', day: 'numeric', month: 'short' })}, ${time}`;
}

export const mentorshipFor = (mentorId, mentorships) => mentorships.find((m) => m.mentorId === mentorId);

export function StatusPill({ m }) {
  if (!m) return <Pill tone="green">Available</Pill>;
  if (m.status === 'Connected') return <Pill tone="lav">Connected</Pill>;
  if (m.status === 'Requested') return <Pill tone="coral">Requested</Pill>;
  return <Pill tone="green">Available</Pill>;
}

// ---- request modal ----
export function RequestModal({ mentor, onClose }) {
  const { api } = useApp();
  const toast = useToast();
  const slots = useMemo(() => nextSlots(mentor.availability, 6), [mentor]);
  const [goal, setGoal] = useState('');
  const [slot, setSlot] = useState(slots[0]?.iso || '');
  const [message, setMessage] = useState('');
  const [err, setErr] = useState({});
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    const er = {}; if (!goal) er.goal = 'Choose what you want help with.'; if (!slot) er.slot = 'Pick a preferred time.';
    setErr(er); if (Object.keys(er).length) return;
    setBusy(true);
    try {
      await api.add('mentorships', { mentorId: mentor.id, mentorName: mentor.name, status: 'Requested', goal, preferredSlot: slot, message: message.trim(), nextCheckIn: '' });
      await api.notify('Mentorship request sent', `Your request to ${mentor.name} is on its way.`);
      toast.success(`Request sent to ${mentor.name}`); onClose();
    } catch (x) { toast.error(x.message); } finally { setBusy(false); }
  };
  return (
    <Modal title={`Request mentorship from ${mentor.name}`} onClose={onClose} footer={<><button className="btn btn-ghost" onClick={onClose}>Cancel</button><button className="btn" form="req-form" disabled={busy}>{busy ? <Spinner /> : 'Send request'}</button></>}>
      <form id="req-form" className="stack" onSubmit={submit} noValidate>
        <Field label="What do you want help with?" error={err.goal}>
          <select value={goal} onChange={(e) => setGoal(e.target.value)}><option value="">Select a goal</option>{GOALS.map((g) => <option key={g}>{g}</option>)}</select>
        </Field>
        <Field label="Preferred first session" error={err.slot}>
          <select value={slot} onChange={(e) => setSlot(e.target.value)}>{slots.map((s) => <option key={s.iso} value={s.iso}>{s.label}</option>)}</select>
        </Field>
        <Field label="Message (optional)"><textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder={`Hi ${mentor.name.split(' ')[0]}, I would love your guidance on...`} maxLength={600} /></Field>
      </form>
    </Modal>
  );
}

// ---- book / reschedule modal ----
export function BookModal({ mentor, existing, onClose, reschedule }) {
  const { api } = useApp();
  const toast = useToast();
  const slots = useMemo(() => nextSlots(mentor.availability, 8), [mentor]);
  const [slot, setSlot] = useState(slots[0]?.iso || '');
  const [goal, setGoal] = useState(existing?.goal || GOALS[0]);
  const [busy, setBusy] = useState(false);
  const save = async () => {
    if (!slot) return;
    setBusy(true);
    try {
      if (existing) await api.update('mentorships', existing.id, { nextCheckIn: slot, goal });
      else await api.add('mentorships', { mentorId: mentor.id, mentorName: mentor.name, status: 'Requested', goal, preferredSlot: slot, nextCheckIn: slot });
      await api.notify(reschedule ? 'Check-in rescheduled' : 'Session requested', `${mentor.name} · ${fmtWhen(slot, true)}`);
      toast.success(reschedule ? 'Check-in rescheduled' : `Session requested for ${fmtWhen(slot, true)}`); onClose();
    } catch (x) { toast.error(x.message); } finally { setBusy(false); }
  };
  return (
    <Modal title={reschedule ? `Reschedule with ${mentor.name}` : `Book a session with ${mentor.name}`} onClose={onClose} footer={<><button className="btn btn-ghost" onClick={onClose}>Cancel</button><button className="btn" onClick={save} disabled={busy || !slot}>{busy ? <Spinner /> : reschedule ? 'Confirm new time' : 'Request session'}</button></>}>
      <Field label="Focus of the session"><select value={goal} onChange={(e) => setGoal(e.target.value)}>{GOALS.map((g) => <option key={g}>{g}</option>)}</select></Field>
      <div role="radiogroup" aria-label="Available times" className="stack" style={{ gap: 8 }}>
        <strong style={{ fontSize: 13 }}>Choose a time</strong>
        {slots.map((s) => (
          <button type="button" key={s.iso} role="radio" aria-checked={slot === s.iso} className="check-card" onClick={() => setSlot(s.iso)}>
            <span className="box">{slot === s.iso && <Icon name="check" size={13} stroke={3} />}</span><Icon name="calendar" size={16} /> {s.label}
          </button>
        ))}
      </div>
    </Modal>
  );
}

// ---- call modal (honest: no video calling in this version) ----
export function CallModal({ mentor, onClose, onMessage }) {
  return (
    <Modal title="Video calls are not available yet" onClose={onClose} width={440}
      footer={<><button className="btn btn-ghost" onClick={onClose}>Close</button><button className="btn" onClick={onMessage}>Open Messages</button></>}>
      <div className="center stack" style={{ alignItems: 'center', padding: '10px 0' }}>
        <Avatar name={mentor.name} tint="lav" size={84} float />
        <p className="muted">Live video is not part of SheBiz yet. Send {mentor.name.split(' ')[0]} a message to agree on a meeting link (Google Meet, Zoom or WhatsApp) for your session.</p>
      </div>
    </Modal>
  );
}

// ---- chat drawer ----
export function ChatDrawer({ mentor, onClose }) {
  const { messages, api } = useApp();
  const toast = useToast();
  const [text, setText] = useState('');
  const end = useRef(null);
  const list = useMemo(() => messages.filter((m) => m.mentorId === mentor.id).sort((a, b) => String(a.createdAt).localeCompare(String(b.createdAt))), [messages, mentor.id]);
  useEffect(() => { end.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }); }, [list.length]);

  const send = async (e) => {
    e.preventDefault();
    const t = text.trim(); if (!t) return;
    setText('');
    try {
      await api.add('messages', { mentorId: mentor.id, senderId: 'me', text: t });
    } catch (x) { toast.error(x.message); setText(t); }
  };
  return (
    <Drawer title={mentor.name} onClose={onClose} width={480}>
      <div className="row" style={{ gap: 12 }}><Avatar name={mentor.name} tint="lav" size={44} /><div><strong>{mentor.name}</strong><div className="muted small">{mentor.title}</div></div></div>
      <p className="small muted" style={{ background: 'var(--cream)', padding: '8px 12px', borderRadius: 10 }}>Your messages are saved. Your mentor will reply here once they have accepted your request.</p>
      <div className="chat-bubbles" aria-live="polite">
        {list.length === 0 && <p className="muted center" style={{ padding: 24 }}>Say hello to {mentor.name.split(' ')[0]} 👋</p>}
        {list.map((m) => (
          <div key={m.id} className={`cb ${m.senderId === 'me' ? 'cb-me' : 'cb-them'}`}>{m.text}<small>{new Date(m.createdAt).toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit', hour12: false })}</small></div>
        ))}
        <div ref={end} />
      </div>
      <form className="chat-input" onSubmit={send}>
        <input className="input" value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a message" aria-label="Message" maxLength={1000} />
        <button className="btn" disabled={!text.trim()} aria-label="Send message"><Icon name="arrow" size={18} /></button>
      </form>
    </Drawer>
  );
}

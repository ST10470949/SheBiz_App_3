import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import { Modal, useToast } from '../components/ui.jsx';
import { useApp } from '../state/store.jsx';
import { GOALS, MENTOR_FORMATS, demoStore } from './data.js';
import { EnquiryModal, Portrait, SampleBadge } from './components.jsx';

export const rand = (n) => `R${Number(n).toLocaleString('en-ZA', { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 })}`;
export const priceLabel = (m) => (m.price > 0 ? `${rand(m.price)} per session (illustrative)` : 'Free mentorship');

export function useMentorRequests() {
  const [list, setList] = useState(() => demoStore.get('mentorRequests', []));
  const add = (r) => { const n = [{ id: `${Date.now()}`, createdAt: new Date().toISOString(), ...r }, ...list]; setList(n); demoStore.set('mentorRequests', n); };
  const remove = (id) => { const n = list.filter((x) => x.id !== id); setList(n); demoStore.set('mentorRequests', n); };
  return { list, add, remove };
}

/** Mentor card used on the Mentorship page and elsewhere. Works for sample and real (Firestore) mentors. */
export function MentorCard({ m, onRequest }) {
  const { user } = useApp();
  const nav = useNavigate();
  const signedIn = !!user?.emailVerified;
  const toProfile = () => (m.sample ? nav(`/mentors/${m.id}`) : nav(signedIn ? `/mentorship/${m.id}` : '/register'));
  return (
    <article className="mentor-s">
      <div className="ms-top">
        <Portrait skin={m.skin} tint={m.tint || 'lav'} size={84} label={`Illustration for ${m.name}`} />
        <div>
          {m.sample ? <SampleBadge>Sample profile</SampleBadge> : <span className="real-pill">SheBiz mentor</span>}
          <h3>{m.name}</h3><p className="ms-role">{m.role}</p>
        </div>
      </div>
      <div className="chips">{m.expertise.slice(0, 3).map((e) => <span className="tag-l" key={e}>{e}</span>)}</div>
      <p className="ms-bio">{m.bio}</p>
      <ul className="o-meta"><li><Icon name="briefcase" size={14} /> {m.industry}</li><li><Icon name="video" size={14} /> {m.format}</li><li><Icon name="clock" size={14} /> {m.availability || 'Availability on request'}</li></ul>
      <div className="ms-price">{m.price > 0 ? <><b>{rand(m.price)}</b> <span>illustrative price</span></> : <b>Free mentorship</b>}</div>
      <div className="o-actions"><button className="btn btn-lav btn-sm" onClick={toProfile}>View Profile</button><button className="btn btn-pink btn-sm" onClick={() => (m.sample || !signedIn ? onRequest(m) : nav(`/mentorship/${m.id}`))}>Request Mentorship</button></div>
    </article>
  );
}

export function RequestModal({ mentor, onClose, onDone }) {
  return (
    <EnquiryModal
      title={`Request mentorship from ${mentor.name}`}
      intro="Tell the mentor what you would like help with."
      fields={[
        { name: 'goal', label: 'What do you want help with?', type: 'select', options: GOALS, required: true },
        { name: 'format', label: 'Preferred format', type: 'select', options: MENTOR_FORMATS, initial: mentor.format, required: true },
        { name: 'message', label: 'Message', type: 'textarea', required: true, min: 20, placeholder: `Hi ${mentor.name.split(' ')[0]}, I would love your guidance on...`, hint: 'At least 20 characters.' },
      ]}
      submitLabel="Send request"
      confirmTitle="Request recorded"
      confirmText={`Your request to ${mentor.name} is saved with the status "Submitted (preview)".`}
      onClose={onClose}
      onSubmit={(v) => onDone({ mentorId: mentor.id, mentorName: mentor.name, goal: v.goal, format: v.format, status: 'Submitted (preview)', sample: !!mentor.sample })}
    />
  );
}

const SESSIONS = [['Intro chat', 30, 0.5], ['Mentoring session', 60, 1], ['Deep-dive workshop', 90, 1.6]];

export function BookingModal({ mentor, onClose, onDone }) {
  const toast = useToast();
  const [step, setStep] = useState(1);
  const [sel, setSel] = useState(1);
  const base = mentor.price > 0 ? mentor.price : 350;
  const [, minutes, mult] = SESSIONS[sel];
  const price = Math.round(base * mult);
  const rate = 0.15;
  const fee = Math.round(price * rate * 100) / 100;

  const confirm = () => { onDone({ mentorId: mentor.id, mentorName: mentor.name, goal: `${SESSIONS[sel][0]} (${minutes} min)`, status: 'Booking requested (preview)', price, sample: true }); toast.success('Booking request saved in this preview'); setStep(3); };

  return (
    <Modal title={step === 3 ? 'Booking request recorded' : `Book ${mentor.name}`} onClose={onClose} width={520}
      footer={step === 1 ? <><button className="btn btn-ghost" onClick={onClose}>Cancel</button><button className="btn btn-pink" onClick={() => setStep(2)}>Review booking</button></>
        : step === 2 ? <><button className="btn btn-ghost" onClick={() => setStep(1)}>Back</button><button className="btn btn-pink" onClick={confirm}>Confirm preview booking</button></>
          : <button className="btn" onClick={onClose}>Close</button>}>
      <ol className="steps-s" aria-label="Booking steps">{['Choose', 'Review', 'Confirmation'].map((s, i) => <li key={s} className={step > i ? 'done' : step === i + 1 ? 'cur' : ''}>{s}</li>)}</ol>
      {step === 1 && (
        <div role="radiogroup" aria-label="Session type" className="stack" style={{ gap: 10 }}>
          {SESSIONS.map(([name, min, mu], i) => (
            <button type="button" role="radio" aria-checked={sel === i} key={name} className={`opt-card ${sel === i ? 'on' : ''}`} onClick={() => setSel(i)}>
              <span className="grow"><b>{name}</b><small>{min} minutes · {mentor.format}</small></span><b>{rand(Math.round(base * mu))}</b>
            </button>
          ))}
          <p className="muted small">Prices are illustrative. Availability: {mentor.availability || 'on request'}.</p>
        </div>
      )}
      {step === 2 && (
        <div className="stack">
          <div className="kv"><span className="muted">Mentor</span><strong>{mentor.name} <SampleBadge /></strong></div>
          <div className="kv"><span className="muted">Session</span><strong>{SESSIONS[sel][0]}, {minutes} min</strong></div>
          <div className="kv"><span className="muted">Illustrative price</span><strong>{rand(price)}</strong></div>
          <div className="info-s"><b>How the commission could work</b><p>On paid sessions SheBiz may keep a platform commission of 10% to 20%. Example at 15%: SheBiz {rand(fee)}, mentor {rand(price - fee)}. This is an illustration, not a final rate.</p></div>
          <p className="muted small">Confirming only saves a preview booking in your browser. No payment is taken and no real mentor is booked.</p>
        </div>
      )}
      {step === 3 && (
        <div className="center stack" style={{ alignItems: 'center' }}>
          <div className="empty-icon" style={{ background: '#fbd9ea', color: '#b8266f' }}><Icon name="checkCircle" size={30} /></div>
          <p><b>{SESSIONS[sel][0]}</b> with {mentor.name} was saved as a preview booking request.</p>
          <p className="muted small">No payment was taken and no real appointment exists. Real scheduling and payments will be connected in a later phase.</p>
          <Link to="/explore/mentorship#requests" className="link-btn" onClick={onClose}>See your requests</Link>
        </div>
      )}
    </Modal>
  );
}

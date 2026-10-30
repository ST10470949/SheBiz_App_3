import React, { useState } from 'react';
import Icon from '../../components/Icon.jsx';
import { Field, Spinner } from '../../components/ui.jsx';
import { PageHero } from '../components.jsx';

export default function Contact() {
  const [v, setV] = useState({ name: '', email: '', topic: '', message: '' });
  const [e, setE] = useState({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const set = (k) => (ev) => { setV({ ...v, [k]: ev.target.value }); setE({ ...e, [k]: undefined }); };
  const submit = async (ev) => {
    ev.preventDefault();
    const er = {};
    if (v.name.trim().length < 2) er.name = 'Enter your name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.email.trim())) er.email = 'Enter a valid email address.';
    if (!v.topic) er.topic = 'Choose a topic.';
    if (v.message.trim().length < 15) er.message = 'Write at least 15 characters.';
    setE(er); if (Object.keys(er).length) return;
    setBusy(true); await new Promise((r) => setTimeout(r, 600)); setBusy(false); setDone(true);
  };
  return (
    <>
      <PageHero eyebrow="Contact" title="We would love to hear from you" text="Questions, ideas or partnership interest? Send us a message." />
      <section className="sec-tight"><div className="wrap-site contact-grid">
        <div className="lcard">
          {done ? (
            <div className="center stack" style={{ alignItems: 'center', padding: '24px 0' }}>
              <div className="empty-icon" style={{ background: '#fbd9ea', color: '#b8266f' }}><Icon name="checkCircle" size={30} /></div>
              <h2>Message recorded</h2><p className="muted">Preview only: your message was not sent to anyone yet. A real contact channel will be connected in a later phase.</p>
              <button className="btn btn-pink" onClick={() => { setDone(false); setV({ name: '', email: '', topic: '', message: '' }); }}>Send another</button>
            </div>
          ) : (
            <form className="stack" onSubmit={submit} noValidate>
              <Field label="Your name" error={e.name}><input value={v.name} onChange={set('name')} autoComplete="name" /></Field>
              <Field label="Email" error={e.email}><input type="email" value={v.email} onChange={set('email')} autoComplete="email" /></Field>
              <Field label="Topic" error={e.topic}><select value={v.topic} onChange={set('topic')}><option value="">Select...</option><option>General question</option><option>Mentorship</option><option>Business support</option><option>Partnerships</option><option>Feedback</option></select></Field>
              <Field label="Message" error={e.message}><textarea value={v.message} onChange={set('message')} maxLength={800} /></Field>
              <button className="btn btn-pink btn-lg" disabled={busy}>{busy ? <Spinner /> : 'Send message'}</button>
            </form>
          )}
        </div>
        <aside className="stack">
          <div className="side-card"><h3>Partnerships</h3><p className="muted-on-dark">Organisations can use the partner enquiry form on the For Organisations page.</p></div>
          <div className="side-card"><h3>Hackathon team</h3><p className="muted-on-dark">Error 404</p></div>
        </aside>
      </div></section>
    </>
  );
}

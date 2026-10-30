import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import { Avatar, EmptyState, Pill, Skeleton } from '../components/ui.jsx';
import { useApp } from '../state/store.jsx';
import { BookModal, ChatDrawer, RequestModal, StatusPill, TINTS, fmtWhen, mentorshipFor } from './mentorParts.jsx';

export default function MentorProfile() {
  const { id } = useParams();
  const nav = useNavigate();
  const { glob, mentorships, ready } = useApp();
  const [modal, setModal] = useState(null); // 'request' | 'book' | 'chat'

  if (!ready || !glob.loaded) return <Skeleton h={420} r={24} />;
  const idx = glob.mentors.findIndex((m) => m.id === id);
  const m = glob.mentors[idx];
  if (!m) return <div className="card"><EmptyState icon="user" title="Mentor not found" action={<Link to="/mentorship" className="btn" style={{ textDecoration: 'none' }}>Back to mentors</Link>} /></div>;
  const ms = mentorshipFor(m.id, mentorships);
  const sameCategory = glob.mentors.filter((x) => x.category === m.category);
  const tint = TINTS[Math.max(0, sameCategory.findIndex((x) => x.id === m.id)) % 3];

  return (
    <>
      <button className="link-btn" onClick={() => nav('/mentorship')} style={{ marginBottom: 18 }}><Icon name="arrowLeft" size={16} /> Back to mentors</button>
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="row" style={{ gap: 32, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <Avatar name={m.name} tint={tint} size={150} float />
          <div style={{ flex: 1, minWidth: 260 }}>
            <div className="row-wrap" style={{ marginBottom: 8 }}><StatusPill m={ms} /><Pill tone="grey">{m.category}</Pill></div>
            <h1 style={{ fontSize: 34 }}>{m.name}</h1>
            <p className="muted" style={{ fontSize: 16, margin: '4px 0 16px' }}>{m.title}</p>
            <div className="row-wrap" style={{ gap: 26 }}>
              {m.yearsExperience ? <div><div className="stat-label">Experience</div><strong style={{ fontSize: 20 }}>{m.yearsExperience} years</strong></div> : null}
              {typeof m.rating === 'number' && <div><div className="stat-label">Rating</div><strong style={{ fontSize: 20 }}><Icon name="star" size={16} style={{ color: 'var(--gold)', fill: 'var(--gold)', marginRight: 4 }} />{m.rating.toFixed(1)}</strong></div>}
              {m.menteeCount > 0 && <div><div className="stat-label">Mentees</div><strong style={{ fontSize: 20 }}>{m.menteeCount}</strong></div>}
            </div>
          </div>
        </div>
        <hr className="divider" style={{ margin: '24px 0' }} />
        <div className="row-wrap">
          {ms ? <button className="btn" disabled><Icon name="check" size={16} stroke={3} /> {ms.status === 'Connected' ? 'Connected' : 'Request sent'}</button> : <button className="btn" onClick={() => setModal('request')}>Request mentorship</button>}
          <button className="btn btn-soft" onClick={() => setModal('chat')}><Icon name="message" size={16} /> Send message</button>
          <button className="btn btn-soft" onClick={() => setModal('book')}><Icon name="calendar" size={16} /> Book a session</button>
          <button className="btn btn-ghost" onClick={() => nav('/mentorship')}>Back to mentors</button>
        </div>
        {ms?.nextCheckIn && <p className="muted" style={{ marginTop: 16 }}><Icon name="calendar" size={14} /> Next check-in: <strong style={{ color: 'var(--ink)' }}>{fmtWhen(ms.nextCheckIn, true)}</strong> · {ms.goal}</p>}
      </div>

      <div className="split-2-1">
        <div className="stack" style={{ gap: 24 }}>
          <div className="card"><h2>About {m.name.split(' ')[0]}</h2><p style={{ lineHeight: 1.75 }}>{m.bio}</p></div>
          <div className="card"><h2>Can help you with</h2><div className="chips">{m.skills.map((s) => <span key={s} className="chip">{s}</span>)}</div></div>
        </div>
        <div className="stack" style={{ gap: 24 }}>
          <div className="card"><h2>Availability</h2><div className="stack" style={{ gap: 10 }}>{m.availability.map((a) => <div key={a} className="row"><Icon name="clock" size={16} className="c-purple" /> {a.replace('Mon', 'Mondays').replace('Tue', 'Tuesdays').replace('Wed', 'Wednesdays').replace('Thu', 'Thursdays').replace('Fri', 'Fridays').replace('Sat', 'Saturdays')}</div>)}</div></div>
          <div className="card"><h2>Languages</h2><div className="chips">{m.languages.map((l) => <span key={l} className="tag">{l}</span>)}</div></div>
        </div>
      </div>

      {modal === 'request' && <RequestModal mentor={m} onClose={() => setModal(null)} />}
      {modal === 'book' && <BookModal mentor={m} existing={ms} onClose={() => setModal(null)} />}
      {modal === 'chat' && <ChatDrawer mentor={m} onClose={() => setModal(null)} />}
    </>
  );
}

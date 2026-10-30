import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import { Avatar, EmptyState, PageHeader, Pill, Skeleton, Tabs, Tilt } from '../components/ui.jsx';
import { useApp } from '../state/store.jsx';
import { MENTOR_CATEGORIES } from '../data/seed.js';
import { BookModal, CallModal, ChatDrawer, StatusPill, TINTS, fmtWhen, mentorshipFor } from './mentorParts.jsx';

export default function Mentorship() {
  const { glob, mentorships, ready } = useApp();
  const nav = useNavigate();
  const [cat, setCat] = useState('Technology');
  const [chat, setChat] = useState(null);
  const [resched, setResched] = useState(null);
  const [call, setCall] = useState(null);

  const mentors = glob.mentors.filter((m) => m.category === cat);
  const byId = (id) => glob.mentors.find((m) => m.id === id);
  const connected = mentorships.filter((m) => m.status === 'Connected');
  const requested = mentorships.filter((m) => m.status === 'Requested');

  return (
    <>
      <PageHeader title="Find a mentor" subtitle="Connect with experienced women and professionals." />
      <div className="tabs-scroll tabs" style={{ marginBottom: 32 }}><Tabs label="Mentor categories" tabs={MENTOR_CATEGORIES} value={cat} onChange={setCat} /></div>

      <h2 style={{ fontSize: 24, marginBottom: 20 }}>Recommended mentors</h2>
      {!ready || !glob.loaded ? <div className="grid-3">{[0, 1, 2].map((i) => <Skeleton key={i} h={420} r={24} />)}</div> : mentors.length === 0 ? <div className="card"><EmptyState icon="users" title="No mentors in this category yet" text="Try another category." /></div> : (
        <div className="grid-3">
          {mentors.map((m, i) => {
            const ms = mentorshipFor(m.id, mentorships);
            return (
              <Tilt key={m.id} className="card mentor-card" max={5}>
                <span className="badge-avail"><StatusPill m={ms} /></span>
                <Avatar name={m.name} tint={TINTS[i % 3]} size={112} float />
                <h2 style={{ fontSize: 24, marginBottom: 4 }}>{m.name}</h2>
                <p className="muted">{m.title}</p>
                <div className="label-s" style={{ marginTop: 22 }}>Skills</div>
                <p style={{ margin: '8px 0 18px', fontWeight: 500 }}>{m.skills.join(' · ')}</p>
                <p className="muted small" style={{ marginBottom: 12 }}>{m.yearsExperience} years experience · {m.category}</p>
                <button className="btn btn-block" style={{ marginTop: 'auto' }} onClick={() => nav(`/mentorship/${m.id}`)}>View Profile <Icon name="arrow" size={15} /></button>
              </Tilt>
            );
          })}
        </div>
      )}

      <div className="stack" style={{ marginTop: 32, gap: 20 }}>
        {connected.map((ms) => {
          const m = byId(ms.mentorId); if (!m) return null;
          return (
            <div className="card row between" key={ms.id} style={{ flexWrap: 'wrap', gap: 20 }}>
              <div className="row" style={{ gap: 24 }}>
                <span className="tile" style={{ width: 120, height: 120, borderRadius: 24 }}><Icon name="user" size={44} /></span>
                <div>
                  <div style={{ color: 'var(--coral)', fontWeight: 800, fontSize: 12 }}>My mentorship</div>
                  <h2 style={{ fontSize: 26, margin: '8px 0' }}>You are connected with {m.name}</h2>
                  <p className="muted">{ms.nextCheckIn ? `Next check-in: ${fmtWhen(ms.nextCheckIn)}` : 'No check-in booked yet'}{ms.goal ? ` · ${ms.goal}` : ''}</p>
                </div>
              </div>
              <div className="row-wrap">
                <button className="btn" onClick={() => setChat(m)}><Icon name="message" size={16} /> Open Messages</button>
                <button className="btn btn-soft" onClick={() => setResched({ m, ms })}><Icon name="calendar" size={16} /> Reschedule</button>
                <button className="btn btn-ghost" onClick={() => setCall(m)}><Icon name="video" size={16} /> Join call</button>
              </div>
            </div>
          );
        })}
        {requested.map((ms) => (
          <div className="card row" key={ms.id} style={{ gap: 18 }}>
            <span className="tile tile-blush"><Icon name="clock" /></span>
            <div><div style={{ color: 'var(--coral)', fontWeight: 800, fontSize: 12 }}>Request sent</div><h3>Waiting for {ms.mentorName} to accept</h3><p className="muted small">We will notify you as soon as they confirm.</p></div>
          </div>
        ))}
        {!connected.length && !requested.length && ready && (
          <div className="card row" style={{ gap: 18 }}><span className="tile"><Icon name="user" /></span><div><div style={{ color: 'var(--coral)', fontWeight: 800, fontSize: 12 }}>My mentorship</div><h3>You do not have a mentor yet</h3><p className="muted">Open a profile above and press Request mentorship to get started.</p></div></div>
        )}
      </div>

      {chat && <ChatDrawer mentor={chat} onClose={() => setChat(null)} />}
      {resched && <BookModal mentor={resched.m} existing={resched.ms} reschedule onClose={() => setResched(null)} />}
      {call && <CallModal mentor={call} onClose={() => setCall(null)} onMessage={() => { setChat(call); setCall(null); }} />}
    </>
  );
}

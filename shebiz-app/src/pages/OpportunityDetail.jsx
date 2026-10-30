import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import { EmptyState, Field, Modal, Pill, Skeleton, Spinner, useToast } from '../components/ui.jsx';
import { useApp } from '../state/store.jsx';
import { useOpps } from '../state/hooks.js';

export default function OpportunityDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const toast = useToast();
  const { api, profile, ready, glob } = useApp();
  const opps = useOpps();
  const o = opps.find((x) => x.id === id);
  // The real application happens on the employer's own page. We open it and keep a record so the user can track it.
  const applyNow = async () => {
    window.open(o.applyUrl, '_blank', 'noopener,noreferrer');
    try {
      await api.add('applications', { opportunityId: o.id, opportunityTitle: o.title, company: o.company, status: 'Applied (on company site)' });
      toast.success('Opened the application page. Saved to your applications so you can track it.');
    } catch (x) { toast.error(x.message); }
  };

  if (!ready || !glob.loaded) return <Skeleton h={360} r={24} />;
  if (!o) return <div className="card"><EmptyState icon="search" title="Opportunity not found" text="It may have been removed." action={<Link to="/opportunities" className="btn" style={{ textDecoration: 'none' }}>Back to opportunities</Link>} /></div>;

  const mine = new Set((profile?.skills || []).map((s) => s.name.toLowerCase()));
  const have = o.skills.filter((s) => mine.has(s.toLowerCase())).length;
  const closed = o.days < 0;
  const toggleSave = async () => {
    try {
      if (o.saved) { await api.remove('saved', o.id); toast.info('Removed from saved'); } else { await api.set('saved', o.id, { opportunityId: o.id, title: o.title }); toast.success('Saved for later'); }
    } catch (e) { toast.error(e.message); }
  };

  return (
    <>
      <button className="link-btn" onClick={() => nav('/opportunities')} style={{ marginBottom: 18 }}><Icon name="arrowLeft" size={16} /> Back to opportunities</button>
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="row between" style={{ alignItems: 'flex-start', flexWrap: 'wrap', gap: 20 }}>
          <div className="row" style={{ gap: 18, alignItems: 'flex-start' }}>
            <span className="tile" style={{ width: 64, height: 64 }}><Icon name="briefcase" size={28} /></span>
            <div>
              <h1 style={{ fontSize: 28 }}>{o.title}</h1>
              <p className="muted" style={{ marginTop: 6, fontSize: 15 }}>{o.company}</p>
              <div className="row-wrap" style={{ marginTop: 14 }}>
                <Pill tone="grey"><Icon name="mapPin" size={13} /> {o.location}</Pill>
                <Pill tone="grey">{o.type}</Pill>
                <Pill tone="grey">{o.category}</Pill>
                {closed ? <Pill tone="grey">Closed</Pill> : <Pill tone="coral"><Icon name="clock" size={13} /> {o.days === 0 ? 'Closes today' : `${o.days} days left`}</Pill>}
              </div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}><div className="stat-label">Your match</div><div className="stat-num c-purple" style={{ margin: '6px 0 0' }}>{o.match}%</div></div>
        </div>
        <hr className="divider" />
        <div className="row-wrap">
          {o.applied ? <button className="btn" disabled><Icon name="check" size={16} stroke={3} /> Applied</button> : <button className="btn" disabled={closed || !o.applyUrl} onClick={applyNow}>{closed ? 'Applications closed' : !o.applyUrl ? 'No application link' : <>Apply on their website <Icon name="arrow" size={15} /></>}</button>}
          <button className="btn btn-soft" onClick={toggleSave} aria-pressed={o.saved}><Icon name="bookmark" size={16} style={o.saved ? { fill: 'currentColor' } : undefined} /> {o.saved ? 'Saved' : 'Save for later'}</button>
          <button className="btn btn-ghost" onClick={() => nav('/opportunities')}>Back</button>
        </div>
      </div>

      <div className="split-2-1">
        <div className="stack" style={{ gap: 24 }}>
          <div className="card"><h2>About this opportunity</h2><p style={{ lineHeight: 1.7 }}>{o.description}</p></div>
          <div className="card"><h2>Requirements</h2><ul className="bullets">{o.requirements.map((r) => <li key={r}>{r}</li>)}</ul></div>
        </div>
        <div className="stack" style={{ gap: 24 }}>
          <div className="card">
            <h2>Skills needed</h2>
            <p className="muted small" style={{ marginBottom: 12 }}>You have {have} of {o.skills.length} listed on your profile.</p>
            <div className="chips">{o.skills.map((s) => <span key={s} className={`chip ${mine.has(s.toLowerCase()) ? '' : ''}`} style={mine.has(s.toLowerCase()) ? { background: '#e1f5ec', color: '#12704b' } : { background: '#f6f4fa', color: 'var(--body)' }}>{mine.has(s.toLowerCase()) && <Icon name="check" size={13} stroke={3} />}{s}</span>)}</div>
            {have < o.skills.length && <p className="small muted" style={{ marginTop: 14 }}>Add missing skills in <Link to="/profile">your profile</Link> or learn them in <Link to="/learning">Learning</Link> to raise your match.</p>}
          </div>
          <div className="card">
            <h2>Key details</h2>
            <div className="kv"><span className="muted">Closing date</span><strong>{new Date(`${o.closingDate}T12:00:00`).toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' })}</strong></div>
            <div className="kv"><span className="muted">Location</span><strong>{o.location}</strong></div>
            <div className="kv"><span className="muted">Type</span><strong>{o.type}</strong></div>
          </div>
        </div>
      </div>
    </>
  );
}

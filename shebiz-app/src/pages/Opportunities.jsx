import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import { Confirm, EmptyState, Menu, PageHeader, Pill, Skeleton, Tabs, Tilt, useDebounced, useToast } from '../components/ui.jsx';
import { useApp } from '../state/store.jsx';
import { useOpps } from '../state/hooks.js';
import { OPP_TYPES } from '../data/seed.js';

function FilterChip({ label, value, options, onChange }) {
  return (
    <Menu
      trigger={({ toggle, open }) => (
        <span className={`filter-chip ${value ? 'on' : ''}`}>
          <button className="chip-btn" onClick={toggle} aria-haspopup="menu" aria-expanded={open}>{value ? `${label}: ${value}` : label}<Icon name="chevronDown" size={14} /></button>
          {value && <button className="chip-x" aria-label={`Clear ${label} filter`} onClick={() => onChange('')}><Icon name="x" size={14} /></button>}
        </span>
      )}
      items={options.map((o) => ({ label: o, active: o === value, onClick: () => onChange(o) }))}
    />
  );
}

const CLOSING = { 'Within 7 days': 7, 'Within 14 days': 14, 'Within 30 days': 30 };

export function OppCard({ o, onOpen, onSave }) {
  const closed = o.days < 0;
  return (
    <Tilt className="card opp-card" max={2.5}>
      <span className="tile"><Icon name="briefcase" size={22} /></span>
      <div style={{ minWidth: 0 }}>
        <h3 style={{ fontSize: 18 }}>{o.title}</h3>
        <div className="opp-meta">{o.company} · {o.location} · {o.type}</div>
        <div className="chips" style={{ marginTop: 12 }}>{o.skills.map((s) => <span className="tag" key={s}>{s}</span>)}</div>
      </div>
      <div className="opp-side">
        <div className="row-wrap" style={{ justifyContent: 'flex-end' }}>
          {o.applied && <Pill tone="green"><Icon name="check" size={12} stroke={3} /> Applied</Pill>}
          <Pill>{o.match}% skill match</Pill>
        </div>
        <div className="row" style={{ gap: 14 }}>
          {closed ? <Pill tone="grey">Closed</Pill> : <Pill tone="coral">{o.days === 0 ? 'Closes today' : `${o.days} day${o.days === 1 ? '' : 's'} left`}</Pill>}
          <button className={`bookmark ${o.saved ? 'on' : ''}`} onClick={() => onSave(o)} aria-pressed={o.saved} aria-label={o.saved ? `Remove ${o.title} from saved` : `Save ${o.title}`}><Icon name="bookmark" size={18} /></button>
          <button className="link-btn" onClick={() => onOpen(o)} aria-label={`View ${o.title}`}>View <Icon name="arrow" size={14} /></button>
        </div>
      </div>
    </Tilt>
  );
}

export default function Opportunities() {
  const { glob, ready, applications, api } = useApp();
  const nav = useNavigate();
  const toast = useToast();
  const opps = useOpps();
  const [tab, setTab] = useState('all');
  const [q, setQ] = useState('');
  const [f, setF] = useState({ category: '', location: '', type: '', closing: '' });
  const [sort, setSort] = useState('match');
  const [withdraw, setWithdraw] = useState(null);
  const dq = useDebounced(q, 150).trim().toLowerCase();

  const cats = useMemo(() => [...new Set(opps.map((o) => o.category))].sort(), [opps]);
  const locs = useMemo(() => [...new Set(opps.map((o) => o.location))].sort(), [opps]);

  const list = useMemo(() => {
    let r = opps.filter((o) => {
      if (tab === 'saved' && !o.saved) return false;
      if (dq && !`${o.title} ${o.company} ${o.skills.join(' ')} ${o.location}`.toLowerCase().includes(dq)) return false;
      if (f.category && o.category !== f.category) return false;
      if (f.location && o.location !== f.location) return false;
      if (f.type && o.type !== f.type) return false;
      if (f.closing && !(o.days >= 0 && o.days <= CLOSING[f.closing])) return false;
      return true;
    });
    r = [...r].sort((a, b) => ((a.days < 0) - (b.days < 0)) || (sort === 'match' ? b.match - a.match : a.days - b.days));
    return r;
  }, [opps, tab, dq, f, sort]);

  const anyFilter = dq || Object.values(f).some(Boolean);
  const clearAll = () => { setQ(''); setF({ category: '', location: '', type: '', closing: '' }); };
  const toggleSave = async (o) => {
    try {
      if (o.saved) { await api.remove('saved', o.id); toast.info('Removed from saved'); } else { await api.set('saved', o.id, { opportunityId: o.id, title: o.title }); toast.success('Saved for later'); }
    } catch (e) { toast.error(e.message); }
  };
  const doWithdraw = async () => {
    try { await api.remove('applications', withdraw.id); toast.success('Application withdrawn'); } catch (e) { toast.error(e.message); }
    setWithdraw(null);
  };

  const savedCount = opps.filter((o) => o.saved).length;
  const apps = [...applications].sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));

  return (
    <>
      <PageHeader title="Explore opportunities" subtitle="Jobs, internships, scholarships and programmes selected for you." />
      <div style={{ marginBottom: 18 }}>
        <Tabs label="Opportunity views" value={tab} onChange={setTab} tabs={[{ key: 'all', label: 'Recommended' }, { key: 'saved', label: `Saved (${savedCount})` }, { key: 'apps', label: `My applications (${applications.length})` }]} />
      </div>

      {tab !== 'apps' && (
        <>
          <div className="card search-card" role="search">
            <label className="grow"><Icon name="search" size={20} /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by role, company or skill" aria-label="Search opportunities" /></label>
            <FilterChip label="Category" value={f.category} options={cats} onChange={(v) => setF({ ...f, category: v })} />
            <FilterChip label="Location" value={f.location} options={locs} onChange={(v) => setF({ ...f, location: v })} />
            <FilterChip label="Type" value={f.type} options={OPP_TYPES} onChange={(v) => setF({ ...f, type: v })} />
            <FilterChip label="Closing date" value={f.closing} options={Object.keys(CLOSING)} onChange={(v) => setF({ ...f, closing: v })} />
          </div>
          <div className="row between" style={{ margin: '28px 0 16px' }}>
            <h2 style={{ fontSize: 24, margin: 0 }}>{tab === 'saved' ? 'Saved opportunities' : 'Recommended for you'}</h2>
            <div className="row" style={{ gap: 14 }}>
              <Menu align="right" trigger={({ toggle }) => <button className="link-btn" style={{ color: 'var(--body)' }} onClick={toggle}>Sort: {sort === 'match' ? 'Best match' : 'Closing soon'} <Icon name="chevronDown" size={14} /></button>} items={[{ label: 'Best match', active: sort === 'match', onClick: () => setSort('match') }, { label: 'Closing soon', active: sort === 'closing', onClick: () => setSort('closing') }]} />
              <span className="muted small" aria-live="polite">{list.length} {list.length === 1 ? 'opportunity' : 'opportunities'}</span>
            </div>
          </div>
          {!ready || !glob.loaded ? <div className="stack">{[0, 1, 2].map((i) => <Skeleton key={i} h={140} r={22} />)}</div> : list.length === 0 ? (
            <div className="card"><EmptyState icon={tab === 'saved' ? 'bookmark' : 'search'} title={tab === 'saved' && !anyFilter ? 'Nothing saved yet' : 'No opportunities match your search'} text={tab === 'saved' && !anyFilter ? 'Tap the bookmark on an opportunity to keep it here.' : 'Try a different word or remove a filter.'} action={anyFilter ? <button className="btn btn-soft" onClick={clearAll}>Clear filters</button> : null} /></div>
          ) : (
            <div className="stack" style={{ gap: 20 }}>{list.map((o) => <OppCard key={o.id} o={o} onOpen={(x) => nav(`/opportunities/${x.id}`)} onSave={toggleSave} />)}</div>
          )}
        </>
      )}

      {tab === 'apps' && (
        <div className="stack" style={{ gap: 16 }}>
          {apps.length === 0 ? (
            <div className="card"><EmptyState icon="file" title="No applications yet" text="When you apply for an opportunity it will show up here with its status." action={<button className="btn" onClick={() => setTab('all')}>Browse opportunities</button>} /></div>
          ) : apps.map((a) => (
            <div className="card row between" key={a.id} style={{ flexWrap: 'wrap' }}>
              <div className="row" style={{ gap: 16 }}>
                <span className="tile"><Icon name="file" /></span>
                <div><h3>{a.opportunityTitle}</h3><div className="muted small">{a.company} · Applied {new Date(a.createdAt).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}</div></div>
              </div>
              <div className="row" style={{ gap: 12 }}>
                <Pill tone={a.status === 'Shortlisted' ? 'green-soft' : a.status === 'Declined' ? 'red' : 'lav'}>{a.status}</Pill>
                <button className="btn btn-ghost btn-sm" onClick={() => nav(`/opportunities/${a.opportunityId}`)}>View</button>
                <button className="btn btn-ghost btn-sm" onClick={() => setWithdraw(a)}>Withdraw</button>
              </div>
            </div>
          ))}
        </div>
      )}
      {withdraw && <Confirm title="Withdraw application?" message={`Your application for ${withdraw.opportunityTitle} will be removed. You can apply again before it closes.`} confirmLabel="Withdraw" danger onConfirm={doWithdraw} onClose={() => setWithdraw(null)} />}
    </>
  );
}

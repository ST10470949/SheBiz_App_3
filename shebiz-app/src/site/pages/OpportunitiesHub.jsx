import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Icon from '../../components/Icon.jsx';
import { Drawer, EmptyState, useToast } from '../../components/ui.jsx';
import { useApp } from '../../state/store.jsx';
import { daysLeft } from '../../lib/metrics.js';
import { CLOSING_FILTERS, LOCATIONS, OPP_CATEGORIES, SAMPLE_OPPS, demoStore } from '../data.js';
import { PageHero, SampleBadge, SampleNotice } from '../components.jsx';

const TYPE_TO_CAT = { Job: 'Jobs', Internship: 'Internships', Learnership: 'Learnerships', Scholarship: 'Scholarships', Programme: 'Training Programmes' };

function closing(o) {
  if (o.closesInDays == null) return 'Closing date not specified';
  if (o.closesInDays < 0) return 'Closed';
  return o.sample ? `Illustrative: closes in ${o.closesInDays} days` : `${o.closesInDays} days left`;
}

export default function OpportunitiesHub() {
  const { backend, user } = useApp();
  const nav = useNavigate();
  const toast = useToast();
  const [real, setReal] = useState([]);
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('All');
  const [loc, setLoc] = useState('');
  const [closeBy, setCloseBy] = useState('any');
  const [saved, setSaved] = useState(() => demoStore.get('savedOpps', []));
  const [only, setOnly] = useState('all');
  const [open, setOpen] = useState(null);
  const signedIn = !!user?.emailVerified;

  useEffect(() => {
    if (!backend) return;
    backend.getGlobal('opportunities').then((list) => setReal(list.map((o) => ({
      id: o.id, title: o.title, org: o.company, category: TYPE_TO_CAT[o.type] || 'Training Programmes', location: o.location, closesInDays: daysLeft(o), summary: o.description, eligibility: (o.requirements || []).join('. '), applyUrl: o.applyUrl, real: true,
    })).filter((o) => o.closesInDays >= 0))).catch(() => setReal([]));
  }, [backend]);

  const all = useMemo(() => [...real, ...SAMPLE_OPPS], [real]);
  const results = useMemo(() => {
    const t = q.trim().toLowerCase();
    return all.filter((o) => (cat === 'All' || o.category === cat) && (!loc || o.location === loc)
      && (closeBy === 'any' || (o.closesInDays != null && o.closesInDays <= Number(closeBy)))
      && (only === 'all' || (only === 'saved' ? saved.includes(o.id) : o.real))
      && (!t || `${o.title} ${o.org} ${o.summary} ${o.category}`.toLowerCase().includes(t)));
  }, [all, q, cat, loc, closeBy, only, saved]);

  const toggleSave = (id) => { const n = saved.includes(id) ? saved.filter((x) => x !== id) : [...saved, id]; setSaved(n); demoStore.set('savedOpps', n); toast.success(saved.includes(id) ? 'Removed from saved' : 'Saved for later'); };
  const clear = () => { setQ(''); setCat('All'); setLoc(''); setCloseBy('any'); setOnly('all'); };
  const filtered = q || cat !== 'All' || loc || closeBy !== 'any' || only !== 'all';

  return (
    <>
      <PageHero eyebrow="Opportunities Hub" title="Discover opportunities built for your future" text="Jobs, internships, learnerships, scholarships, funding and programmes for women, searchable in one place.">
        <div className="search-big" role="search">
          <Icon name="search" size={20} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by role, organisation or keyword" aria-label="Search opportunities" />
          {q && <button className="icon-x" aria-label="Clear search" onClick={() => setQ('')}><Icon name="x" size={16} /></button>}
        </div>
      </PageHero>

      <section className="sec-tight">
        <div className="wrap-site">
          <SampleNotice>Sample listings carry a Sample label and have no real application link. Real opportunities added by SheBiz appear first and link to the official page.</SampleNotice>
          <div className="chip-row" role="tablist" aria-label="Categories">
            {['All', ...OPP_CATEGORIES].map((c) => <button key={c} role="tab" aria-selected={cat === c} className={`fchip ${cat === c ? 'on' : ''}`} onClick={() => setCat(c)}>{c}</button>)}
          </div>
          <div className="filter-bar">
            <label>Location<select value={loc} onChange={(e) => setLoc(e.target.value)}><option value="">All locations</option>{LOCATIONS.map((l) => <option key={l}>{l}</option>)}</select></label>
            <label>Closing date<select value={closeBy} onChange={(e) => setCloseBy(e.target.value)}>{CLOSING_FILTERS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label>
            <label>Show<select value={only} onChange={(e) => setOnly(e.target.value)}><option value="all">All listings</option><option value="saved">Saved ({saved.length})</option><option value="real">Real listings only</option></select></label>
            {filtered && <button className="link-light" onClick={clear}>Clear filters</button>}
            <span className="result-count" aria-live="polite">{results.length} {results.length === 1 ? 'result' : 'results'}</span>
          </div>

          {results.length === 0 ? (
            <div className="empty-dark"><EmptyState icon="search" title="No opportunities match" text="Try a different keyword, category or location." action={<button className="btn btn-pink" onClick={clear}>Clear filters</button>} /></div>
          ) : (
            <div className="opp-grid">
              {results.map((o, i) => (
                <article key={o.id} className={`opp-card-s ${i === 0 && !filtered && !o.real ? 'featured' : ''}`}>
                  <div className="row between"><span className="cat-pill">{o.category}</span>{o.sample ? <SampleBadge /> : <span className="real-pill">Official listing</span>}</div>
                  {i === 0 && !filtered && !o.real && <span className="feat-pill">Featured (sample)</span>}
                  <h3>{o.title}</h3>
                  <p className="o-org">{o.org}</p>
                  <p>{o.summary}</p>
                  <ul className="o-meta"><li><Icon name="mapPin" size={14} /> {o.location}</li><li><Icon name="clock" size={14} /> {closing(o)}</li></ul>
                  {o.eligibility && <p className="o-elig"><b>Eligibility:</b> {o.eligibility}</p>}
                  <div className="o-actions">
                    <button className="btn btn-lav btn-sm" onClick={() => setOpen(o)}>View Details</button>
                    <button className={`save-btn ${saved.includes(o.id) ? 'on' : ''}`} onClick={() => toggleSave(o.id)} aria-pressed={saved.includes(o.id)} aria-label={saved.includes(o.id) ? 'Unsave' : 'Save'}><Icon name="bookmark" size={16} /></button>
                    {o.applyUrl ? <a className="btn btn-pink btn-sm" href={o.applyUrl} target="_blank" rel="noopener noreferrer">Visit Official Website</a> : <button className="btn btn-ghost btn-sm" disabled title="Sample listing: no real application link">Sample: no link</button>}
                  </div>
                </article>
              ))}
            </div>
          )}

          <div className="promo-strip">
            <div><b>Hiring or running a programme?</b><p>Employers can publish or promote jobs, internships and learnerships on SheBiz.</p></div>
            <Link to="/partners#employers" className="btn btn-pink">Promote a listing</Link>
          </div>
        </div>
      </section>

      {open && (
        <Drawer title={open.title} onClose={() => setOpen(null)} footer={open.applyUrl ? <a className="btn btn-pink" href={open.applyUrl} target="_blank" rel="noopener noreferrer">Visit Official Website</a> : <button className="btn btn-ghost" onClick={() => setOpen(null)}>Close</button>}>
          <div className="row-wrap"><span className="cat-pill dark">{open.category}</span>{open.sample && <SampleBadge />}</div>
          <p><b>{open.org}</b> · {open.location}</p>
          <p>{open.summary}</p>
          <div className="kv"><span className="muted">Closing</span><strong>{closing(open)}</strong></div>
          {open.eligibility && <div><h3>Eligibility</h3><p>{open.eligibility}</p></div>}
          {open.sample && <p className="muted small">This is a sample listing for design preview. It is not a real opportunity and has no application link.</p>}
          {open.real && signedIn && <Link to={`/opportunities/${open.id}`} className="btn btn-lav btn-sm">Open in your dashboard</Link>}
        </Drawer>
      )}
    </>
  );
}

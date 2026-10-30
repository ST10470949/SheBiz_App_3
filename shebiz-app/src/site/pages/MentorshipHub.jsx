import React, { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Icon from '../../components/Icon.jsx';
import { EmptyState, Pill } from '../../components/ui.jsx';
import { useApp } from '../../state/store.jsx';
import { MENTOR_FORMATS, SAMPLE_MENTORS } from '../data.js';
import { PageHero, Reveal, SampleNotice, SectionHead } from '../components.jsx';
import { BookingModal, MentorCard, RequestModal, rand, useMentorRequests } from '../MentorFlows.jsx';
import { SceneFallback } from '../../components/CollabScene.jsx';

const CollabScene = lazy(() => import('../../components/CollabScene.jsx'));

export default function MentorshipHub() {
  const { backend } = useApp();
  const nav = useNavigate();
  const [real, setReal] = useState([]);
  const [industry, setIndustry] = useState('All');
  const [format, setFormat] = useState('');
  const [pay, setPay] = useState('all');
  const [req, setReq] = useState(null);
  const [book, setBook] = useState(null);
  const reqs = useMentorRequests();

  useEffect(() => {
    if (!backend) return;
    backend.getGlobal('mentors').then((list) => setReal(list.map((m) => ({ id: m.id, name: m.name, role: m.title, expertise: m.skills.length ? m.skills : [m.category], industry: m.category, bio: m.bio, format: '1:1 mentoring', availability: m.availability?.join(', '), price: 0, tint: 'lav', real: true })))).catch(() => setReal([]));
  }, [backend]);

  const all = useMemo(() => [...real, ...SAMPLE_MENTORS], [real]);
  const industries = ['All', ...new Set(all.map((m) => m.industry))];
  const list = all.filter((m) => (industry === 'All' || m.industry === industry) && (!format || m.format === format) && (pay === 'all' || (pay === 'free' ? !m.price : m.price > 0)));
  const paid = SAMPLE_MENTORS.filter((m) => m.price > 0);

  useEffect(() => { if (window.location.hash) setTimeout(() => document.querySelector(window.location.hash)?.scrollIntoView({ behavior: 'smooth' }), 150); }, []);

  return (
    <>
      <PageHero eyebrow="Mentorship" title="Your Next Chapter Starts With a Connection" text="Meet women who have walked the journey before you. Learn from their experience, strengthen your ideas and move forward with confidence."
        art={<Suspense fallback={<SceneFallback />}><CollabScene focus="mentor" onNavigate={nav} hotspots={false} /></Suspense>}>
        <div className="row-wrap" style={{ marginTop: 22 }}><a href="#mentors" className="btn btn-pink btn-lg">Browse mentors</a><a href="#marketplace" className="btn btn-ghost-dark btn-lg">Expert marketplace</a></div>
      </PageHero>

      <section className="sec-tight" id="mentors">
        <div className="wrap-site">
          <SampleNotice>Mentor profiles marked "Sample profile" are illustrative and are not verified real mentors. Real SheBiz mentors appear first and open the full request flow.</SampleNotice>
          <div className="filter-bar">
            <label>Industry<select value={industry} onChange={(e) => setIndustry(e.target.value)}>{industries.map((i) => <option key={i}>{i}</option>)}</select></label>
            <label>Format<select value={format} onChange={(e) => setFormat(e.target.value)}><option value="">All formats</option>{MENTOR_FORMATS.map((f) => <option key={f}>{f}</option>)}</select></label>
            <label>Price<select value={pay} onChange={(e) => setPay(e.target.value)}><option value="all">Free and paid</option><option value="free">Free mentorship</option><option value="paid">Paid sessions</option></select></label>
            <span className="result-count" aria-live="polite">{list.length} mentors</span>
          </div>
          {list.length === 0 ? <div className="empty-dark"><EmptyState icon="users" title="No mentors match" text="Try another industry or format." action={<button className="btn btn-pink" onClick={() => { setIndustry('All'); setFormat(''); setPay('all'); }}>Clear filters</button>} /></div>
            : <div className="mentor-grid">{list.map((m) => <MentorCard key={m.id} m={m} onRequest={setReq} />)}</div>}
        </div>
      </section>

      <section className="sec sec-band" id="requests">
        <div className="wrap-site">
          <SectionHead eyebrow="Request status" title="Your mentorship requests" text="Requests you make in this preview are stored in your browser only, so you can see how the journey will look." />
          {reqs.list.length === 0 ? <div className="empty-dark"><EmptyState icon="message" title="No requests yet" text="Choose a mentor above and select Request Mentorship." /></div> : (
            <div className="req-list">
              {reqs.list.map((r) => (
                <div key={r.id} className="req-row">
                  <div className="grow"><b>{r.mentorName}</b><small>{r.goal}{r.price ? ` · ${rand(r.price)} illustrative` : ''}</small></div>
                  <ol className="status-track" aria-label="Request progress"><li className="done">Submitted</li><li>Mentor reviews</li><li>Accepted</li></ol>
                  <Pill tone="blush">{r.status}</Pill>
                  <button className="mini-x" onClick={() => reqs.remove(r.id)} aria-label="Remove request"><Icon name="x" size={14} /></button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="sec" id="marketplace">
        <div className="wrap-site">
          <SectionHead eyebrow="Expert marketplace" title="Free mentorship, plus optional paid expert sessions" text="Start with free mentors. When you want focused, professional help, book a paid consultation." />
          <div className="commission">
            <span className="fm-ic"><Icon name="award" size={24} /></span>
            <div><b>How SheBiz earns on paid sessions</b><p>SheBiz may receive a platform commission of <b>10% to 20%</b> on paid mentorship transactions. Prices below are illustrative.</p></div>
          </div>
          <div className="mentor-grid">
            {paid.map((m) => (
              <Reveal key={m.id} className="exp-card">
                <div className="row" style={{ gap: 12 }}><span className="grow"><b>{m.name}</b><small className="o-org" style={{ display: 'block' }}>{m.role}</small></span><span className="sample-badge">Sample</span></div>
                <div className="chips">{m.expertise.map((e) => <span className="tag-d" key={e}>{e}</span>)}</div>
                <ul className="o-meta light"><li><Icon name="video" size={14} /> {m.format}</li><li><Icon name="clock" size={14} /> 60 minutes · {m.availability}</li></ul>
                <div className="row between"><span className="ms-price on-dark"><b>{rand(m.price)}</b> <span>illustrative</span></span><button className="btn btn-pink btn-sm" onClick={() => setBook(m)}>Book session</button></div>
              </Reveal>
            ))}
          </div>
          <p className="muted-on-dark small" style={{ marginTop: 18 }}>Booking in this preview saves a request in your browser. No payment is taken and no mentor is booked.</p>
        </div>
      </section>

      {req && <RequestModal mentor={req} onClose={() => setReq(null)} onDone={reqs.add} />}
      {book && <BookingModal mentor={book} onClose={() => setBook(null)} onDone={reqs.add} />}
    </>
  );
}

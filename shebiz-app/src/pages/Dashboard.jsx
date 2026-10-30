import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import { PageHeader, Pill, Progress, Skeleton, Tilt } from '../components/ui.jsx';
import { UpgradeBanner } from '../site/components.jsx';
import { useApp } from '../state/store.jsx';
import { MATCH_THRESHOLD, firstName, useOpps } from '../state/hooks.js';
import { businessKpis, businessSetup, fmtPct, greeting, learningProgress, profileCompletion, rand, skillsProgress } from '../lib/metrics.js';

const two = (n) => String(n).padStart(2, '0');

export default function Dashboard() {
  const { user, profile, ready, glob, sales, expenses, products, customers, courseProgress, mentorships } = useApp();
  const nav = useNavigate();
  const opps = useOpps();
  const [ask, setAsk] = useState('');

  const data = useMemo(() => {
    if (!profile) return null;
    const now = new Date();
    const kpi = businessKpis({ sales, expenses, products, customers }, { y: now.getFullYear(), m: now.getMonth() }, now);
    const top = [...opps].filter((o) => o.days >= 0).sort((a, b) => b.match - a.match).slice(0, 3);
    const matching = opps.filter((o) => o.match >= MATCH_THRESHOLD && o.days >= 0);
    const interests = [...(profile.careerInterests || []), ...(profile.interests || [])].join(' ').toLowerCase();
    const mentorMatches = glob.mentors.filter((m) => interests.includes(m.category.toLowerCase().split(' ')[0]) || (m.category === 'Technology' && /software|tech/.test(interests)));
    const connected = mentorships.find((m) => m.status === 'Connected');
    const requested = mentorships.find((m) => m.status === 'Requested');
    const unfinished = glob.courses.filter((c) => (courseProgress.find((p) => p.courseId === c.id)?.completedLessons?.length || 0) < c.lessons.length).length;
    return {
      kpi, top, matching, connected, requested,
      closingSoon: matching.filter((o) => o.days <= 7).length,
      completion: profileCompletion(profile),
      skills: skillsProgress(profile),
      pathway: learningProgress(glob.courses, courseProgress),
      setup: businessSetup(profile, { products, sales, expenses }),
      mentorCount: mentorMatches.length || glob.mentors.length,
      unfinished,
    };
  }, [profile, opps, glob, sales, expenses, products, customers, courseProgress, mentorships]);

  if (!ready || !data || !glob.loaded) {
    return <><PageHeader title="Loading your dashboard..." /><div className="grid-4">{[0, 1, 2, 3].map((i) => <Skeleton key={i} h={130} r={24} />)}</div></>;
  }
  const { kpi, top } = data;
  const sendAsk = (e) => { e.preventDefault(); nav('/ai-assistant', { state: { ask: ask.trim() } }); };

  const stats = [
    { label: 'Skills progress', value: `${data.skills}%`, cls: 'c-purple', sub: `Across ${(profile.skills || []).length} skills`, to: '/profile' },
    { label: 'Matching jobs', value: String(data.matching.length), cls: 'c-coral', sub: data.closingSoon ? `${data.closingSoon} closing this week` : 'Based on your skills', to: '/opportunities' },
    { label: 'Business sales', value: rand(kpi.monthSales), cls: 'c-gold', sub: kpi.salesChange === null ? 'This month' : `${fmtPct(kpi.salesChange)} this month`, to: '/my-business/analytics' },
    { label: 'Mentorship', value: data.connected ? 'Active' : data.requested ? 'Requested' : 'Find a mentor', cls: 'c-green', sub: data.connected?.mentorName || data.requested?.mentorName || 'Browse mentors', to: '/mentorship', small: !data.connected && !data.requested },
  ];

  return (
    <>
      <PageHeader title={`${greeting()}, ${firstName(profile, user)}`} subtitle="Continue building your future." />

      <div className="grid-4" style={{ marginBottom: 24 }}>
        {stats.map((s) => (
          <Tilt as={Link} to={s.to} key={s.label} className="card stat-card" aria-label={`${s.label}: ${s.value}`}>
            <div className="stat-label">{s.label}</div>
            <div className={`stat-num ${s.cls}`} style={s.small ? { fontSize: 22, marginTop: 14, marginBottom: 12 } : undefined}>{s.value}</div>
            <div className="muted small">{s.sub}</div>
          </Tilt>
        ))}
      </div>

      <div className="split-2-1" style={{ marginBottom: 24 }}>
        <div className="card">
          <div className="row between" style={{ marginBottom: 14 }}>
            <h2 style={{ margin: 0 }}>Recommended Opportunities</h2>
            <Link to="/opportunities" className="btn btn-soft btn-sm" style={{ textDecoration: 'none' }}>View all</Link>
          </div>
          {top.length === 0 && <p className="muted">No open opportunities right now. Check back soon.</p>}
          {top.map((o) => (
            <button key={o.id} className="rec-row" onClick={() => nav(`/opportunities/${o.id}`)}>
              <span className="tile tile-sm"><Icon name="briefcase" size={20} /></span>
              <span style={{ flex: 1, minWidth: 0 }}><strong>{o.title}</strong><small>{o.company}</small></span>
              <Pill>{o.match}% match</Pill>
            </button>
          ))}
        </div>
        <div className="card" style={{ padding: 24 }}>
          <form className="ai-card" onSubmit={sendAsk}>
            <div className="eyebrow-p"><Icon name="sparkle" size={20} /> ASK SHEBIZ AI</div>
            <h3>Your career & business assistant</h3>
            <div className="ask-row" style={{ marginTop: 'auto' }}>
              <input className="input" style={{ background: '#fff' }} value={ask} onChange={(e) => setAsk(e.target.value)} placeholder="How can I help you today?" aria-label="Ask SheBiz AI" />
              <button className="btn btn-coral" style={{ padding: 0, width: 48, minWidth: 48 }} aria-label="Ask"><Icon name="arrow" size={18} /></button>
            </div>
          </form>
        </div>
      </div>

      <div className="split-1-1">
        <div className="card">
          <h2>Your progress</h2>
          <div className="stack" style={{ gap: 22, marginTop: 8 }}>
            {[
              ['Complete your profile', data.completion.pct, 'purple', '/profile', data.completion.missing],
              ['Skills pathway', data.pathway, 'coral', '/learning', 'Keep learning'],
              ['Business setup', data.setup.pct, 'gold', '/my-business', data.setup.steps.find((s) => !s.done)?.label],
            ].map(([label, pct, tone, to, hint]) => (
              <Link key={label} to={to} style={{ color: 'inherit', textDecoration: 'none' }} aria-label={`${label}: ${pct}%`}>
                <div className="row between" style={{ marginBottom: 8 }}><strong>{label}</strong><b className={tone === 'purple' ? 'c-purple' : tone === 'coral' ? 'c-coral' : 'c-gold'}>{pct}%</b></div>
                <Progress value={pct} tone={tone} label={label} />
                {hint && pct < 100 && <small className="muted" style={{ display: 'block', marginTop: 6 }}>Next: {hint}</small>}
              </Link>
            ))}
          </div>
        </div>
        <div className="card">
          <h2>This week</h2>
          <div className="stack" style={{ gap: 14, marginTop: 8 }}>
            {[
              [data.matching.length, '', 'New opportunities', 'Matched to your skills', '/opportunities'],
              [data.mentorCount, 'num-coral', 'Recommended mentors', 'Technology & business', '/mentorship'],
              [data.unfinished, 'num-gold', 'Learning resources', 'Ready to continue', '/learning'],
            ].map(([n, cls, t, sub, to]) => (
              <Tilt as={Link} key={t} to={to} className="row" style={{ textDecoration: 'none', color: 'inherit', gap: 16, padding: 4, borderRadius: 18 }} max={3}>
                <span className={`num-tile ${cls}`}>{two(n)}</span>
                <span><strong style={{ display: 'block' }}>{t}</strong><small className="muted">{sub}</small></span>
              </Tilt>
            ))}
          </div>
        </div>
      </div>
      <div style={{ marginTop: 24 }}><UpgradeBanner title="Get more from SheBiz" text="Explore the proposed Pro and Business plans for priority matching, extended AI and advanced analytics." /></div>
    </>
  );
}

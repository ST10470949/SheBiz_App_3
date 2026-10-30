import React, { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Icon from '../../components/Icon.jsx';
import { EmptyState, Progress, useToast } from '../../components/ui.jsx';
import { LEARN_CATEGORIES, SAMPLE_LEARNING, demoStore } from '../data.js';
import { PageHero, SampleBadge, SampleNotice, UpgradeBanner } from '../components.jsx';

const useLearnState = () => {
  const [saved, setSaved] = useState(() => demoStore.get('learnSaved', []));
  const [done, setDone] = useState(() => demoStore.get('learnDone', {}));
  const save = (id) => { const n = saved.includes(id) ? saved.filter((x) => x !== id) : [...saved, id]; setSaved(n); demoStore.set('learnSaved', n); };
  const markLesson = (id, i) => { const cur = done[id] || []; const n = { ...done, [id]: cur.includes(i) ? cur.filter((x) => x !== i) : [...cur, i] }; setDone(n); demoStore.set('learnDone', n); };
  return { saved, done, save, markLesson };
};

export function LearningHub() {
  const [cat, setCat] = useState('All');
  const [q, setQ] = useState('');
  const [level, setLevel] = useState('');
  const [onlySaved, setOnlySaved] = useState(false);
  const st = useLearnState();
  const toast = useToast();
  const list = useMemo(() => SAMPLE_LEARNING.filter((c) => (cat === 'All' || c.category === cat) && (!level || c.level === level) && (!onlySaved || st.saved.includes(c.id)) && (!q.trim() || `${c.title} ${c.description}`.toLowerCase().includes(q.trim().toLowerCase()))), [cat, q, level, onlySaved, st.saved]);
  return (
    <>
      <PageHero eyebrow="Learning Hub" title="Learn a little every day. Grow a lot." text="Practical short courses in digital skills, AI, finance, marketing and leadership, made for busy women.">
        <div className="search-big" role="search"><Icon name="search" size={20} /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search courses" aria-label="Search courses" /></div>
      </PageHero>
      <section className="sec-tight"><div className="wrap-site">
        <SampleNotice>Course cards are sample resources for the design preview. Levels and durations are illustrative. For your real, tracked courses use Learning inside your SheBiz account.</SampleNotice>
        <div className="chip-row">{['All', ...LEARN_CATEGORIES].map((c) => <button key={c} className={`fchip ${cat === c ? 'on' : ''}`} aria-pressed={cat === c} onClick={() => setCat(c)}>{c}</button>)}</div>
        <div className="filter-bar">
          <label>Level<select value={level} onChange={(e) => setLevel(e.target.value)}><option value="">All levels</option><option>Beginner</option><option>Intermediate</option></select></label>
          <label className="check-l"><input type="checkbox" checked={onlySaved} onChange={(e) => setOnlySaved(e.target.checked)} /> Saved only ({st.saved.length})</label>
          <span className="result-count" aria-live="polite">{list.length} resources</span>
        </div>
        {list.length === 0 ? <div className="empty-dark"><EmptyState icon="book" title="No resources match" text="Try another category or keyword." action={<button className="btn btn-pink" onClick={() => { setCat('All'); setQ(''); setLevel(''); setOnlySaved(false); }}>Clear filters</button>} /></div> : (
          <div className="learn-grid">
            {list.map((c) => {
              const pct = Math.round(((st.done[c.id] || []).length / c.lessons.length) * 100);
              return (
                <article key={c.id} className="learn-card">
                  <div className="row between"><span className="cat-pill">{c.category}</span><SampleBadge /></div>
                  <h3>{c.title}</h3><p>{c.description}</p>
                  <ul className="o-meta"><li><Icon name="award" size={14} /> {c.level}</li><li><Icon name="clock" size={14} /> {c.duration}</li><li><Icon name="book" size={14} /> {c.lessons.length} lessons</li></ul>
                  <div><div className="row between small"><span className="muted">Your progress (this browser)</span><b>{pct}%</b></div><Progress value={pct} label={`${c.title} progress`} /></div>
                  <div className="o-actions"><Link to={`/learning-hub/${c.id}`} className="btn btn-pink btn-sm">{pct > 0 ? 'Continue' : 'Start'}</Link>
                    <button className={`save-btn ${st.saved.includes(c.id) ? 'on' : ''}`} aria-pressed={st.saved.includes(c.id)} aria-label={st.saved.includes(c.id) ? 'Unsave course' : 'Save course'} onClick={() => { st.save(c.id); toast.success(st.saved.includes(c.id) ? 'Removed from saved' : 'Saved for later'); }}><Icon name="bookmark" size={16} /></button></div>
                </article>
              );
            })}
          </div>
        )}
        <UpgradeBanner title="Want unlimited courses and certificates?" text="The proposed Pro plan adds unlimited course enrolments and certificates where supported." />
      </div></section>
    </>
  );
}

export function LearningDetail() {
  const { id } = useParams();
  const c = SAMPLE_LEARNING.find((x) => x.id === id);
  const st = useLearnState();
  const [idx, setIdx] = useState(0);
  if (!c) return <section className="sec"><div className="wrap-site empty-dark"><EmptyState icon="book" title="Resource not found" action={<Link to="/learning-hub" className="btn btn-pink">Back to Learning Hub</Link>} /></div></section>;
  const done = st.done[c.id] || [];
  const pct = Math.round((done.length / c.lessons.length) * 100);
  return (
    <>
      <section className="page-hero"><div className="wrap-site"><Link to="/learning-hub" className="back-s"><Icon name="arrowLeft" size={16} /> Learning Hub</Link>
        <span className="cat-pill dark">{c.category}</span> <SampleBadge />
        <h1 style={{ fontSize: 'clamp(30px,4vw,46px)' }}>{c.title}</h1><p className="lead">{c.description}</p>
        <div style={{ maxWidth: 420, marginTop: 18 }}><div className="row between small" style={{ marginBottom: 6 }}><span className="muted-on-dark">{done.length} of {c.lessons.length} lessons</span><b>{pct}%</b></div><Progress value={pct} label="Progress" /></div></div></section>
      <section className="sec-tight"><div className="wrap-site mp-grid">
        <div className="lcard"><div className="label-s">Lesson {idx + 1} of {c.lessons.length}</div><h2 style={{ fontSize: 26, margin: '8px 0 14px' }}>{c.lessons[idx]}</h2>
          <p className="muted">Sample lesson outline. Full lesson content will be added with real learning material in a later phase.</p><hr className="divider" />
          <div className="row between wrap"><div className="row-wrap"><button className="btn btn-ghost btn-sm" disabled={idx === 0} onClick={() => setIdx(idx - 1)}>Previous</button><button className="btn btn-ghost btn-sm" disabled={idx === c.lessons.length - 1} onClick={() => setIdx(idx + 1)}>Next</button></div>
            <button className={`btn ${done.includes(idx) ? 'btn-soft' : 'btn-pink'}`} onClick={() => st.markLesson(c.id, idx)}>{done.includes(idx) ? 'Completed. Undo' : 'Mark as complete'}</button></div></div>
        <aside className="lcard"><h2>Lessons</h2><div className="stack" style={{ gap: 8 }}>{c.lessons.map((l, i) => <button key={l} className={`lesson-s ${i === idx ? 'cur' : ''}`} onClick={() => setIdx(i)}><span className={`circle-s ${done.includes(i) ? 'done' : ''}`}>{done.includes(i) && <Icon name="check" size={12} stroke={3} />}</span>{i + 1}. {l}</button>)}</div>
          <button className={`btn btn-lav btn-block mt`} onClick={() => st.save(c.id)}>{st.saved.includes(c.id) ? 'Saved' : 'Save for later'}</button></aside>
      </div></section>
    </>
  );
}

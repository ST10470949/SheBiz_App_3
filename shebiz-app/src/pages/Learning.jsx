import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import { EmptyState, PageHeader, Pill, Progress, Skeleton, Spinner, Tilt, useToast } from '../components/ui.jsx';
import { useApp } from '../state/store.jsx';
import { learningProgress } from '../lib/metrics.js';

const ICONS = { Technology: 'book', Marketing: 'chart', Finance: 'bag', Business: 'store' };
const TILES = ['', 'tile-blush', 'tile-cream', ''];
const TONES = ['purple', 'coral', 'gold', 'green'];

const doneIds = (course, courseProgress) => (courseProgress.find((p) => p.courseId === course.id)?.completedLessons || []).filter((id) => course.lessons.some((l) => l.id === id));

function CourseGrid() {
  const { glob, courseProgress, ready } = useApp();
  const nav = useNavigate();
  const overall = learningProgress(glob.courses, courseProgress);

  return (
    <>
      <PageHeader title="Learning" subtitle="Build practical skills, one short lesson at a time." />
      <Tilt className="card" style={{ marginBottom: 24 }} max={2}>
        <div className="row between" style={{ marginBottom: 10 }}><strong>Your overall learning progress</strong><b className="c-purple">{overall}%</b></div>
        <Progress value={overall} label="Overall learning progress" />
        <p className="muted small" style={{ marginTop: 10 }}>This is the same number as your Skills pathway on the dashboard.</p>
      </Tilt>
      {!ready || !glob.loaded ? <div className="grid-2">{[0, 1, 2, 3].map((i) => <Skeleton key={i} h={220} r={24} />)}</div> : glob.courses.length === 0 ? <div className="card"><EmptyState icon="book" title="No courses yet" text="Check back soon." /></div> : (
        <div className="grid-2">
          {glob.courses.map((c, i) => {
            const done = doneIds(c, courseProgress).length;
            const pct = Math.round((done / c.lessons.length) * 100);
            const label = pct === 100 ? 'Review' : done > 0 ? 'Continue' : 'Start';
            return (
              <Tilt key={c.id} className="card course" max={3}>
                <div className="row between" style={{ alignItems: 'flex-start' }}>
                  <span className={`tile ${TILES[i % 4]}`}><Icon name={ICONS[c.category] || 'book'} size={22} /></span>
                  <Pill tone={pct === 100 ? 'green-soft' : 'lav'}>{pct === 100 ? 'Completed' : c.category}</Pill>
                </div>
                <div><h2>{c.title}</h2><p className="muted" style={{ marginTop: 6 }}>{c.description}</p></div>
                <div>
                  <div className="row between small" style={{ marginBottom: 8 }}><span className="muted">{done} of {c.lessons.length} lessons</span><b>{pct}%</b></div>
                  <Progress value={pct} tone={TONES[i % 4]} label={`${c.title} progress`} />
                </div>
                <button className="btn" onClick={() => nav(`/learning/${c.id}`)} style={{ marginTop: 'auto' }}>{label} <Icon name="arrow" size={15} /></button>
              </Tilt>
            );
          })}
        </div>
      )}
    </>
  );
}

function CourseView({ courseId }) {
  const { glob, courseProgress, api, ready } = useApp();
  const nav = useNavigate();
  const toast = useToast();
  const course = glob.courses.find((c) => c.id === courseId);
  const [idx, setIdx] = useState(null);
  const [busy, setBusy] = useState(false);

  const done = useMemo(() => (course ? doneIds(course, courseProgress) : []), [course, courseProgress]);

  // open at the first lesson that is not finished yet
  useEffect(() => {
    if (course && idx === null) { const first = course.lessons.findIndex((l) => !done.includes(l.id)); setIdx(first === -1 ? 0 : first); }
  }, [course, done, idx]);

  if (!ready || !glob.loaded) return <Skeleton h={420} r={24} />;
  if (!course) return <div className="card"><EmptyState icon="book" title="Course not found" action={<Link to="/learning" className="btn" style={{ textDecoration: 'none' }}>Back to Learning</Link>} /></div>;
  if (idx === null) return <Skeleton h={420} r={24} />;

  const lesson = course.lessons[idx];
  const isDone = done.includes(lesson.id);
  const pct = Math.round((done.length / course.lessons.length) * 100);

  const toggle = async () => {
    setBusy(true);
    try {
      const next = isDone ? done.filter((id) => id !== lesson.id) : [...done, lesson.id];
      await api.set('courseProgress', course.id, { courseId: course.id, completedLessons: next });
      if (!isDone) {
        if (next.length === course.lessons.length) { toast.success(`Course complete: ${course.title}. Well done!`); api.notify('Course completed', course.title).catch(() => {}); } else toast.success('Lesson marked as complete');
        if (idx < course.lessons.length - 1) setIdx(idx + 1);
      } else toast.info('Lesson marked as not complete');
    } catch (e) { toast.error(e.message); } finally { setBusy(false); }
  };

  return (
    <>
      <button className="link-btn" onClick={() => nav('/learning')} style={{ marginBottom: 18 }}><Icon name="arrowLeft" size={16} /> Back to Learning</button>
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="row between" style={{ flexWrap: 'wrap' }}>
          <div><Pill tone="lav">{course.category}</Pill><h1 style={{ fontSize: 28, marginTop: 10 }}>{course.title}</h1><p className="muted" style={{ marginTop: 6 }}>{course.description}</p></div>
          <div style={{ minWidth: 200, flex: '0 1 260px' }}>
            <div className="row between small" style={{ marginBottom: 8 }}><span className="muted">{done.length} of {course.lessons.length} lessons</span><b>{pct}%</b></div>
            <Progress value={pct} label="Course progress" />
          </div>
        </div>
      </div>

      <div className="split-2-1" style={{ gridTemplateColumns: 'minmax(0,1fr) minmax(0,1.8fr)', alignItems: 'start' }}>
        <div className="card">
          <h2>Lessons</h2>
          <div className="stack" style={{ gap: 10 }}>
            {course.lessons.map((l, i) => {
              const d = done.includes(l.id);
              return (
                <button key={l.id} className={`lesson ${i === idx ? 'cur' : ''} ${d ? 'done' : ''}`} onClick={() => setIdx(i)} aria-current={i === idx ? 'true' : undefined}>
                  <span className="circle">{d && <Icon name="check" size={13} stroke={3} />}</span>
                  <span className="grow"><b style={{ display: 'block' }}>{i + 1}. {l.title}</b></span>
                </button>
              );
            })}
          </div>
        </div>
        <div className="card">
          <div className="label-s">Lesson {idx + 1} of {course.lessons.length}</div>
          <h2 style={{ fontSize: 24, margin: '8px 0 16px' }}>{lesson.title}</h2>
          <p style={{ lineHeight: 1.8, fontSize: 16 }}>{lesson.content}</p>
          <hr className="divider" />
          <div className="row between" style={{ flexWrap: 'wrap' }}>
            <div className="row-wrap">
              <button className="btn btn-ghost" onClick={() => setIdx(idx - 1)} disabled={idx === 0}><Icon name="arrowLeft" size={15} /> Previous</button>
              <button className="btn btn-ghost" onClick={() => setIdx(idx + 1)} disabled={idx === course.lessons.length - 1}>Next <Icon name="arrow" size={15} /></button>
            </div>
            <button className={`btn ${isDone ? 'btn-soft' : ''}`} onClick={toggle} disabled={busy}>{busy ? <Spinner /> : isDone ? <><Icon name="check" size={15} stroke={3} /> Completed. Undo</> : 'Mark as complete'}</button>
          </div>
        </div>
      </div>
    </>
  );
}

export default function Learning() {
  const { courseId } = useParams();
  return courseId ? <CourseView courseId={courseId} key={courseId} /> : <CourseGrid />;
}

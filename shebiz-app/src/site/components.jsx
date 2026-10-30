import React, { useEffect, useId, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import { Field, Modal, Spinner, useReducedMotion } from '../components/ui.jsx';

export const SampleBadge = ({ children = 'Sample' }) => <span className="sample-badge" title="Illustrative content for design preview. Not a real listing.">{children}</span>;

export function SampleNotice({ children }) {
  return <div className="demo-note" role="note"><b>Preview content.</b> {children || 'Items marked "Sample" are illustrative and are not real organisations, people or offers.'}</div>;
}

/** Fades content in when it scrolls into view. Shows immediately for reduced motion. */
export function Reveal({ children, delay = 0, as: Tag = 'div', className = '', ...rest }) {
  const ref = useRef(null);
  const reduced = useReducedMotion();
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    if (reduced || !('IntersectionObserver' in window)) { setSeen(true); return undefined; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setSeen(true); io.disconnect(); } }, { rootMargin: '0px 0px -8% 0px' });
    io.observe(ref.current); return () => io.disconnect();
  }, [reduced]);
  return <Tag ref={ref} className={`reveal ${seen ? 'in' : ''} ${className}`} style={{ transitionDelay: `${delay}ms` }} {...rest}>{children}</Tag>;
}

export function SectionHead({ eyebrow, title, text, center = false, light = true }) {
  return (
    <div className={`sec-head ${center ? 'center' : ''}`}>
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <h2>{title}</h2>
      {text && <p>{text}</p>}
    </div>
  );
}

export function PageHero({ eyebrow, title, text, children, art }) {
  return (
    <section className="page-hero">
      <div className="wrap-site hero-grid-s">
        <div>
          {eyebrow && <span className="eyebrow">{eyebrow}</span>}
          <h1>{title}</h1>
          {text && <p className="lead">{text}</p>}
          {children}
        </div>
        {art && <div className="page-hero-art">{art}</div>}
      </div>
    </section>
  );
}

/** Illustrated portrait used as a profile image (stylised, not a photograph). */
export function Portrait({ skin = '#6b3f2a', tint = 'lav', size = 96, hair = '#1a0f14', style = 'afro', label }) {
  const id = useId().replace(/:/g, '');
  const bg = { lav: ['#b9a1ff', '#7138c8'], blush: ['#f5b7d7', '#e84a9b'], cream: ['#fce5f1', '#b9a1ff'] }[tint] || ['#b9a1ff', '#7138c8'];
  return (
    <svg className="portrait" width={size} height={size} viewBox="0 0 100 100" role="img" aria-label={label || 'Profile illustration'}>
      <defs><linearGradient id={`pg${id}`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={bg[0]} /><stop offset="1" stopColor={bg[1]} /></linearGradient></defs>
      <rect width="100" height="100" rx="26" fill={`url(#pg${id})`} />
      <path d="M14 100c2-26 18-34 36-34s34 8 36 34z" fill="#261338" opacity=".9" />
      <path d="M38 70l12 12 12-12" fill="none" stroke="#f5b7d7" strokeWidth="3" strokeLinecap="round" />
      {style === 'afro' ? <circle cx="50" cy="38" r="26" fill={hair} /> : <path d="M24 42c0-30 52-30 52 0v8H24z" fill={hair} />}
      <ellipse cx="50" cy="44" rx="17" ry="19" fill={skin} />
      <circle cx="43" cy="42" r="1.8" fill="#1a0f14" /><circle cx="57" cy="42" r="1.8" fill="#1a0f14" />
      <path d="M44 52q6 5 12 0" fill="none" stroke="#c23a7d" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

const validEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v).trim());

/**
 * Generic enquiry / request form with validation and a confirmation state.
 * Frontend only: nothing is sent anywhere. `onSubmit` receives the validated values so a real backend can be added later.
 */
export function EnquiryModal({ title, intro, fields, submitLabel = 'Send enquiry', confirmTitle = 'Thank you', confirmText, onClose, onSubmit }) {
  const [vals, setVals] = useState(() => Object.fromEntries(fields.map((f) => [f.name, f.initial || ''])));
  const [errs, setErrs] = useState({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const set = (k) => (e) => { setVals({ ...vals, [k]: e.target.value }); if (errs[k]) setErrs({ ...errs, [k]: undefined }); };

  const submit = async (e) => {
    e.preventDefault();
    const er = {};
    fields.forEach((f) => {
      const v = String(vals[f.name] || '').trim();
      if (f.required && !v) er[f.name] = `Please enter ${f.label.toLowerCase()}.`;
      else if (f.type === 'email' && v && !validEmail(v)) er[f.name] = 'Enter a valid email address.';
      else if (f.min && v && v.length < f.min) er[f.name] = `Please write at least ${f.min} characters.`;
    });
    setErrs(er); if (Object.keys(er).length) return;
    setBusy(true);
    await new Promise((r) => setTimeout(r, 500));
    onSubmit?.(vals);
    setBusy(false); setDone(true);
  };

  if (done) {
    return (
      <Modal title={confirmTitle} onClose={onClose} width={460} footer={<button className="btn" onClick={onClose}>Close</button>}>
        <div className="center stack" style={{ alignItems: 'center' }}>
          <div className="empty-icon" style={{ background: '#fbd9ea', color: '#b8266f' }}><Icon name="checkCircle" size={30} /></div>
          <p>{confirmText || 'Your details have been recorded in this preview.'}</p>
          <p className="muted small">Preview only: nothing was sent to anyone yet. Real submissions will be connected in a later phase.</p>
        </div>
      </Modal>
    );
  }
  return (
    <Modal title={title} onClose={onClose} footer={<><button className="btn btn-ghost" onClick={onClose}>Cancel</button><button className="btn btn-pink" form="enq-form" disabled={busy}>{busy ? <Spinner /> : submitLabel}</button></>}>
      <form id="enq-form" className="stack" onSubmit={submit} noValidate>
        {intro && <p className="muted">{intro}</p>}
        {fields.map((f) => (
          <Field key={f.name} label={f.label} error={errs[f.name]} hint={f.hint}>
            {f.type === 'textarea' ? <textarea value={vals[f.name]} onChange={set(f.name)} placeholder={f.placeholder} maxLength={800} />
              : f.type === 'select' ? <select value={vals[f.name]} onChange={set(f.name)}><option value="">Select...</option>{f.options.map((o) => <option key={o}>{o}</option>)}</select>
                : <input type={f.type || 'text'} value={vals[f.name]} onChange={set(f.name)} placeholder={f.placeholder} autoComplete={f.autoComplete} />}
          </Field>
        ))}
      </form>
    </Modal>
  );
}

export function UpgradeBanner({ title = 'Unlock more with SheBiz Pro or Business', text = 'Proposed plans add priority matching, unlimited products, advanced analytics and more.', cta = 'See membership plans' }) {
  return (
    <div className="upgrade-banner">
      <span className="upgrade-icon"><Icon name="sparkle" size={22} /></span>
      <div className="grow"><b>{title}</b><p>{text} <span className="muted-on-dark">Proposed plans, not yet launched.</span></p></div>
      <Link to="/membership" className="btn btn-white btn-sm">{cta}</Link>
    </div>
  );
}

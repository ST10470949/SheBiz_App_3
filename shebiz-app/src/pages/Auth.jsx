import React, { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Icon, { Logo } from '../components/Icon.jsx';
import { Field, PasswordInput, Spinner, useToast } from '../components/ui.jsx';
import { useApp } from '../state/store.jsx';
import { INTEREST_OPTIONS } from '../data/seed.js';
import { passwordChecks, passwordScore, validEmail, validPhone } from '../lib/metrics.js';

const CollabScene = lazy(() => import('../components/CollabScene.jsx'));

const VERIFY_KEY = 'shebiz.verify';
const saveSent = (info) => { try { sessionStorage.setItem(VERIFY_KEY, JSON.stringify({ ...info, at: Date.now() })); } catch { /* ignore */ } };
const readSent = () => { try { return JSON.parse(sessionStorage.getItem(VERIFY_KEY) || 'null'); } catch { return null; } };

function AuthLeft({ title, text }) {
  const [noGL, setNoGL] = useState(false);
  return (
    <aside className="auth-left">
      <Link to="/" style={{ textDecoration: 'none', position: 'relative', zIndex: 2 }}><Logo light size={34} /></Link>
      {!noGL && <div className="auth-scene"><Suspense fallback={null}><CollabScene focus="mentor" hotspots={false} onFail={() => setNoGL(true)} /></Suspense></div>}
      <h1>{title}</h1>
      <p>{text}</p>
      <div className="steps">
        {[['01', 'Create your profile'], ['02', 'Choose your interests'], ['03', 'Get personalised guidance']].map(([n, t]) => (
          <div className="step" key={n}><i>{n}</i>{t}</div>
        ))}
      </div>
    </aside>
  );
}

function GoogleButton({ onDone }) {
  const { backend } = useApp();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  if (!backend?.supportsGoogle) return null;
  const go = async () => {
    setBusy(true);
    try { await backend.loginGoogle(); onDone?.(); } catch (e) { toast.error(e.message); } finally { setBusy(false); }
  };
  return (
    <>
      <div className="or">or</div>
      <button type="button" className="btn btn-ghost btn-block" onClick={go} disabled={busy}>
        {busy ? <Spinner /> : <><svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.800 2.400 30.300 0 24 0 14.600 0 6.500 5.400 2.600 13.200l7.900 6.100C12.400 13.600 17.700 9.500 24 9.500z" /><path fill="#4285F4" d="M46.500 24.500c0-1.600-.1-3.100-.4-4.500H24v9h12.700c-.6 3-2.300 5.500-4.800 7.200l7.500 5.800c4.400-4.100 7.100-10.100 7.100-17.500z" /><path fill="#FBBC05" d="M10.500 28.700A14.500 14.500 0 0 1 9.500 24c0-1.600.3-3.200.8-4.700l-7.900-6.100A24 24 0 0 0 0 24c0 3.900.9 7.500 2.600 10.800l7.900-6.100z" /><path fill="#34A853" d="M24 48c6.500 0 11.900-2.100 15.900-5.800l-7.500-5.800c-2.100 1.400-4.900 2.300-8.400 2.300-6.300 0-11.600-4.100-13.500-9.800l-7.900 6.100C6.500 42.600 14.600 48 24 48z" /></svg> Continue with Google</>}
      </button>
    </>
  );
}

// ======================= REGISTER =======================
export function Register() {
  const { backend } = useApp();
  const nav = useNavigate();
  const toast = useToast();
  const [f, setF] = useState({ fullName: '', email: '', phone: '', location: '', password: '', confirm: '' });
  const [interests, setInterests] = useState([]);
  const [terms, setTerms] = useState(false);
  const [errs, setErrs] = useState({});
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => { setF({ ...f, [k]: e.target.value }); if (errs[k]) setErrs({ ...errs, [k]: undefined }); };
  const checks = passwordChecks(f.password);
  const score = passwordScore(f.password);

  const validate = () => {
    const e = {};
    if (f.fullName.trim().length < 2) e.fullName = 'Enter your full name.';
    if (!validEmail(f.email)) e.email = 'Enter a valid email address.';
    if (!validPhone(f.phone)) e.phone = 'Use a South African number, e.g. +27 71 234 5678.';
    if (!f.location.trim()) e.location = 'Enter your town or city.';
    if (!(checks.length && checks.upper && checks.lower && checks.number)) e.password = 'Use 8+ characters with an uppercase letter, a lowercase letter and a number.';
    if (f.confirm !== f.password) e.confirm = 'Passwords do not match.';
    if (!interests.length) e.interests = 'Choose at least one interest.';
    if (!terms) e.terms = 'Please accept the Terms and Privacy Policy to continue.';
    return e;
  };
  const submit = async (ev) => {
    ev.preventDefault();
    const e = validate(); setErrs(e);
    if (Object.keys(e).length) { document.querySelector('.has-error input, .has-error select, .err')?.scrollIntoView({ block: 'center', behavior: 'smooth' }); return; }
    setBusy(true);
    try {
      await backend.register({ ...f, interests });
      try { const info = await backend.sendCode(); saveSent(info); } catch (x) { toast.error(x.message); }
      toast.success('Account created! Verify your email to continue.');
      nav('/verify-email', { replace: true });
    } catch (x) {
      toast.error(x.message);
      if (x.code === 'auth/email-already-in-use') setErrs({ email: x.message });
    } finally { setBusy(false); }
  };

  return (
    <div className="auth">
      <AuthLeft title="Your next chapter starts here." text="Find opportunities, meet mentors, learn new skills, and build a stronger business with SheBiz." />
      <div className="auth-right">
        <h1>Create your SheBiz account</h1>
        <p className="muted">Already have an account? <Link to="/login">Log in</Link></p>
        <form className="stack" onSubmit={submit} noValidate style={{ gap: 18 }}>
          <div className="form-grid">
            <Field label="Full name" error={errs.fullName}><input value={f.fullName} onChange={set('fullName')} placeholder="Thandi Mokoena" autoComplete="name" /></Field>
            <Field label="Email" error={errs.email}><input type="email" value={f.email} onChange={set('email')} placeholder="you@example.com" autoComplete="email" inputMode="email" /></Field>
            <Field label="Phone number" error={errs.phone}><input type="tel" value={f.phone} onChange={set('phone')} placeholder="+27 71 234 5678" autoComplete="tel" inputMode="tel" /></Field>
            <Field label="Location" error={errs.location}><input value={f.location} onChange={set('location')} placeholder="Gqeberha" autoComplete="address-level2" /></Field>
            <Field label="Password" error={errs.password} className="full">
              <PasswordInput value={f.password} onChange={set('password')} placeholder="Create a strong password" autoComplete="new-password" />
            </Field>
            {f.password && (
              <div className="full" style={{ marginTop: -8 }}>
                <div className="meter" aria-hidden="true">{[1, 2, 3, 4].map((i) => <span key={i} className={score >= i ? `on-${Math.min(score, 4)}` : ''} />)}</div>
                <small className="hint">{score <= 2 ? 'Weak' : score === 3 ? 'Good' : 'Strong'} · {[['8+ characters', checks.length], ['Uppercase', checks.upper], ['Lowercase', checks.lower], ['Number', checks.number]].map(([l, ok]) => `${ok ? '✓' : '○'} ${l}`).join('   ')}</small>
              </div>
            )}
            <Field label="Confirm password" error={errs.confirm} className="full"><PasswordInput value={f.confirm} onChange={set('confirm')} placeholder="Repeat your password" autoComplete="new-password" /></Field>
          </div>
          <div>
            <strong style={{ display: 'block', marginBottom: 12 }}>What are you interested in?</strong>
            <div className="check-cards">
              {INTEREST_OPTIONS.map((o) => {
                const on = interests.includes(o);
                return (
                  <button type="button" key={o} className="check-card" role="checkbox" aria-checked={on} onClick={() => { setInterests(on ? interests.filter((x) => x !== o) : [...interests, o]); setErrs({ ...errs, interests: undefined }); }}>
                    <span className="box">{on && <Icon name="check" size={13} stroke={3} />}</span>{o}
                  </button>
                );
              })}
            </div>
            {errs.interests && <small className="err" role="alert">{errs.interests}</small>}
          </div>
          <div>
            <label className="row" style={{ cursor: 'pointer', alignItems: 'flex-start' }}>
              <input type="checkbox" checked={terms} onChange={(e) => { setTerms(e.target.checked); setErrs({ ...errs, terms: undefined }); }} style={{ width: 20, height: 20, marginTop: 2, accentColor: '#6938ff' }} />
              <span className="muted">I agree to the Terms and Privacy Policy, and to SheBiz protecting my information.</span>
            </label>
            {errs.terms && <small className="err" role="alert">{errs.terms}</small>}
          </div>
          <button className="btn btn-block" style={{ minHeight: 56 }} disabled={busy}>{busy ? <Spinner /> : <>Create Account <Icon name="arrow" size={16} /></>}</button>
          <GoogleButton />
          <div className="info-box"><Icon name="sparkle" size={22} className="c-purple" /><div><strong>SheBiz personalises opportunities and learning from your choices.</strong><small>You can update these interests at any time.</small></div></div>
        </form>
      </div>
    </div>
  );
}

// ======================= LOGIN =======================
export function Login() {
  const { backend } = useApp();
  const nav = useNavigate();
  const loc = useLocation();
  const toast = useToast();
  const [f, setF] = useState({ email: '', password: '' });
  const [remember, setRemember] = useState(true);
  const [errs, setErrs] = useState({});
  const [busy, setBusy] = useState(false);
  const [formErr, setFormErr] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    const er = {};
    if (!validEmail(f.email)) er.email = 'Enter a valid email address.';
    if (!f.password) er.password = 'Enter your password.';
    setErrs(er); setFormErr('');
    if (Object.keys(er).length) return;
    setBusy(true);
    try {
      const u = await backend.login(f.email, f.password, remember);
      toast.success('Welcome back!');
      nav(u.emailVerified ? (loc.state?.from || '/dashboard') : '/verify-email', { replace: true });
    } catch (x) { setFormErr(x.message); } finally { setBusy(false); }
  };

  return (
    <div className="auth">
      <AuthLeft title="Welcome back to SheBiz." text="Pick up where you left off: opportunities, mentors, learning and your business." />
      <div className="auth-right">
        <h1>Log in to SheBiz</h1>
        <p className="muted">New here? <Link to="/register">Create an account</Link></p>
        <form className="stack" onSubmit={submit} noValidate style={{ gap: 18, maxWidth: 520 }}>
          {formErr && <div className="info-box" role="alert" style={{ background: '#fde6e8' }}><Icon name="alert" size={20} style={{ color: 'var(--red)' }} /><strong>{formErr}</strong></div>}
          <Field label="Email" error={errs.email}><input type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} placeholder="you@example.com" autoComplete="email" inputMode="email" /></Field>
          <Field label="Password" error={errs.password}><PasswordInput value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} placeholder="Your password" autoComplete="current-password" /></Field>
          <div className="row between">
            <label className="row" style={{ cursor: 'pointer', gap: 8 }}><input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} style={{ width: 18, height: 18, accentColor: '#6938ff' }} /> Remember me</label>
            <Link to="/forgot-password">Forgot password?</Link>
          </div>
          <button className="btn btn-block" style={{ minHeight: 54 }} disabled={busy}>{busy ? <Spinner /> : <>Log in <Icon name="arrow" size={16} /></>}</button>
          <GoogleButton onDone={() => nav('/dashboard')} />
        </form>
      </div>
    </div>
  );
}

// ======================= FORGOT PASSWORD =======================
export function ForgotPassword() {
  const { backend } = useApp();
  const [email, setEmail] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    if (!validEmail(email)) { setErr('Enter a valid email address.'); return; }
    setErr(''); setBusy(true);
    try { const r = await backend.sendResetEmail(email); setSent(r); } catch (x) { setErr(x.message); } finally { setBusy(false); }
  };
  return (
    <div className="auth-simple">
      <div className="auth-card">
        <Link to="/" style={{ textDecoration: 'none' }}><Logo /></Link>
        {!sent ? (
          <form className="stack" onSubmit={submit} noValidate style={{ marginTop: 24 }}>
            <h1 style={{ fontSize: 28 }}>Reset your password</h1>
            <p className="muted">Enter your email and we will send you a link to choose a new password.</p>
            <Field label="Email" error={err}><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="thandi@email.com" autoComplete="email" /></Field>
            <button className="btn btn-block" disabled={busy}>{busy ? <Spinner /> : 'Send reset link'}</button>
            <Link to="/login" className="center">Back to log in</Link>
          </form>
        ) : (
          <div className="stack center" style={{ marginTop: 24, alignItems: 'center' }}>
            <div className="empty-icon" style={{ background: '#e1f5ec', color: 'var(--green)' }}><Icon name="mail" size={28} /></div>
            <h1 style={{ fontSize: 26 }}>Check your email</h1>
            <p className="muted">If an account exists for <strong>{email}</strong>, we have sent a link to reset your password. Check your spam folder too.</p>
            <Link to="/login" className="btn btn-block" style={{ textDecoration: 'none' }}>Back to log in</Link>
          </div>
        )}
      </div>
    </div>
  );
}

// ======================= VERIFY EMAIL =======================
export function VerifyEmail() {
  const { backend, user, refreshUser } = useApp();
  const nav = useNavigate();
  const toast = useToast();
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [busy, setBusy] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const [done, setDone] = useState(false);
  const [info, setInfo] = useState(() => readSent());
  const [left, setLeft] = useState(0);
  const inputs = useRef([]);
  const finishing = useRef(false);
  const autoSent = useRef(false);

  const mode = info?.mode || 'code';

  // already verified (e.g. opened the email link in another tab)? continue.
  useEffect(() => { if (user?.emailVerified && !finishing.current) nav('/dashboard', { replace: true }); }, [user, nav]);

  // first visit: send the code automatically once per session
  useEffect(() => {
    if (!user || user.emailVerified || autoSent.current) return;
    autoSent.current = true;
    const existing = readSent();
    if (existing && Date.now() - existing.at < 10 * 60000) return;
    backend.sendCode().then((i) => { saveSent(i); setInfo({ ...i, at: Date.now() }); }).catch((e) => setError(e.message));
  }, [user, backend]);

  // resend countdown
  useEffect(() => {
    const tick = () => setLeft(Math.max(0, 60 - Math.floor((Date.now() - (info?.at || 0)) / 1000)));
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [info]);

  // link mode: check every few seconds whether the user clicked the link
  useEffect(() => {
    if (mode !== 'link') return undefined;
    const t = setInterval(() => { refreshUser(); }, 4000);
    return () => clearInterval(t);
  }, [mode, refreshUser]);

  if (user === undefined) return <div className="boot"><span className="spinner" /></div>;
  if (!user) return <Navigate to="/login" replace />;

  const setDigit = (i, v) => {
    const d = v.replace(/\D/g, '');
    if (!d) { const n = [...digits]; n[i] = ''; setDigits(n); return; }
    const n = [...digits];
    d.split('').slice(0, 6 - i).forEach((ch, k) => { n[i + k] = ch; });
    setDigits(n);
    const next = Math.min(i + d.length, 5);
    inputs.current[next]?.focus();
    if (n.every(Boolean)) submit(n.join(''));
  };
  const onKey = (i, e) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) { inputs.current[i - 1]?.focus(); }
    if (e.key === 'ArrowLeft' && i > 0) inputs.current[i - 1]?.focus();
    if (e.key === 'ArrowRight' && i < 5) inputs.current[i + 1]?.focus();
  };
  const onPaste = (e) => {
    const t = (e.clipboardData.getData('text') || '').replace(/\D/g, '').slice(0, 6);
    if (!t) return;
    e.preventDefault();
    const n = ['', '', '', '', '', ''];
    t.split('').forEach((c, k) => { n[k] = c; });
    setDigits(n);
    inputs.current[Math.min(t.length, 5)]?.focus();
    if (t.length === 6) submit(t);
  };

  const submit = async (code = digits.join('')) => {
    if (code.length !== 6 || busy) { if (code.length !== 6) setError('Enter the 6-digit code.'); return; }
    setBusy(true); setError(''); finishing.current = true;
    try {
      await backend.verifyCode(code);
      setDone(true);
      try { sessionStorage.removeItem(VERIFY_KEY); } catch { /* ignore */ }
      toast.success('Email verified. Welcome to SheBiz!');
      setTimeout(() => nav('/dashboard', { replace: true }), 1100);
    } catch (e) {
      finishing.current = false;
      setError(e.message); setShake(true); setTimeout(() => setShake(false), 450);
      setDigits(['', '', '', '', '', '']); inputs.current[0]?.focus();
    } finally { setBusy(false); }
  };

  const resend = async () => {
    setResending(true); setError('');
    try {
      const i = await backend.sendCode(); saveSent(i); setInfo({ ...i, at: Date.now() });
      toast.success(i.mode === 'link' ? 'Verification link sent' : 'New code sent');
    } catch (e) { setError(e.message); } finally { setResending(false); }
  };
  const checkLink = async () => {
    setBusy(true);
    try { const u = await refreshUser(); if (u?.emailVerified) { setDone(true); toast.success('Email verified!'); setTimeout(() => nav('/dashboard', { replace: true }), 900); } else setError('We have not seen the verification yet. Open the link in the email, then try again.'); } catch (e) { setError(e.message); } finally { setBusy(false); }
  };
  const leave = async () => { await backend.logout(); nav('/register'); };

  if (done) {
    return (
      <div className="auth-simple"><div className="auth-card center" style={{ alignItems: 'center' }}>
        <div className="empty-icon" style={{ background: '#e1f5ec', color: 'var(--green)', margin: '0 auto 16px', width: 80, height: 80, borderRadius: 28 }}><Icon name="checkCircle" size={44} /></div>
        <h1 style={{ fontSize: 28 }}>You are verified!</h1><p className="muted" style={{ marginTop: 8 }}>Taking you to your dashboard...</p>
      </div></div>
    );
  }

  return (
    <div className="auth-simple">
      <div className="auth-card">
        <Link to="/" style={{ textDecoration: 'none' }}><Logo /></Link>
        <div className="stack" style={{ marginTop: 22 }}>
          <div className="empty-icon" style={{ margin: 0 }}><Icon name="mail" size={26} /></div>
          <h1 style={{ fontSize: 28 }}>{mode === 'link' ? 'Check your email' : 'Verify your email'}</h1>
          {mode === 'link' ? (
            <p className="muted">We sent a verification link to <strong style={{ color: 'var(--ink)' }}>{user.email}</strong>. Open the email and tap the link, then come back and press the button below. Check your spam folder if you cannot see it.</p>
          ) : (
            <p className="muted">We sent a 6-digit code to <strong style={{ color: 'var(--ink)' }}>{user.email}</strong>. It expires in 10 minutes.</p>
          )}

          
          {mode !== 'link' && (
            <>
              <div className={`otp ${shake ? 'shake' : ''}`} onPaste={onPaste} role="group" aria-label="6-digit verification code">
                {digits.map((d, i) => (
                  <input key={i} ref={(el) => { inputs.current[i] = el; }} value={d} className={d ? 'filled' : ''} inputMode="numeric" pattern="[0-9]*" autoComplete={i === 0 ? 'one-time-code' : 'off'} maxLength={6}
                    aria-label={`Digit ${i + 1}`} onChange={(e) => setDigit(i, e.target.value)} onKeyDown={(e) => onKey(i, e)} onFocus={(e) => e.target.select()} autoFocus={i === 0} />
                ))}
              </div>
              {error && <p className="err center" role="alert" style={{ fontSize: 13 }}>{error}</p>}
              <button className="btn btn-block" style={{ minHeight: 54 }} onClick={() => submit()} disabled={busy || digits.some((d) => !d)}>{busy ? <Spinner /> : 'Verify'}</button>
            </>
          )}
          {mode === 'link' && (
            <>
              {error && <p className="err" role="alert">{error}</p>}
              <button className="btn btn-block" style={{ minHeight: 54 }} onClick={checkLink} disabled={busy}>{busy ? <Spinner /> : 'I have verified'}</button>
            </>
          )}

          <div className="row between" style={{ flexWrap: 'wrap' }}>
            <button className="link-btn" onClick={resend} disabled={left > 0 || resending}>{resending ? 'Sending...' : left > 0 ? `Resend ${mode === 'link' ? 'link' : 'code'} in ${left}s` : `Resend ${mode === 'link' ? 'link' : 'code'}`}</button>
            <button className="link-btn" onClick={leave}>Use a different email</button>
          </div>
          <button className="link-btn" style={{ alignSelf: 'center', color: 'var(--body)' }} onClick={async () => { await backend.logout(); nav('/'); }}>Log out</button>
        </div>
      </div>
    </div>
  );
}

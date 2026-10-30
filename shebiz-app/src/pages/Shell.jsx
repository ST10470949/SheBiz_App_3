import React, { useEffect, useMemo, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../state/store.jsx';
import Icon, { Logo } from '../components/Icon.jsx';
import { Avatar, Confirm, Drawer, Field, Menu, Modal, PasswordInput, Spinner, useToast } from '../components/ui.jsx';
import { initials, passwordChecks } from '../lib/metrics.js';

const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: 'home' },
  { to: '/opportunities', label: 'Opportunities', icon: 'briefcase' },
  { to: '/mentorship', label: 'Mentorship', icon: 'user' },
  { to: '/my-business', label: 'My Business', icon: 'store' },
  { to: '/learning', label: 'Learning', icon: 'book' },
  { to: '/ai-assistant', label: 'AI Assistant', icon: 'sparkle' },
  { to: '/profile', label: 'Profile', icon: 'user' },
  { to: '/directory', label: 'Business Directory', icon: 'store' },
  { to: '/community', label: 'Community', icon: 'users' },
  { to: '/membership', label: 'Membership Plans', icon: 'sparkle' },
  { to: '/partners', label: 'For Organisations', icon: 'briefcase' },
];
const TABS = [
  { to: '/dashboard', label: 'Home', icon: 'home' },
  { to: '/opportunities', label: 'Jobs', icon: 'briefcase' },
  { to: '/mentorship', label: 'Mentors', icon: 'users' },
  { to: '/my-business', label: 'Business', icon: 'store' },
  { to: '/profile', label: 'Profile', icon: 'user' },
];
const FAQ = [
  ['How is my opportunity match calculated?', 'We compare the skills an opportunity asks for with the skills on your profile, whether its category fits your career interests, and how close it is to your location. Add more skills to your profile to improve your matches.'],
  ['How do I record a sale?', 'Open My Business, choose Record sale, pick a product and quantity, then press Record Sale. Your stock, totals and charts update straight away.'],
  ['Can I use SheBiz for my own business?', 'Yes. Edit the starter products, record your own sales and expenses, and use Settings to clear the example data whenever you are ready.'],
  ['How do I request a mentor?', 'Open Mentorship, choose a mentor and press View Profile, then Request mentorship. You can also book a session and chat once you are connected.'],
];

function useTimeAgo() {
  return (iso) => {
    const s = Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
    if (s < 60) return 'Just now';
    if (s < 3600) return `${Math.floor(s / 60)} min ago`;
    if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
    return `${Math.floor(s / 86400)} d ago`;
  };
}

export function NotificationsDrawer({ onClose }) {
  const { notifications, api } = useApp();
  const ago = useTimeAgo();
  const list = [...notifications].sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  const unread = list.filter((n) => !n.read).length;
  const markAll = () => Promise.all(list.filter((n) => !n.read).map((n) => api.update('notifications', n.id, { read: true })));
  return (
    <Drawer title="Notifications" onClose={onClose} width={440}>
      <div className="row between">
        <span className="muted">{unread ? `${unread} unread` : 'You are all caught up'}</span>
        <button className="btn btn-soft btn-sm" disabled={!unread} onClick={markAll}>Mark all as read</button>
      </div>
      {list.length === 0 && <p className="muted center" style={{ padding: 30 }}>No notifications yet.</p>}
      {list.map((n) => (
        <button key={n.id} className={`notif ${n.read ? 'read' : 'unread'}`} onClick={() => !n.read && api.update('notifications', n.id, { read: true })}>
          <span className="dot" />
          <span style={{ flex: 1 }}>
            <strong style={{ display: 'block' }}>{n.title}</strong>
            <span className="muted">{n.body}</span>
            <small className="muted" style={{ display: 'block', marginTop: 4 }}>{ago(n.createdAt)}</small>
          </span>
        </button>
      ))}
    </Drawer>
  );
}

function HelpDrawer({ onClose }) {
  const { api } = useApp();
  const toast = useToast();
  const [open, setOpen] = useState(0);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [errs, setErrs] = useState({});
  const send = async (e) => {
    e.preventDefault();
    const er = {};
    if (!subject.trim()) er.subject = 'Add a short subject.';
    if (message.trim().length < 10) er.message = 'Please write at least 10 characters.';
    setErrs(er);
    if (Object.keys(er).length) return;
    setBusy(true);
    try { await api.submitSupport({ subject: subject.trim(), message: message.trim() }); toast.success('Message sent. We will get back to you soon.'); onClose(); } catch (x) { toast.error(x.message); } finally { setBusy(false); }
  };
  return (
    <Drawer title="Help & support" onClose={onClose}>
      <h3>Frequently asked questions</h3>
      {FAQ.map(([q, a], i) => (
        <div className="faq" key={q}>
          <button onClick={() => setOpen(open === i ? -1 : i)} aria-expanded={open === i}>{q}<Icon name="chevronDown" size={16} style={{ transform: open === i ? 'rotate(180deg)' : 'none', transition: '.2s' }} /></button>
          {open === i && <div>{a}</div>}
        </div>
      ))}
      <hr className="divider" />
      <h3>Contact support</h3>
      <form className="stack" onSubmit={send} noValidate>
        <Field label="Subject" error={errs.subject}><input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="What do you need help with?" /></Field>
        <Field label="Message" error={errs.message}><textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Tell us a little more" /></Field>
        <button className="btn" disabled={busy}>{busy ? <Spinner /> : 'Send message'}</button>
      </form>
    </Drawer>
  );
}

function SettingsModal({ onClose }) {
  const { backend, profile, api, user } = useApp();
  const toast = useToast();
  const nav = useNavigate();
  const [badge, setBadge] = useState(profile?.settings?.badge !== false);
  const [pw, setPw] = useState({ old: '', next: '', confirm: '' });
  const [errs, setErrs] = useState({});
  const [busy, setBusy] = useState('');
  const [confirm, setConfirm] = useState(null);
  const [delPw, setDelPw] = useState('');
  const google = user.provider === 'google.com';

  const toggle = async () => { const v = !badge; setBadge(v); await api.updateProfile({ settings: { ...(profile?.settings || {}), badge: v } }); toast.success(v ? 'Notification badge on' : 'Notification badge off'); };
  const changePw = async (e) => {
    e.preventDefault();
    const c = passwordChecks(pw.next); const er = {};
    if (!pw.old) er.old = 'Enter your current password.';
    if (!(c.length && c.upper && c.lower && c.number)) er.next = 'Use 8+ characters with upper, lower and a number.';
    if (pw.next !== pw.confirm) er.confirm = 'Passwords do not match.';
    setErrs(er); if (Object.keys(er).length) return;
    setBusy('pw');
    try { await backend.changePassword(pw.old, pw.next); toast.success('Password updated'); setPw({ old: '', next: '', confirm: '' }); } catch (x) { toast.error(x.message); } finally { setBusy(''); }
  };
  const doClear = async () => { setBusy('clear'); try { await api.clearBusinessData(); toast.success('Business data cleared'); setConfirm(null); } catch (x) { toast.error(x.message); } finally { setBusy(''); } };
  const doDelete = async () => {
    setBusy('del');
    try { await backend.deleteAccount(delPw); toast.success('Your account has been deleted'); nav('/'); } catch (x) { toast.error(x.message); setBusy(''); }
  };

  return (
    <Modal title="Account settings" onClose={onClose} width={560}>
      <div className="kv"><div><strong>Signed in as</strong><div className="muted">{user.email}</div></div></div>
      <div className="kv">
        <div><strong>Notification badge</strong><div className="muted small">Show the unread count on the bell</div></div>
        <button className={`btn btn-sm ${badge ? '' : 'btn-ghost'}`} onClick={toggle} role="switch" aria-checked={badge}>{badge ? 'On' : 'Off'}</button>
      </div>
      {!google && (
        <form className="stack" onSubmit={changePw} noValidate>
          <h3>Change password</h3>
          <Field label="Current password" error={errs.old}><PasswordInput value={pw.old} onChange={(e) => setPw({ ...pw, old: e.target.value })} autoComplete="current-password" /></Field>
          <Field label="New password" error={errs.next}><PasswordInput value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} autoComplete="new-password" /></Field>
          <Field label="Confirm new password" error={errs.confirm}><PasswordInput value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} autoComplete="new-password" /></Field>
          <button className="btn btn-soft" disabled={busy === 'pw'}>{busy === 'pw' ? <Spinner /> : 'Update password'}</button>
        </form>
      )}
      <hr className="divider" />
      <h3>Business data</h3>
      <p className="muted small">Remove all products, sales, expenses and customers you have recorded and start again. Your profile stays.</p>
      <div className="row-wrap">
        <button className="btn btn-ghost btn-sm" onClick={() => setConfirm('clear')}>Clear business data</button>
      </div>
      <hr className="divider" />
      <h3 style={{ color: 'var(--red)' }}>Danger zone</h3>
      <button className="btn btn-red btn-sm" onClick={() => setConfirm('delete')}>Delete my account</button>
      {confirm === 'clear' && <Confirm title="Clear business data?" message="This permanently removes your products, sales, expenses and customers. Your profile stays." confirmLabel="Clear data" danger busy={busy === 'clear'} onConfirm={doClear} onClose={() => setConfirm(null)} />}
      {confirm === 'delete' && (
        <Modal title="Delete your account?" onClose={() => setConfirm(null)} width={440} footer={<><button className="btn btn-ghost" onClick={() => setConfirm(null)}>Cancel</button><button className="btn btn-red" onClick={doDelete} disabled={busy === 'del'}>{busy === 'del' ? <Spinner /> : 'Delete forever'}</button></>}>
          <p className="muted">This permanently deletes your profile and all business data. This cannot be undone.</p>
          {!google && <Field label="Confirm with your password"><PasswordInput value={delPw} onChange={(e) => setDelPw(e.target.value)} autoComplete="current-password" /></Field>}
        </Modal>
      )}
    </Modal>
  );
}

export default function Shell({ children }) {
  const { user, profile, backend, notifications } = useApp();
  const nav = useNavigate();
  const loc = useLocation();
  const toast = useToast();
  const [panel, setPanel] = useState(null); // 'notifs' | 'help' | 'settings' | 'logout'
  const [online, setOnline] = useState(typeof navigator === 'undefined' ? true : navigator.onLine);

  useEffect(() => {
    const on = () => setOnline(true); const off = () => setOnline(false);
    window.addEventListener('online', on); window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);
  useEffect(() => { window.scrollTo({ top: 0 }); }, [loc.pathname]);

  const unread = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);
  const showBadge = unread > 0 && profile?.settings?.badge !== false;
  const name = profile?.fullName || user.displayName || user.email;
  const short = (() => { const p = String(name).trim().split(/\s+/); return p.length > 1 ? `${p[0]} ${p[p.length - 1][0]}.` : p[0]; })();

  const doLogout = async () => { await backend.logout(); toast.info('You have been logged out'); nav('/'); };

  const userMenu = (
    <Menu
      align="right"
      trigger={({ toggle, open }) => (
        <button className="user-chip" onClick={toggle} aria-haspopup="menu" aria-expanded={open} aria-label="Account menu">
          <Avatar name={name} photo={profile?.photoURL} size={46} tint="blush" />
          <span className="hide-sm"><strong>{short}</strong><small>Member</small></span>
          <Icon name="chevronDown" size={14} />
        </button>
      )}
      items={[
        { label: 'View profile', icon: 'user', onClick: () => nav('/profile') },
        { label: 'Learning', icon: 'book', onClick: () => nav('/learning') },
        { label: 'Account settings', icon: 'settings', onClick: () => setPanel('settings') },
        { label: 'Help & support', icon: 'help', onClick: () => setPanel('help') },
        { divider: true },
        { label: 'Log out', icon: 'logout', danger: true, onClick: () => setPanel('logout') },
      ]}
    />
  );
  const bell = (
    <button className="icon-btn bell" onClick={() => setPanel('notifs')} aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`}>
      <Icon name="bell" size={19} />{showBadge && <span className="badge">{unread > 9 ? '9+' : unread}</span>}
    </button>
  );

  return (
    <>
      {!online && <div className="offline" role="alert"><Icon name="wifiOff" size={16} /> You are offline. Changes will sync when you reconnect.</div>}
      <div className="shell">
        <aside className="sidebar" aria-label="Main navigation">
          <Link to="/dashboard" aria-label="SheBiz home" style={{ textDecoration: 'none' }}><Logo light /></Link>
          <nav className="nav">
            {NAV.map((n) => (
              <NavLink key={n.to} to={n.to} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <Icon name={n.icon} size={20} />{n.label}
              </NavLink>
            ))}
          </nav>
          <div className="side-bottom">
            <div className="side-label">SETTINGS</div>
            <button className="nav-item" onClick={() => setPanel('help')}>Help & support</button>
            <button className="nav-item" onClick={() => setPanel('logout')}>Log out</button>
          </div>
        </aside>

        <div style={{ minWidth: 0 }}>
          <div className="mobile-bar">
            <Link to="/dashboard" style={{ textDecoration: 'none' }}><Logo size={30} /></Link>
            <div className="row" style={{ gap: 8 }}>{bell}{userMenu}</div>
          </div>
          <main className="main" id="main">
            <div className="topbar">{bell}{userMenu}</div>
            <div className="page" key={loc.pathname}>{children}</div>
          </main>
        </div>
      </div>

      <nav className="bottom-tabs" aria-label="Quick navigation">
        {TABS.map((t) => (
          <NavLink key={t.to} to={t.to} className={({ isActive }) => `bt ${isActive ? 'active' : ''}`}><Icon name={t.icon} size={22} />{t.label}</NavLink>
        ))}
      </nav>
      {!loc.pathname.startsWith('/ai-assistant') && <button className="fab" onClick={() => nav('/ai-assistant')} aria-label="Open SheBiz AI"><Icon name="sparkle" size={26} /></button>}

      {panel === 'notifs' && <NotificationsDrawer onClose={() => setPanel(null)} />}
      {panel === 'help' && <HelpDrawer onClose={() => setPanel(null)} />}
      {panel === 'settings' && <SettingsModal onClose={() => setPanel(null)} />}
      {panel === 'logout' && <Confirm title="Log out?" message="You will need to log in again to use SheBiz." confirmLabel="Log out" onConfirm={doLogout} onClose={() => setPanel(null)} />}
    </>
  );
}

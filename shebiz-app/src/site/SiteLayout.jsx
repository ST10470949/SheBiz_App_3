import React, { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import Icon, { Logo } from '../components/Icon.jsx';
import { useApp } from '../state/store.jsx';

const LINKS = [
  ['/', 'Home', true], ['/explore/opportunities', 'Opportunities'], ['/explore/mentorship', 'Mentorship'], ['/directory', 'Business Directory'],
  ['/learning-hub', 'Learning Hub'], ['/community', 'Community'], ['/my-business', 'My Business'], ['/membership', 'Membership Plans'],
  ['/about', 'About SheBiz'], ['/contact', 'Contact'],
];

export function SiteNav() {
  const { user } = useApp();
  const nav = useNavigate();
  const loc = useLocation();
  const [open, setOpen] = useState(false);
  const signedIn = !!user?.emailVerified;
  useEffect(() => { setOpen(false); }, [loc.pathname]);
  useEffect(() => { document.body.style.overflow = open ? 'hidden' : ''; return () => { document.body.style.overflow = ''; }; }, [open]);
  useEffect(() => { const k = (e) => e.key === 'Escape' && setOpen(false); document.addEventListener('keydown', k); return () => document.removeEventListener('keydown', k); }, []);

  return (
    <header className="s-nav">
      <div className="s-nav-in">
        <Link to="/" aria-label="SheBiz home" className="s-logo"><Logo size={34} /></Link>
        <nav className="s-links" aria-label="Main">
          {LINKS.map(([to, label, end]) => <NavLink key={to} to={to} end={!!end} className={({ isActive }) => (isActive ? 'on' : '')}>{label}</NavLink>)}
        </nav>
        <div className="s-actions">
          {signedIn ? <button className="btn btn-pink btn-sm" onClick={() => nav('/dashboard')}>Dashboard</button> : (
            <><Link to="/login" className="s-signin">Sign In</Link><button className="btn btn-pink btn-sm" onClick={() => nav('/register')}>Join SheBiz</button></>
          )}
          <button className="s-burger" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} aria-controls="s-mobile" onClick={() => setOpen(!open)}><Icon name={open ? 'x' : 'menu'} size={24} /></button>
        </div>
      </div>
      {open && (
        <div className="s-mobile" id="s-mobile" role="dialog" aria-label="Menu">
          {LINKS.map(([to, label, end]) => <NavLink key={to} to={to} end={!!end} className={({ isActive }) => (isActive ? 'on' : '')}>{label}</NavLink>)}
          <NavLink to="/partners" className={({ isActive }) => (isActive ? 'on' : '')}>For Organisations</NavLink>
          <div className="s-mobile-cta">
            {signedIn ? <button className="btn btn-pink btn-block" onClick={() => nav('/dashboard')}>Go to dashboard</button> : (
              <><button className="btn btn-ghost btn-block" onClick={() => nav('/login')}>Sign In</button><button className="btn btn-pink btn-block" onClick={() => nav('/register')}>Join SheBiz</button></>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="s-footer">
      <div className="wrap-site foot-grid">
        <div className="foot-brand">
          <Logo size={34} />
          <p>Empowering Women. Connecting Opportunities. Building Futures.</p>
          <small>Hackathon team: Error 404</small>
        </div>
        <div><h4>Explore</h4><Link to="/explore/opportunities">Opportunities</Link><Link to="/explore/mentorship">Mentorship</Link><Link to="/directory">Business Directory</Link><Link to="/learning-hub">Learning Hub</Link><Link to="/community">Community</Link></div>
        <div><h4>Grow</h4><Link to="/my-business">My Business</Link><Link to="/membership">Membership Plans</Link><Link to="/ai-assistant">SheBiz AI</Link><Link to="/register">Join SheBiz</Link></div>
        <div><h4>For Organisations</h4><Link to="/partners">Partner With SheBiz</Link><Link to="/partners#employers">Employer listings</Link><Link to="/partners#sponsored">Sponsored learning</Link><Link to="/partners#marketplace">Business marketplace</Link></div>
        <div><h4>SheBiz</h4><Link to="/about">About SheBiz</Link><Link to="/contact">Contact</Link><Link to="/login">Sign In</Link></div>
      </div>
      <div className="wrap-site foot-note">
        <p>Plans, prices, partners and listings shown in the preview sections are proposed or illustrative until formally launched. No payments are taken and no partnerships are claimed.</p>
      </div>
    </footer>
  );
}

export default function SiteLayout() {
  const loc = useLocation();
  useEffect(() => { if (!loc.hash) window.scrollTo(0, 0); else setTimeout(() => document.querySelector(loc.hash)?.scrollIntoView({ behavior: 'smooth' }), 50); }, [loc.pathname, loc.hash]);
  return (
    <div className="site">
      <a className="skip" href="#main-content">Skip to content</a>
      <SiteNav />
      <main id="main-content"><Outlet /></main>
      <SiteFooter />
    </div>
  );
}

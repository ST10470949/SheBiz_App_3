import React, { Suspense, lazy } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Icon from '../../components/Icon.jsx';
import { PLANS, SAMPLE_MENTORS, SAMPLE_OPPS } from '../data.js';
import { Portrait, Reveal, SampleBadge, SectionHead } from '../components.jsx';
import { SceneFallback } from '../../components/CollabScene.jsx';

const CollabScene = lazy(() => import('../../components/CollabScene.jsx'));

const FEATURES = [
  ['briefcase', 'Opportunities', 'Jobs, internships, learnerships, bursaries and funding, all in one place.', '/explore/opportunities', 'f-wide'],
  ['users', 'Mentorship', 'Learn from women who have walked the journey before you.', '/explore/mentorship', ''],
  ['book', 'Learning Hub', 'Short practical courses in digital skills, AI, finance and leadership.', '/learning-hub', ''],
  ['store', 'My Business', 'Track products, sales, expenses and profit without the jargon.', '/my-business', 'f-wide'],
  ['message', 'Community', 'Ask questions, share wins and grow with women like you.', '/community', ''],
  ['sparkle', 'SheBiz AI', 'A supportive assistant for plans, CVs, pitches and marketing.', '/ai-assistant', ''],
];

export default function Home() {
  const nav = useNavigate();
  return (
    <>
      {/* ---------- HERO ---------- */}
      <section className="hero-s">
        <div className="wrap-site hero-grid">
          <div className="hero-copy">
            <span className="eyebrow">Women Empowerment Through Technology</span>
            <h1>Empowering Women. <span className="grad-text">Connecting Opportunities.</span> Building Futures.</h1>
            <p className="lead">Discover opportunities, connect with mentors, grow your business and build the skills to shape your future, all in one place.</p>
            <div className="hero-btns">
              <button className="btn btn-pink btn-lg" onClick={() => nav('/register')}>Join SheBiz <Icon name="arrow" size={17} /></button>
              <button className="btn btn-ghost-dark btn-lg" onClick={() => nav('/explore/opportunities')}>Explore Opportunities</button>
              <Link to="/about" className="hero-link">Discover Our Mission <Icon name="arrow" size={15} /></Link>
            </div>
            <p className="hero-quote">Your ideas deserve opportunities. Your ambitions deserve support. Your future deserves a community that believes in you.</p>
          </div>
          <div className="hero-art">
            <Suspense fallback={<SceneFallback />}><CollabScene onNavigate={nav} /></Suspense>
          </div>
        </div>
      </section>

      {/* ---------- FEATURES ---------- */}
      <section className="sec">
        <div className="wrap-site">
          <SectionHead eyebrow="Everything in one place" title="One platform for your career and your business" text="Whether you are job-hunting, studying or building a business, SheBiz gives you the tools and the people to move forward." />
          <div className="feature-mosaic">
            {FEATURES.map(([ic, t, d, to, cls], i) => (
              <Reveal key={t} delay={i * 60} className={`fm ${cls}`}>
                <Link to={to} className="fm-in">
                  <span className="fm-ic"><Icon name={ic} size={24} /></span>
                  <h3>{t}</h3><p>{d}</p>
                  <span className="fm-go">Open <Icon name="arrow" size={14} /></span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- MENTORSHIP ---------- */}
      <section className="sec sec-band">
        <div className="wrap-site split-s">
          <Reveal>
            <span className="eyebrow">Mentorship</span>
            <h2 className="big">Your Next Chapter Starts With a Connection</h2>
            <p className="lead">Meet women who have walked the journey before you. Learn from their experience, strengthen your ideas and move forward with confidence.</p>
            <ul className="ticks"><li>Free mentorship discovery</li><li>Optional paid expert consultations</li><li>Request flow with clear status</li></ul>
            <div className="row-wrap" style={{ marginTop: 22 }}>
              <Link to="/explore/mentorship" className="btn btn-pink btn-lg">Find a mentor</Link>
              <Link to="/explore/mentorship#marketplace" className="btn btn-ghost-dark btn-lg">Expert marketplace</Link>
            </div>
          </Reveal>
          <Reveal delay={120} className="mini-mentors">
            {SAMPLE_MENTORS.slice(0, 3).map((m, i) => (
              <Link to={`/mentors/${m.id}`} key={m.id} className="mm-card" style={{ '--i': i }}>
                <Portrait skin={m.skin} tint={m.tint} size={64} label={`Illustration for sample mentor ${m.name}`} />
                <div className="grow"><b>{m.name}</b><small>{m.role}</small><div className="chips">{m.expertise.slice(0, 2).map((e) => <span className="tag-d" key={e}>{e}</span>)}</div></div>
                <SampleBadge />
              </Link>
            ))}
          </Reveal>
        </div>
      </section>

      {/* ---------- OPPORTUNITIES ---------- */}
      <section className="sec">
        <div className="wrap-site">
          <SectionHead eyebrow="Opportunities" title="Find your next step" text="Browse sample listings to see how the hub works. Real, verified opportunities appear here as they are added." />
          <div className="opp-strip">
            {SAMPLE_OPPS.slice(0, 3).map((p, i) => (
              <Reveal key={p.id} delay={i * 80} className={`opp-mini ${i === 0 ? 'featured' : ''}`}>
                <div className="row between"><span className="cat-pill">{p.category}</span>{i === 0 ? <span className="feat-pill">Featured (sample)</span> : <SampleBadge />}</div>
                <h3>{p.title}</h3><p className="o-org">{p.org} · {p.location}</p><p>{p.summary}</p>
                <Link to="/explore/opportunities" className="btn btn-lav btn-sm">View details</Link>
              </Reveal>
            ))}
          </div>
          <div className="center" style={{ marginTop: 28 }}><Link to="/explore/opportunities" className="btn btn-ghost-dark">See all opportunities <Icon name="arrow" size={15} /></Link></div>
        </div>
      </section>

      {/* ---------- BUSINESS ---------- */}
      <section className="sec sec-band">
        <div className="wrap-site split-s rev">
          <Reveal className="biz-preview" aria-label="Sample analytics preview">
            <div className="bp-head"><b>Business analytics</b><SampleBadge>Sample data</SampleBadge></div>
            <div className="bp-kpis"><div><small>Sales</small><b>R0 - R0</b></div><div><small>Expenses</small><b>You enter it</b></div><div><small>Profit</small><b>Calculated</b></div></div>
            <div className="bp-bars" aria-hidden="true">{[38, 52, 46, 70, 62, 88].map((h, i) => <i key={i} style={{ height: `${h}%` }} />)}</div>
            <small className="muted-on-dark">Illustrative chart. Your real numbers come from the sales and expenses you record.</small>
          </Reveal>
          <Reveal delay={120}>
            <span className="eyebrow">My Business</span>
            <h2 className="big">Run your business with clarity</h2>
            <p className="lead">Record products and sales, track expenses and see your estimated profit. Stock updates as you sell, and charts show what is working.</p>
            <ul className="ticks"><li>Products and inventory</li><li>Sales, expenses and profit</li><li>Customer payment preview</li></ul>
            <div className="row-wrap" style={{ marginTop: 22 }}><Link to="/my-business" className="btn btn-pink btn-lg">Open My Business</Link><Link to="/directory" className="btn btn-ghost-dark btn-lg">Business Directory</Link></div>
          </Reveal>
        </div>
      </section>

      {/* ---------- MEMBERSHIP ---------- */}
      <section className="sec">
        <div className="wrap-site">
          <SectionHead eyebrow="Membership" title="Start free. Grow when you are ready." text="Proposed plans for every stage. Prices are proposed until formally launched." center />
          <div className="plan-mini">
            {PLANS.map((p) => (
              <Reveal key={p.id} className={`pm ${p.featured ? 'feat' : ''}`}>
                <small>{p.tag}</small><h3>{p.name}</h3><div className="pm-price">{p.price}<span> / month</span></div>
                <p>{p.suits}</p>
              </Reveal>
            ))}
          </div>
          <div className="center" style={{ marginTop: 26 }}><Link to="/membership" className="btn btn-pink btn-lg">Compare membership plans</Link></div>
        </div>
      </section>

      {/* ---------- FOR ORGANISATIONS ---------- */}
      <section className="sec sec-org">
        <div className="wrap-site">
          <SectionHead eyebrow="For Organisations" title="Partner With SheBiz. Invest in Women's Growth." text="Support women-owned micro-enterprises through Enterprise and Supplier Development sponsorships, employer listings and sponsored learning." />
          <div className="org-grid">
            {[['Corporate sponsorship', 'B-BBEE ESD partnerships and sponsored business accounts.', '/partners#esd', 'award'], ['Employer listings', 'Publish or promote jobs, internships and learnerships.', '/partners#employers', 'briefcase'], ['Sponsored learning', 'Masterclasses, webinars and mentorship cohorts.', '/partners#sponsored', 'book'], ['Business marketplace', 'Reach women entrepreneurs with your services.', '/partners#marketplace', 'store']].map(([t, d, to, ic]) => (
              <Link key={t} to={to} className="org-card"><span className="fm-ic"><Icon name={ic} size={22} /></span><h3>{t}</h3><p>{d}</p><span className="fm-go">Learn more <Icon name="arrow" size={14} /></span></Link>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- CTA ---------- */}
      <section className="sec cta-s">
        <div className="wrap-site center">
          <h2 className="big">Your future deserves a community that believes in you.</h2>
          <p className="lead" style={{ margin: '14px auto 26px' }}>Join SheBiz today. It is free to start.</p>
          <div className="hero-btns" style={{ justifyContent: 'center' }}><button className="btn btn-pink btn-lg" onClick={() => nav('/register')}>Join SheBiz</button><Link to="/contact" className="btn btn-ghost-dark btn-lg">Talk to us</Link></div>
        </div>
      </section>
    </>
  );
}

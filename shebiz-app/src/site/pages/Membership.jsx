import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Icon from '../../components/Icon.jsx';
import { Modal } from '../../components/ui.jsx';
import { COMPARE_ROWS, FAQ, PLANS, SPONSORED_LEARNING, demoStore } from '../data.js';
import { PageHero, Reveal, SectionHead } from '../components.jsx';

export function useDemoPlan() {
  const [plan, setPlanState] = useState(() => demoStore.get('plan', 'free'));
  const setPlan = (p) => { setPlanState(p); demoStore.set('plan', p); };
  return [plan, setPlan];
}

export default function Membership() {
  const nav = useNavigate();
  const [plan, setPlan] = useDemoPlan();
  const [pick, setPick] = useState(null);
  const [done, setDone] = useState(false);
  const [open, setOpen] = useState(0);
  const chosen = PLANS.find((p) => p.id === pick);

  return (
    <>
      <PageHero eyebrow="Membership Plans" title="Choose the plan that grows with you" text="Start free and upgrade when you need more. Every plan keeps the full SheBiz mission: opportunity, mentorship and growth for women.">
        <div className="proposal-note" role="note"><Icon name="alert" size={16} /> Plans and prices shown are <b>proposed offerings</b> until formally launched. Nothing here charges you.</div>
      </PageHero>

      <section className="sec-tight"><div className="wrap-site">
        <div className="plans-grid">
          {PLANS.map((p) => (
            <Reveal key={p.id} className={`plan ${p.featured ? 'featured' : ''} ${plan === p.id ? 'current' : ''}`}>
              {p.featured && <span className="plan-flag">Most suitable for businesses</span>}
              <small className="plan-tag">{p.tag}</small>
              <h2>{p.name}</h2>
              <div className="plan-price"><b>{p.price}</b><span>{p.per}</span></div>
              <p className="plan-suits">{p.suits}</p>
              <ul className="plan-list">{p.features.map((f) => <li key={f}><Icon name="check" size={15} stroke={3} /> {f}</li>)}</ul>
              <button className={`btn btn-block ${p.featured ? 'btn-pink' : 'btn-white'}`} onClick={() => { setPick(p.id); setDone(false); }}>{plan === p.id ? 'Current preview plan' : p.cta}</button>
            </Reveal>
          ))}
        </div>
        <p className="center muted-on-dark small" style={{ marginTop: 14 }}>Billed monthly. Annual billing is not part of the current proposal.</p>
      </div></section>

      <section className="sec sec-band"><div className="wrap-site">
        <SectionHead eyebrow="Compare" title="Compare plans side by side" />
        <div className="table-wrap"><table className="compare"><thead><tr><th scope="col">Feature</th>{PLANS.map((p) => <th key={p.id} scope="col">{p.name.replace('SheBiz ', '')}</th>)}</tr></thead>
          <tbody>{COMPARE_ROWS.map((r) => <tr key={r[0]}><th scope="row">{r[0]}</th><td>{r[1]}</td><td>{r[2]}</td><td>{r[3]}</td></tr>)}</tbody></table></div>
        <p className="muted-on-dark small">* Certificates where supported.</p>
        <div className="who-grid">{PLANS.map((p) => <div key={p.id} className="who"><b>{p.name}</b><p>{p.suits}</p></div>)}</div>
      </div></section>

      <section className="sec"><div className="wrap-site">
        <SectionHead eyebrow="More ways SheBiz works" title="Beyond subscriptions" text="Membership is one part of a sustainable model that keeps SheBiz free to start." />
        <div className="org-grid">
          {[['Paid mentorship marketplace', 'Free mentors plus optional paid consultations. SheBiz may take a 10% to 20% platform commission on paid sessions.', '/explore/mentorship#marketplace', 'users'],
            ['Corporate sponsorship (B-BBEE ESD)', 'Organisations can sponsor business accounts for eligible women entrepreneurs.', '/partners#esd', 'award'],
            ['Sponsored learning and webinars', 'Clearly labelled sponsored masterclasses and workshops.', '/partners#sponsored', 'book'],
            ['Employer listings', 'Employers can pay to publish or promote jobs, internships and learnerships.', '/partners#employers', 'briefcase'],
            ['Business ecosystem partners', 'A marketplace for accounting, packaging, logistics and marketing services.', '/partners#marketplace', 'store'],
            ['Premium AI usage', 'Free users get five prompt cycles a day. Pro and Business would include extended usage.', '/ai-assistant', 'sparkle']].map(([t, d, to, ic]) => (
            <Link key={t} to={to} className="org-card"><span className="fm-ic"><Icon name={ic} size={22} /></span><h3>{t}</h3><p>{d}</p><span className="fm-go">Learn more <Icon name="arrow" size={14} /></span></Link>
          ))}
        </div>
      </div></section>

      <section className="sec sec-band"><div className="wrap-site faq-wrap">
        <SectionHead eyebrow="FAQ" title="Frequently asked questions" />
        <div className="faq-s">{FAQ.map(([q, a], i) => (
          <div key={q} className={`faq-i ${open === i ? 'open' : ''}`}><button aria-expanded={open === i} onClick={() => setOpen(open === i ? -1 : i)}>{q}<Icon name="chevronDown" size={18} /></button>{open === i && <p>{a}</p>}</div>
        ))}</div>
      </div></section>

      {pick && (
        <Modal title={done ? 'Preview plan selected' : `Choose ${chosen.name}`} onClose={() => setPick(null)} width={480}
          footer={done ? <button className="btn" onClick={() => setPick(null)}>Done</button> : <><button className="btn btn-ghost" onClick={() => setPick(null)}>Cancel</button><button className="btn btn-pink" onClick={() => { setPlan(pick); setDone(true); }}>Confirm preview selection</button></>}>
          {done ? (
            <div className="center stack" style={{ alignItems: 'center' }}>
              <div className="empty-icon" style={{ background: '#fbd9ea', color: '#b8266f' }}><Icon name="checkCircle" size={30} /></div>
              <p><b>{chosen.name}</b> is selected for this preview.</p>
              <p className="muted small">No payment was taken and no subscription was created. This choice is saved only in your browser and changes the preview SheBiz AI allowance.</p>
              <button className="link-btn" onClick={() => { setPick(null); nav('/ai-assistant'); }}>See the AI allowance</button>
            </div>
          ) : (
            <div className="stack">
              <div className="kv"><span className="muted">Plan</span><strong>{chosen.name}</strong></div>
              <div className="kv"><span className="muted">Proposed price</span><strong>{chosen.price} {chosen.per}</strong></div>
              <ul className="plan-list dark">{chosen.features.map((f) => <li key={f}><Icon name="check" size={15} stroke={3} /> {f}</li>)}</ul>
              <p className="muted small">Proposed plan, not yet launched. Selecting it does not charge you or collect card details.</p>
            </div>
          )}
        </Modal>
      )}
    </>
  );
}

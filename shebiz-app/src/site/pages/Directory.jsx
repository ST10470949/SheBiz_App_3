import React, { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Icon from '../../components/Icon.jsx';
import { EmptyState, useToast } from '../../components/ui.jsx';
import { BIZ_INDUSTRIES, SAMPLE_BUSINESSES } from '../data.js';
import { EnquiryModal, PageHero, Portrait, SampleBadge, SampleNotice } from '../components.jsx';

const Logo = ({ b, size = 72 }) => (
  <span className={`biz-logo tint-${b.tint}`} style={{ width: size, height: size, fontSize: size * 0.34 }} aria-hidden="true">{b.name.replace('Sample ', '').split(' ').slice(0, 2).map((w) => w[0]).join('')}</span>
);

export function Directory() {
  const [q, setQ] = useState('');
  const [ind, setInd] = useState('All');
  const list = useMemo(() => SAMPLE_BUSINESSES.filter((b) => (ind === 'All' || b.industry === ind) && (!q.trim() || `${b.name} ${b.description} ${b.products.join(' ')} ${b.location}`.toLowerCase().includes(q.trim().toLowerCase()))), [q, ind]);
  return (
    <>
      <PageHero eyebrow="Business Directory" title="Celebrating women-owned businesses" text="Discover products and services from women building businesses across South Africa.">
        <div className="search-big" role="search"><Icon name="search" size={20} /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search businesses, products or places" aria-label="Search the directory" />{q && <button className="icon-x" aria-label="Clear search" onClick={() => setQ('')}><Icon name="x" size={16} /></button>}</div>
      </PageHero>
      <section className="sec-tight"><div className="wrap-site">
        <SampleNotice>These listings are invented samples that show how the directory will look. No verification is claimed. Real businesses will be added in a later phase.</SampleNotice>
        <div className="chip-row">{['All', ...BIZ_INDUSTRIES].map((c) => <button key={c} className={`fchip ${ind === c ? 'on' : ''}`} aria-pressed={ind === c} onClick={() => setInd(c)}>{c}</button>)}</div>
        <div className="filter-bar"><span className="result-count" aria-live="polite">{list.length} {list.length === 1 ? 'business' : 'businesses'}</span></div>
        {list.length === 0 ? <div className="empty-dark"><EmptyState icon="store" title="No businesses match" text="Try another keyword or industry." action={<button className="btn btn-pink" onClick={() => { setQ(''); setInd('All'); }}>Clear filters</button>} /></div> : (
          <div className="biz-grid">
            {list.map((b, i) => (
              <article key={b.id} className={`biz-card ${i % 5 === 0 ? 'wide' : ''}`}>
                <div className="biz-top"><Logo b={b} /><div><SampleBadge /><h3>{b.name}</h3><p className="o-org">{b.industry} · {b.location}</p></div></div>
                <p>{b.description}</p>
                <div className="chips">{b.products.map((p) => <span className="tag-l" key={p}>{p}</span>)}</div>
                <div className="o-actions"><Link to={`/directory/${b.id}`} className="btn btn-lav btn-sm">View business</Link></div>
              </article>
            ))}
          </div>
        )}
        <div className="promo-strip"><div><b>Own a business?</b><p>Get discovered. Business profile promotion options are part of the proposed Business plan.</p></div><Link to="/membership" className="btn btn-pink">See plans</Link></div>
      </div></section>
    </>
  );
}

export function BusinessProfile() {
  const { id } = useParams();
  const b = SAMPLE_BUSINESSES.find((x) => x.id === id);
  const toast = useToast();
  const [contact, setContact] = useState(false);
  const [product, setProduct] = useState(null);
  if (!b) return <section className="sec"><div className="wrap-site empty-dark"><EmptyState icon="store" title="Business not found" action={<Link to="/directory" className="btn btn-pink">Back to directory</Link>} /></div></section>;
  return (
    <>
      <section className="page-hero"><div className="wrap-site">
        <Link to="/directory" className="back-s"><Icon name="arrowLeft" size={16} /> All businesses</Link>
        <div className="mp-head"><Logo b={b} size={128} /><div className="grow"><SampleBadge /><h1 style={{ fontSize: 'clamp(30px,4vw,46px)' }}>{b.name}</h1><p className="lead">{b.industry} · {b.location}</p>
          <div className="row-wrap" style={{ marginTop: 18 }}><button className="btn btn-pink btn-lg" onClick={() => setContact(true)}>Contact the owner</button><button className="btn btn-ghost-dark btn-lg" onClick={() => toast.info('Sample listing: no website link')}>Website (sample)</button></div></div></div>
      </div></section>
      <section className="sec-tight"><div className="wrap-site mp-grid">
        <div className="stack"><SampleNotice>Invented sample business. Verification status: not verified.</SampleNotice>
          <div className="lcard"><h2>About</h2><p>{b.description}</p></div>
          <div className="lcard"><h2>Products and services</h2><div className="prod-grid">{b.products.map((p, i) => (
            <button key={p} className="prod-tile" onClick={() => setProduct(p)}><span className={`tile tile-${['lav', 'blush', 'cream'][i % 3]}`}><Icon name="bag" size={22} /></span><b>{p}</b><small>View details</small></button>
          ))}</div></div></div>
        <aside className="stack"><div className="lcard"><h2>Details</h2><div className="kv"><span className="muted">Industry</span><strong>{b.industry}</strong></div><div className="kv"><span className="muted">Location</span><strong>{b.location}</strong></div><div className="kv"><span className="muted">Verification</span><strong>Not verified (sample)</strong></div></div></aside>
      </div></section>
      {contact && <EnquiryModal title={`Contact ${b.name}`} intro="Send a message to the business owner." fields={[{ name: 'name', label: 'Your name', required: true, autoComplete: 'name' }, { name: 'email', label: 'Your email', type: 'email', required: true, autoComplete: 'email' }, { name: 'message', label: 'Message', type: 'textarea', required: true, min: 10 }]} submitLabel="Send message" confirmTitle="Message recorded" confirmText={`Your message for ${b.name} is recorded in this preview.`} onClose={() => setContact(false)} />}
      {product && <EnquiryModal title={product} intro={`Ask ${b.name} about "${product}".`} fields={[{ name: 'email', label: 'Your email', type: 'email', required: true }, { name: 'message', label: 'Question', type: 'textarea', required: true, min: 10 }]} submitLabel="Ask about this" confirmTitle="Question recorded" onClose={() => setProduct(null)} />}
    </>
  );
}

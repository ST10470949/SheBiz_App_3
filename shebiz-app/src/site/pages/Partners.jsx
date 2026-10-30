import React, { useState } from 'react';
import Icon from '../../components/Icon.jsx';
import { Modal, useToast } from '../../components/ui.jsx';
import { MARKET_CATEGORIES, PARTNER_TYPES, PROMO_OPTIONS, SPONSORED_LEARNING } from '../data.js';
import { EnquiryModal, PageHero, Reveal, SampleBadge, SectionHead } from '../components.jsx';

const ORG_FIELDS = [
  { name: 'org', label: 'Organisation name', required: true, autoComplete: 'organization' },
  { name: 'person', label: 'Contact person', required: true, autoComplete: 'name' },
  { name: 'email', label: 'Email', type: 'email', required: true, autoComplete: 'email' },
  { name: 'interest', label: 'Partnership interest', type: 'select', required: true, options: ['B-BBEE ESD sponsorship', 'Sponsor business accounts', 'Sponsored learning or webinars', 'Employer listings', 'Marketplace listing', 'Something else'] },
  { name: 'message', label: 'Message', type: 'textarea', required: true, min: 15 },
];

export default function Partners() {
  const toast = useToast();
  const [form, setForm] = useState(null); // {title, interest}
  const [promo, setPromo] = useState('featured');
  const [review, setReview] = useState(false);
  const [listing, setListing] = useState(false);

  const open = (title, interest) => setForm({ title, interest });
  const fields = (interest) => ORG_FIELDS.map((f) => (f.name === 'interest' && interest ? { ...f, initial: interest } : f));

  return (
    <>
      <PageHero eyebrow="For Organisations" title="Partner With SheBiz. Invest in Women's Growth." text="Support women-owned micro-enterprises through Enterprise and Supplier Development sponsorships, employer listings, sponsored learning and a business marketplace.">
        <div className="row-wrap" style={{ marginTop: 22 }}><button className="btn btn-pink btn-lg" onClick={() => open('Become a partner', '')}>Become a Partner</button><a href="#employers" className="btn btn-ghost-dark btn-lg">Employer listings</a></div>
        <div className="proposal-note" style={{ marginTop: 22 }} role="note"><Icon name="alert" size={16} /> Partner categories below are <b>target categories</b>, not confirmed partnerships. No agreements, logos or amounts are claimed.</div>
      </PageHero>

      {/* A + B: corporate sponsorship / ESD */}
      <section className="sec-tight" id="esd"><div className="wrap-site">
        <SectionHead eyebrow="B-BBEE ESD partnerships" title="Sponsor women's businesses. Measure the impact." text="Organisations can fund Enterprise and Supplier Development by sponsoring business accounts for eligible entrepreneurs, supporting training and mentoring alongside." />
        <div className="partner-grid">
          {PARTNER_TYPES.map(([t, d, ic], i) => (
            <Reveal key={t} delay={i * 40} className="partner-card"><span className="fm-ic"><Icon name={ic} size={22} /></span><h3>{t}</h3><p>{d}</p><small className="target-tag">Target partner category</small><button className="link-light" onClick={() => open(`Partner enquiry: ${t}`, 'B-BBEE ESD sponsorship')}>Enquire <Icon name="arrow" size={13} /></button></Reveal>
          ))}
        </div>
        <div className="promo-strip"><div><b>Sponsor a business account</b><p>Cover membership for an eligible woman entrepreneur so she can use the full Business plan.</p></div><button className="btn btn-pink" onClick={() => open('Sponsor business accounts', 'Sponsor business accounts')}>Become a Partner</button></div>
      </div></section>

      {/* C: employer listings */}
      <section className="sec sec-band" id="employers"><div className="wrap-site">
        <SectionHead eyebrow="Employers" title="Reach women looking for their next opportunity" text="Employers can pay to publish listings or promote selected opportunities: jobs, internships, learnerships and graduate programmes." />
        <div className="promo-options" role="radiogroup" aria-label="Listing promotion option">
          {PROMO_OPTIONS.map(([id, name, desc, price]) => (
            <button key={id} role="radio" aria-checked={promo === id} className={`promo-opt ${promo === id ? 'on' : ''}`} onClick={() => setPromo(id)}>
              {id === 'featured' && <span className="feat-pill">Popular</span>}
              <b>{name}</b><p>{desc}</p><small>{price}</small>
            </button>
          ))}
        </div>
        <div className="row-wrap" style={{ marginTop: 22 }}><button className="btn btn-pink btn-lg" onClick={() => setListing(true)}>Submit a listing</button><button className="btn btn-ghost-dark btn-lg" onClick={() => setReview(true)}>Review selected option</button></div>
        <p className="muted-on-dark small" style={{ marginTop: 12 }}>Listing prices are not set yet. Submitting only records a preview enquiry and does not publish anything to a live candidate database.</p>
      </div></section>

      {/* D: sponsored learning */}
      <section className="sec-tight" id="sponsored"><div className="wrap-site">
        <SectionHead eyebrow="Sponsored learning" title="Masterclasses, webinars and cohorts" text="Support education for women and get clearly labelled visibility. Sponsored content is always marked as sponsored." />
        <div className="learn-grid">
          {SPONSORED_LEARNING.map(([t, kind, d]) => (
            <article key={t} className="learn-card">
              <div className="row between"><span className="cat-pill">{kind}</span><span className="sponsored-pill">Sponsored (sample)</span></div>
              <h3>{t}</h3><p>{d}</p>
              <p className="muted small">Sample format. No real event or date has been confirmed.</p>
              <button className="btn btn-lav btn-sm" onClick={() => open(`Sponsor: ${t}`, 'Sponsored learning or webinars')}>Sponsor this</button>
            </article>
          ))}
        </div>
      </div></section>

      {/* F: marketplace */}
      <section className="sec sec-band" id="marketplace"><div className="wrap-site">
        <SectionHead eyebrow="Business ecosystem" title="A marketplace for services women-owned businesses need" text="Providers can list their services and reach entrepreneurs. Paid directory listings and featured placement are part of the proposed model." />
        <div className="partner-grid">
          {MARKET_CATEGORIES.map(([t, d, ic], i) => (
            <Reveal key={t} delay={i * 40} className={`partner-card ${i === 0 ? 'featured-l' : ''}`}>
              {i === 0 && <span className="feat-pill">Featured listing (sample)</span>}
              <span className="fm-ic"><Icon name={ic} size={22} /></span><h3>{t}</h3><p>{d}</p>
              <div className="row between"><SampleBadge>Example category</SampleBadge><button className="link-light" onClick={() => open(`Marketplace enquiry: ${t}`, 'Marketplace listing')}>List your service <Icon name="arrow" size={13} /></button></div>
            </Reveal>
          ))}
        </div>
        <p className="muted-on-dark small" style={{ marginTop: 14 }}>No real providers, discounts or partner offers are shown. These are categories awaiting real listings.</p>
      </div></section>

      <section className="sec cta-s"><div className="wrap-site center">
        <h2 className="big">Let us build something that lasts.</h2>
        <p className="lead" style={{ margin: '12px auto 24px' }}>Tell us how your organisation would like to support women in business.</p>
        <button className="btn btn-pink btn-lg" onClick={() => open('Become a partner', '')}>Become a Partner</button>
      </div></section>

      {form && <EnquiryModal title={form.title} intro="Tell us about your organisation and how you would like to partner." fields={fields(form.interest)} submitLabel="Send enquiry" confirmTitle="Partner enquiry recorded" confirmText="Your partnership enquiry is recorded in this preview." onClose={() => setForm(null)} />}
      {listing && <EnquiryModal title="Submit a listing" intro={`Promotion option: ${PROMO_OPTIONS.find((p) => p[0] === promo)[1]}.`} fields={[{ name: 'org', label: 'Organisation', required: true }, { name: 'title', label: 'Listing title', required: true }, { name: 'type', label: 'Listing type', type: 'select', required: true, options: ['Job', 'Internship', 'Learnership', 'Graduate programme'] }, { name: 'email', label: 'Contact email', type: 'email', required: true }, { name: 'details', label: 'Description', type: 'textarea', required: true, min: 20 }]} submitLabel="Submit listing" confirmTitle="Listing submission recorded" confirmText="Your listing is recorded in this preview. It has not been published." onClose={() => setListing(false)} />}
      {review && (
        <Modal title="Review your listing option" onClose={() => setReview(false)} width={460} footer={<><button className="btn btn-ghost" onClick={() => setReview(false)}>Close</button><button className="btn btn-pink" onClick={() => { setReview(false); setListing(true); }}>Continue to listing</button></>}>
          {(() => { const [, name, desc, price] = PROMO_OPTIONS.find((p) => p[0] === promo); return <div className="stack"><div className="kv"><span className="muted">Option</span><strong>{name}</strong></div><p>{desc}</p><div className="kv"><span className="muted">Price</span><strong>{price}</strong></div><p className="muted small">Prices are not set yet. Nothing is charged in this preview.</p></div>; })()}
        </Modal>
      )}
    </>
  );
}

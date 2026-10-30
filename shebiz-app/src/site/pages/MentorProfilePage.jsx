import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Icon from '../../components/Icon.jsx';
import { EmptyState } from '../../components/ui.jsx';
import { SAMPLE_MENTORS } from '../data.js';
import { Portrait, SampleBadge, SampleNotice } from '../components.jsx';
import { BookingModal, RequestModal, priceLabel, useMentorRequests } from '../MentorFlows.jsx';

export default function MentorProfilePage() {
  const { id } = useParams();
  const m = SAMPLE_MENTORS.find((x) => x.id === id);
  const reqs = useMentorRequests();
  const [req, setReq] = useState(false);
  const [book, setBook] = useState(false);
  if (!m) return <section className="sec"><div className="wrap-site empty-dark"><EmptyState icon="users" title="Mentor not found" action={<Link to="/explore/mentorship" className="btn btn-pink">Back to mentors</Link>} /></div></section>;
  const others = SAMPLE_MENTORS.filter((x) => x.id !== m.id && x.industry === m.industry).slice(0, 2);
  return (
    <>
      <section className="page-hero"><div className="wrap-site">
        <Link to="/explore/mentorship" className="back-s"><Icon name="arrowLeft" size={16} /> All mentors</Link>
        <div className="mp-head">
          <Portrait skin={m.skin} tint={m.tint} size={160} label={`Illustration for ${m.name}`} />
          <div className="grow">
            <SampleBadge>Sample profile</SampleBadge>
            <h1 style={{ fontSize: 'clamp(30px,4vw,46px)' }}>{m.name}</h1>
            <p className="lead">{m.role} · {m.industry}</p>
            <div className="row-wrap" style={{ marginTop: 18 }}>
              <button className="btn btn-pink btn-lg" onClick={() => setReq(true)}>Request Mentorship</button>
              {m.price > 0 && <button className="btn btn-ghost-dark btn-lg" onClick={() => setBook(true)}>Book a paid session</button>}
            </div>
          </div>
        </div>
      </div></section>
      <section className="sec-tight"><div className="wrap-site mp-grid">
        <div className="stack">
          <SampleNotice>This is a sample profile for design preview. It does not represent a verified real mentor.</SampleNotice>
          <div className="lcard"><h2>About</h2><p>{m.bio}</p></div>
          <div className="lcard"><h2>Can help you with</h2><div className="chips">{m.expertise.map((e) => <span className="tag-l" key={e}>{e}</span>)}</div></div>
        </div>
        <aside className="stack">
          <div className="lcard"><h2>Mentorship details</h2>
            <div className="kv"><span className="muted">Format</span><strong>{m.format}</strong></div>
            <div className="kv"><span className="muted">Availability</span><strong>{m.availability}</strong></div>
            <div className="kv"><span className="muted">Price</span><strong>{priceLabel(m)}</strong></div>
          </div>
          {others.length > 0 && <div className="lcard"><h2>Similar mentors</h2>{others.map((o) => <Link key={o.id} to={`/mentors/${o.id}`} className="kv"><span>{o.name}</span><span className="muted">{o.role}</span></Link>)}</div>}
        </aside>
      </div></section>
      {req && <RequestModal mentor={m} onClose={() => setReq(false)} onDone={reqs.add} />}
      {book && <BookingModal mentor={m} onClose={() => setBook(false)} onDone={reqs.add} />}
    </>
  );
}

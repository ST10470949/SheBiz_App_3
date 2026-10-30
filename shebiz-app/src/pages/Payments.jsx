import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import { EmptyState, PageHeader, Pill, useToast } from '../components/ui.jsx';
import { useApp } from '../state/store.jsx';
import { rand } from '../lib/metrics.js';
import { SampleBadge, UpgradeBanner } from '../site/components.jsx';

// PREVIEW ONLY. No payment provider is connected and no card details are collected.
// Transactions below are local demonstration data, kept in component state so they can be replaced by real data later.
const SAMPLE_TX = [
  { id: 't1', customer: 'Sample customer A', items: 'Order 1042', amount: 420, status: 'Paid', date: '2026-10-20' },
  { id: 't2', customer: 'Sample customer B', items: 'Order 1043', amount: 180, status: 'Pending', date: '2026-10-22' },
  { id: 't3', customer: 'Sample customer C', items: 'Order 1044', amount: 640, status: 'Paid', date: '2026-10-23' },
  { id: 't4', customer: 'Sample customer D', items: 'Order 1045', amount: 95, status: 'Failed', date: '2026-10-24' },
  { id: 't5', customer: 'Sample customer E', items: 'Order 1046', amount: 300, status: 'Refunded', date: '2026-10-25' },
];
const TONE = { Paid: 'greenSoft', Pending: 'cream', Failed: 'red', Refunded: 'grey' };
const FEE_RATE = 0.03; // illustrative provider fee, NOT a quote

export default function Payments() {
  const { products, ready } = useApp();
  const toast = useToast();
  const [tx, setTx] = useState(SAMPLE_TX);
  const [filter, setFilter] = useState('All');
  const [cart, setCart] = useState({});
  const [step, setStep] = useState('cart');

  const items = useMemo(() => products.filter((p) => cart[p.id] > 0).map((p) => ({ ...p, qty: cart[p.id] })), [products, cart]);
  const subtotal = items.reduce((s, i) => s + i.qty * Number(i.price), 0);
  const fee = Math.round(subtotal * FEE_RATE * 100) / 100;
  const sum = (st) => tx.filter((t) => t.status === st).reduce((s, t) => s + t.amount, 0);
  const list = tx.filter((t) => filter === 'All' || t.status === filter);

  const place = () => { setTx([{ id: `t${Date.now()}`, customer: 'Preview customer', items: items.map((i) => `${i.qty} x ${i.name}`).join(', '), amount: subtotal, status: 'Pending', date: new Date().toISOString().slice(0, 10) }, ...tx]); setCart({}); setStep('done'); toast.success('Preview order added. No payment was taken.'); };

  return (
    <>
      <PageHeader title="Customer payments" subtitle="See how you could accept payments from customers. Preview only.">
        <Link to="/my-business" className="btn btn-ghost btn-sm">Back to My Business</Link>
      </PageHeader>
      <div className="demo-note" style={{ marginBottom: 22 }} role="note"><b>Preview only.</b> No payment provider is connected, no card details are collected and no money moves. Transactions are local sample data. The layout is ready for a future payment-provider integration.</div>

      <div className="grid-3" style={{ marginBottom: 24 }}>
        {[['Paid (sample)', sum('Paid'), 'c-green', 'checkCircle'], ['Pending (sample)', sum('Pending'), 'c-purple', 'clock'], ['Failed or refunded (sample)', sum('Failed') + sum('Refunded'), 'c-coral', 'alert']].map(([l, v, c, ic]) => (
          <div className="card stat-card" key={l}><div className="stat-label"><Icon name={ic} size={14} /> {l}</div><div className={`stat-num ${c}`}>{rand(v)}</div></div>
        ))}
      </div>

      <div className="split-2-1" style={{ marginBottom: 24 }}>
        <div className="card">
          <div className="row between wrap"><h2>Order summary</h2><SampleBadge>Preview</SampleBadge></div>
          {!ready || products.length === 0 ? <EmptyState icon="bag" title="Add products first" text="Your products from the Business Manager appear here so you can build a preview order." action={<Link to="/my-business/manager?tab=products" className="btn btn-sm" style={{ textDecoration: 'none' }}>Add a product</Link>} /> : (
            <div className="stack" style={{ gap: 8, maxHeight: 320, overflowY: 'auto' }}>
              {products.slice(0, 12).map((p) => (
                <div className="kv" key={p.id}><div><strong>{p.name}</strong><div className="muted small">{rand(p.price)}</div></div>
                  <div className="qty"><button aria-label={`Less ${p.name}`} onClick={() => setCart({ ...cart, [p.id]: Math.max(0, (cart[p.id] || 0) - 1) })}>-</button><span>{cart[p.id] || 0}</span><button aria-label={`More ${p.name}`} onClick={() => setCart({ ...cart, [p.id]: (cart[p.id] || 0) + 1 })}>+</button></div></div>
              ))}
            </div>
          )}
          <hr className="divider" />
          <div className="kv"><span className="muted">Subtotal</span><strong>{rand(subtotal)}</strong></div>
          <div className="kv"><span className="muted">Illustrative provider fee ({FEE_RATE * 100}%)</span><strong>{rand(fee)}</strong></div>
          <div className="kv"><span className="muted">You would receive</span><strong className="c-green">{rand(subtotal - fee)}</strong></div>
          <p className="muted small" style={{ marginTop: 10 }}>Fees depend on the payment provider you choose later. The rate shown is an example, not a quote. SheBiz does not process payments in this preview.</p>
        </div>

        <div className="card checkout">
          <div className="row between wrap"><h2>Checkout preview</h2><Pill tone="blush">What your customer sees</Pill></div>
          {step === 'done' ? (
            <div className="center stack" style={{ alignItems: 'center', padding: '16px 0' }}><div className="empty-icon" style={{ background: '#fbd9ea', color: '#b8266f' }}><Icon name="checkCircle" size={28} /></div><b>Preview order created</b><p className="muted small">It appears below as Pending. No payment was taken.</p><button className="btn btn-sm" onClick={() => setStep('cart')}>Start another</button></div>
          ) : items.length === 0 ? <p className="muted">Add items to see the checkout.</p> : (
            <div className="stack">
              {items.map((i) => <div className="kv" key={i.id}><span>{i.qty} x {i.name}</span><strong>{rand(i.qty * i.price)}</strong></div>)}
              <div className="kv"><span className="muted">Total</span><strong style={{ fontSize: 20 }}>{rand(subtotal)}</strong></div>
              <div className="pay-methods" aria-label="Payment methods (preview)"><span>Card</span><span>Instant EFT</span><span>QR code</span></div>
              <button className="btn btn-pink btn-block" onClick={place}>Pay {rand(subtotal)} (preview)</button>
              <p className="muted small"><Icon name="lock" size={12} /> No card details are collected in this preview.</p>
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <div className="row between wrap" style={{ marginBottom: 14 }}><h2 style={{ margin: 0 }}>Transaction history</h2>
          <div className="row-wrap">{['All', 'Paid', 'Pending', 'Failed', 'Refunded'].map((f) => <button key={f} className={`chip-btn ${filter === f ? 'on' : ''}`} aria-pressed={filter === f} onClick={() => setFilter(f)}>{f}</button>)}</div></div>
        {list.length === 0 ? <EmptyState icon="file" title="No transactions" text="Nothing matches this filter." /> : (
          <div className="table-wrap light"><table className="tx"><thead><tr><th>Date</th><th>Customer</th><th>Order</th><th>Amount</th><th>Status</th></tr></thead>
            <tbody>{list.map((t) => <tr key={t.id}><td>{t.date}</td><td>{t.customer}</td><td>{t.items}</td><td>{rand(t.amount)}</td><td><Pill tone={TONE[t.status]}>{t.status}</Pill></td></tr>)}</tbody></table></div>
        )}
        <p className="muted small" style={{ marginTop: 10 }}>All transactions on this screen are sample data for design preview.</p>
      </div>
      <div style={{ marginTop: 24 }}><UpgradeBanner title="Automated invoices and PDF exports" text="The proposed Business plan adds automated invoices, PDF exports and advanced analytics." /></div>
    </>
  );
}

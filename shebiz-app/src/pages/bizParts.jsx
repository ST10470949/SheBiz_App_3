import React, { useMemo, useState } from 'react';
import Icon from '../components/Icon.jsx';
import { Drawer, Field, Modal, Spinner, useToast } from '../components/ui.jsx';
import { useApp } from '../state/store.jsx';
import { rand, validPhone } from '../lib/metrics.js';

export const TINT_CLS = ['', 'thumb-cream', 'thumb-lav'];
export const THUMB = (i) => TINT_CLS[i % 3];

export function ProductThumb({ p, index = 0, size = 64 }) {
  return (
    <span className={`thumb ${THUMB(index)}`} style={{ width: size, height: size }}>
      {p.imageURL ? <img src={p.imageURL} alt="" /> : <Icon name="bag" size={size * 0.38} />}
    </span>
  );
}

/** Add / edit a product. `product` = existing product to edit; `preset` = values to prefill a new one. */
export function ProductModal({ product, preset, onClose, onSaved }) {
  const { api } = useApp();
  const toast = useToast();
  const src = product || preset || {};
  const [f, setF] = useState({ name: src.name || '', description: src.description || '', price: src.price ?? '', stock: src.stock ?? '' });
  const [file, setFile] = useState(null);
  const [errs, setErrs] = useState({});
  const [busy, setBusy] = useState(false);

  const pick = (e) => {
    const x = e.target.files?.[0]; if (!x) return;
    if (!x.type.startsWith('image/')) { setErrs({ ...errs, image: 'Please choose an image file.' }); setFile(null); return; }
    if (x.size > 5 * 1024 * 1024) { setErrs({ ...errs, image: 'That image is larger than 5 MB.' }); setFile(null); return; }
    setErrs({ ...errs, image: undefined }); setFile(x);
  };
  const submit = async (e) => {
    e.preventDefault();
    const er = {};
    if (!f.name.trim()) er.name = 'Give the product a name.';
    const price = Number(f.price); const stock = Number(f.stock);
    if (f.price === '' || !(price >= 0) || !Number.isFinite(price)) er.price = 'Enter a price in rand (0 or more).';
    if (f.stock === '' || !Number.isInteger(stock) || stock < 0) er.stock = 'Enter a whole number (0 or more).';
    setErrs(er); if (Object.keys(er).length) return;
    setBusy(true);
    try {
      let imageURL = product?.imageURL || '';
      if (file) imageURL = (await api.uploadFile('products', file)).url || imageURL;
      const data = { name: f.name.trim(), description: f.description.trim(), price: Math.round(price * 100) / 100, stock, imageURL };
      if (product) { await api.update('products', product.id, data); toast.success('Product updated'); } else { await api.add('products', data); toast.success(`${data.name} added`); }
      onSaved?.(); onClose();
    } catch (x) { toast.error(x.message); } finally { setBusy(false); }
  };
  return (
    <Modal title={product ? 'Edit product' : 'Add product'} onClose={onClose} footer={<><button className="btn btn-ghost" onClick={onClose}>Cancel</button><button className="btn" form="prod-form" disabled={busy}>{busy ? <Spinner /> : 'Save product'}</button></>}>
      <form id="prod-form" className="stack" onSubmit={submit} noValidate>
        <Field label="Name" error={errs.name}><input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="Chocolate Cake" maxLength={60} /></Field>
        <Field label="Description"><input value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} placeholder="Custom celebration cake" maxLength={100} /></Field>
        <div className="form-grid">
          <Field label="Price (R)" error={errs.price}><input type="number" inputMode="decimal" min="0" step="0.01" value={f.price} onChange={(e) => setF({ ...f, price: e.target.value })} placeholder="350" /></Field>
          <Field label="Stock" error={errs.stock}><input type="number" inputMode="numeric" min="0" step="1" value={f.stock} onChange={(e) => setF({ ...f, stock: e.target.value })} placeholder="5" /></Field>
        </div>
        <Field label="Photo (optional)" error={errs.image} hint="JPG or PNG, up to 5 MB"><input type="file" accept="image/*" onChange={pick} /></Field>
      </form>
    </Modal>
  );
}

export function CustomersDrawer({ onClose }) {
  const { customers } = useApp();
  const [q, setQ] = useState('');
  const list = useMemo(() => customers.filter((c) => `${c.name} ${c.phone}`.toLowerCase().includes(q.trim().toLowerCase())).sort((a, b) => (b.totalSpent || 0) - (a.totalSpent || 0)), [customers, q]);
  return (
    <Drawer title={`Customers (${customers.length})`} onClose={onClose}>
      <div className="field"><input className="input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search customers" aria-label="Search customers" /></div>
      <p className="muted small">Add a customer name when you record a sale and they appear here automatically.</p>
      {list.length === 0 && <p className="muted center" style={{ padding: 24 }}>{customers.length ? 'No customers match your search.' : 'No customers yet.'}</p>}
      {list.map((c) => (
        <div className="kv" key={c.id}>
          <div className="row" style={{ gap: 12 }}><span className="tile tile-sm"><Icon name="user" size={18} /></span><div><strong>{c.name}</strong><div className="muted small">{c.phone || 'No phone saved'}</div></div></div>
          <strong className="c-purple">{rand(c.totalSpent || 0)}</strong>
        </div>
      ))}
    </Drawer>
  );
}

export function BusinessModal({ onClose }) {
  const { profile, api } = useApp();
  const toast = useToast();
  const b = profile?.business || {};
  const [f, setF] = useState({ name: b.name || '', location: b.location || profile?.location || '', description: b.description || '', phone: b.phone || '', social: b.social || '', goal: b.goal || '', cipc: !!b.cipc });
  const [file, setFile] = useState(null);
  const [errs, setErrs] = useState({});
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    const er = {};
    if (!f.name.trim()) er.name = 'Enter your business name.';
    if (f.phone && !validPhone(f.phone)) er.phone = 'Use a South African number, e.g. +27 71 234 5678.';
    if (f.goal !== '' && !(Number(f.goal) >= 0)) er.goal = 'Enter an amount in rand.';
    setErrs(er); if (Object.keys(er).length) return;
    setBusy(true);
    try {
      let logoURL = b.logoURL || '';
      if (file) logoURL = (await api.uploadFile('logo', file)).url || logoURL;
      await api.updateProfile({ business: { ...b, name: f.name.trim(), location: f.location.trim(), description: f.description.trim(), phone: f.phone.trim(), social: f.social.trim(), goal: Number(f.goal) || 0, cipc: f.cipc, logoURL } });
      toast.success('Business details saved'); onClose();
    } catch (x) { toast.error(x.message); } finally { setBusy(false); }
  };
  return (
    <Modal title="Business details" onClose={onClose} width={560} footer={<><button className="btn btn-ghost" onClick={onClose}>Cancel</button><button className="btn" form="biz-form" disabled={busy}>{busy ? <Spinner /> : 'Save details'}</button></>}>
      <form id="biz-form" className="stack" onSubmit={submit} noValidate>
        <div className="form-grid">
          <Field label="Business name" error={errs.name}><input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} maxLength={60} /></Field>
          <Field label="Location"><input value={f.location} onChange={(e) => setF({ ...f, location: e.target.value })} /></Field>
        </div>
        <Field label="Short description"><textarea value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} placeholder="What do you sell and who do you serve?" maxLength={300} /></Field>
        <div className="form-grid">
          <Field label="Business phone" error={errs.phone}><input type="tel" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} placeholder="+27 71 234 5678" /></Field>
          <Field label="Website or social link"><input value={f.social} onChange={(e) => setF({ ...f, social: e.target.value })} placeholder="instagram.com/abosbakery" /></Field>
          <Field label="Monthly sales goal (R)" error={errs.goal}><input type="number" min="0" step="100" value={f.goal} onChange={(e) => setF({ ...f, goal: e.target.value })} placeholder="15000" /></Field>
          <Field label="Logo (optional)"><input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} /></Field>
        </div>
        <label className="row" style={{ cursor: 'pointer' }}><input type="checkbox" checked={f.cipc} onChange={(e) => setF({ ...f, cipc: e.target.checked })} style={{ width: 20, height: 20, accentColor: '#6938ff' }} /> My business is registered with CIPC</label>
      </form>
    </Modal>
  );
}

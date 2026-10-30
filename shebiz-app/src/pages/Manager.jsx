import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import { Confirm, EmptyState, Field, Menu, Modal, PageHeader, Skeleton, Spinner, Tabs, useToast, download } from '../components/ui.jsx';
import { useApp } from '../state/store.jsx';
import { EXPENSE_CATEGORIES } from '../data/seed.js';
import { rand, stockStatus, toCSV } from '../lib/metrics.js';
import { ProductModal, ProductThumb } from './bizParts.jsx';

const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
const fmtDate = (iso) => new Date(iso).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' });

// ---------- Record sale ----------
function RecordSaleCard() {
  const { products, customers, api } = useApp();
  const toast = useToast();
  const sorted = useMemo(() => [...products].sort((a, b) => a.name.localeCompare(b.name)), [products]);
  const [pid, setPid] = useState('');
  const [qty, setQty] = useState(1);
  const [cust, setCust] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => { // pick the first in-stock product automatically
    if (!pid || !products.some((p) => p.id === pid)) setPid(sorted.find((p) => Number(p.stock) > 0)?.id || sorted[0]?.id || '');
  }, [sorted]); // eslint-disable-line

  const p = products.find((x) => x.id === pid);
  const stock = Number(p?.stock) || 0;
  const total = (Number(qty) || 0) * (Number(p?.price) || 0);
  const tooMany = p && Number(qty) > stock;
  const submit = async (e) => {
    e.preventDefault();
    if (!p) { setErr('Add a product first.'); return; }
    if (!Number.isInteger(Number(qty)) || Number(qty) < 1) { setErr('Quantity must be at least 1.'); return; }
    if (tooMany) { setErr(`Only ${stock} in stock for ${p.name}.`); return; }
    setErr(''); setBusy(true);
    try {
      const sale = await api.recordSale({ productId: pid, quantity: Number(qty), customerName: cust });
      toast.success(`Sale recorded: ${rand(sale.total)}`); setQty(1); setCust('');
    } catch (x) { setErr(x.message); toast.error(x.message); } finally { setBusy(false); }
  };
  return (
    <form className="card" onSubmit={submit} noValidate id="record-sale">
      <h2>Record sale</h2>
      {products.length === 0 ? <p className="muted">You have no products yet. Add one to start recording sales.</p> : (
        <div className="stack">
          <Field label="Product">
            <select value={pid} onChange={(e) => { setPid(e.target.value); setQty(1); setErr(''); }}>
              {sorted.map((x) => <option key={x.id} value={x.id} disabled={Number(x.stock) <= 0}>{x.name} {Number(x.stock) <= 0 ? '(out of stock)' : `(${x.stock} in stock)`}</option>)}
            </select>
          </Field>
          <div className="form-grid">
            <Field label="Quantity" error={tooMany ? `Only ${stock} in stock` : err && !tooMany ? err : ''}>
              <div className="stepper">
                <button type="button" onClick={() => setQty(Math.max(1, Number(qty) - 1))} aria-label="Decrease quantity" disabled={Number(qty) <= 1}>−</button>
                <input type="number" min="1" step="1" inputMode="numeric" value={qty} onChange={(e) => setQty(e.target.value)} aria-label="Quantity" />
                <button type="button" onClick={() => setQty(Math.min(stock || 1, Number(qty) + 1))} aria-label="Increase quantity" disabled={Number(qty) >= stock}>+</button>
              </div>
            </Field>
            <Field label="Price"><input value={p ? rand(p.price) : ''} readOnly aria-readonly="true" style={{ background: '#faf8ff' }} /></Field>
          </div>
          <Field label="Customer (optional)"><input value={cust} onChange={(e) => setCust(e.target.value)} placeholder="e.g. Nomsa Dlamini" list="cust-list" maxLength={60} /></Field>
          <datalist id="cust-list">{customers.slice(0, 80).map((c) => <option key={c.id} value={c.name} />)}</datalist>
          <div className="total-bar"><span className="stat-label">Total</span><strong>{rand(total)}</strong></div>
          <button className="btn btn-block" disabled={busy || !p || stock <= 0 || tooMany || Number(qty) < 1} style={{ minHeight: 52 }}>{busy ? <Spinner /> : 'Record Sale'}</button>
        </div>
      )}
    </form>
  );
}

// ---------- Add / edit expense ----------
function ExpenseForm({ initial, onDone, compact }) {
  const { api } = useApp();
  const toast = useToast();
  const [f, setF] = useState({ category: initial?.category || 'Ingredients', amount: initial?.amount ?? '', date: initial?.date || today(), note: initial?.note || '' });
  const [errs, setErrs] = useState({});
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    const er = {}; const amount = Number(f.amount);
    if (!(amount > 0)) er.amount = 'Enter an amount above R0.';
    if (!f.date) er.date = 'Choose a date.';
    else if (f.date > today()) er.date = 'The date cannot be in the future.';
    setErrs(er); if (Object.keys(er).length) return;
    setBusy(true);
    try {
      const data = { category: f.category, amount: Math.round(amount * 100) / 100, date: f.date, note: f.note.trim() };
      if (initial) { await api.update('expenses', initial.id, data); toast.success('Expense updated'); } else { await api.add('expenses', data); toast.success('Expense saved'); setF({ category: f.category, amount: '', date: today(), note: '' }); }
      onDone?.();
    } catch (x) { toast.error(x.message); } finally { setBusy(false); }
  };
  return (
    <form className="stack" onSubmit={submit} noValidate id={initial ? 'exp-edit' : undefined}>
      <div className="form-grid">
        <Field label="Category"><select value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })}>{EXPENSE_CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></Field>
        <Field label="Amount (R)" error={errs.amount}><input type="number" inputMode="decimal" min="0" step="0.01" value={f.amount} onChange={(e) => setF({ ...f, amount: e.target.value })} placeholder="450" /></Field>
      </div>
      <Field label="Date" error={errs.date}><input type="date" value={f.date} max={today()} onChange={(e) => setF({ ...f, date: e.target.value })} /></Field>
      {!compact && <Field label="Note (optional)"><input value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} placeholder="e.g. Flour and sugar" maxLength={100} /></Field>}
      {!initial && <button className="btn btn-coral btn-block" style={{ minHeight: 52 }} disabled={busy}>{busy ? <Spinner /> : 'Save Expense'}</button>}
      {initial && <button className="hidden" aria-hidden="true" tabIndex={-1} disabled={busy}>save</button>}
    </form>
  );
}
function EditExpenseModal({ expense, onClose }) {
  return (
    <Modal title="Edit expense" onClose={onClose} footer={<><button className="btn btn-ghost" onClick={onClose}>Cancel</button><button className="btn" form="exp-edit">Save changes</button></>}>
      <ExpenseForm initial={expense} onDone={onClose} />
    </Modal>
  );
}

function RestockModal({ product, onClose }) {
  const { api } = useApp();
  const toast = useToast();
  const [n, setN] = useState(10);
  const [busy, setBusy] = useState(false);
  const save = async (e) => {
    e?.preventDefault();
    const add = Number(n);
    if (!Number.isInteger(add) || add < 1) { toast.error('Enter a whole number of 1 or more.'); return; }
    setBusy(true);
    try { await api.update('products', product.id, { stock: (Number(product.stock) || 0) + add }); toast.success(`${product.name} restocked: now ${(Number(product.stock) || 0) + add}`); onClose(); } catch (x) { toast.error(x.message); } finally { setBusy(false); }
  };
  return (
    <Modal title={`Restock ${product.name}`} onClose={onClose} width={420} footer={<><button className="btn btn-ghost" onClick={onClose}>Cancel</button><button className="btn" onClick={save} disabled={busy}>{busy ? <Spinner /> : 'Update stock'}</button></>}>
      <p className="muted">Currently in stock: <strong style={{ color: 'var(--ink)' }}>{product.stock}</strong></p>
      <form onSubmit={save}><Field label="Units to add"><input type="number" min="1" step="1" value={n} onChange={(e) => setN(e.target.value)} data-autofocus /></Field></form>
    </Modal>
  );
}

// ---------- page ----------
export default function Manager() {
  const { products, sales, expenses, customers, api, ready } = useApp();
  const toast = useToast();
  const [sp, setSp] = useSearchParams();
  const tab = ['products', 'sale', 'expenses'].includes(sp.get('tab')) ? sp.get('tab') : 'products';
  const lowOnly = sp.get('filter') === 'low';
  const [q, setQ] = useState('');
  const [sort, setSort] = useState('name');
  const [limit, setLimit] = useState(12);
  const [modal, setModal] = useState(null); // {type, item}
  const [returnStock, setReturnStock] = useState(true);
  const formsRef = useRef(null);

  useEffect(() => { setLimit(12); setQ(''); if (tab !== 'products' && window.innerWidth < 900) formsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, [tab]);
  const setTab = (t) => setSp(t === 'products' ? {} : { tab: t });
  const needle = q.trim().toLowerCase();

  const prodList = useMemo(() => {
    const r = products.filter((p) => (!lowOnly || Number(p.stock) <= 2) && (!needle || `${p.name} ${p.description}`.toLowerCase().includes(needle)));
    const cmp = { name: (a, b) => a.name.localeCompare(b.name), price: (a, b) => b.price - a.price, stock: (a, b) => a.stock - b.stock }[sort];
    return [...r].sort(cmp);
  }, [products, needle, sort, lowOnly]);
  const saleList = useMemo(() => [...sales].filter((s) => !needle || `${s.productName} ${s.customerName || ''}`.toLowerCase().includes(needle)).sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt))), [sales, needle]);
  const expList = useMemo(() => [...expenses].filter((e) => !needle || `${e.category} ${e.note || ''}`.toLowerCase().includes(needle)).sort((a, b) => String(b.date).localeCompare(String(a.date))), [expenses, needle]);

  const exportCsv = () => {
    if (tab === 'products') download('products.csv', toCSV(prodList, [{ label: 'Product', get: (p) => p.name }, { label: 'Description', get: (p) => p.description }, { label: 'Price (R)', get: (p) => p.price }, { label: 'Stock', get: (p) => p.stock }, { label: 'Status', get: (p) => stockStatus(p.stock).label }]));
    if (tab === 'sale') download('sales.csv', toCSV(saleList, [{ label: 'Date', get: (s) => String(s.createdAt).slice(0, 10) }, { label: 'Product', get: (s) => s.productName }, { label: 'Quantity', get: (s) => s.quantity }, { label: 'Unit price (R)', get: (s) => s.unitPrice }, { label: 'Total (R)', get: (s) => s.total }, { label: 'Customer', get: (s) => s.customerName }]));
    if (tab === 'expenses') download('expenses.csv', toCSV(expList, [{ label: 'Date', get: (e) => e.date }, { label: 'Category', get: (e) => e.category }, { label: 'Amount (R)', get: (e) => e.amount }, { label: 'Note', get: (e) => e.note }]));
    toast.success('CSV downloaded');
  };

  const duplicate = async (p) => { try { await api.add('products', { name: `${p.name} (copy)`, description: p.description, price: p.price, stock: p.stock, imageURL: p.imageURL || '' }); toast.success('Product duplicated'); } catch (x) { toast.error(x.message); } };
  const delProduct = async () => { try { await api.remove('products', modal.item.id); toast.success('Product deleted'); } catch (x) { toast.error(x.message); } setModal(null); };
  const delExpense = async () => { try { await api.remove('expenses', modal.item.id); toast.success('Expense deleted'); } catch (x) { toast.error(x.message); } setModal(null); };
  const delSale = async () => {
    const s = modal.item;
    try {
      await api.remove('sales', s.id);
      const p = s.productId && products.find((x) => x.id === s.productId);
      if (returnStock && p) await api.update('products', p.id, { stock: (Number(p.stock) || 0) + (Number(s.quantity) || 0) });
      const c = s.customerName && customers.find((x) => x.name.toLowerCase() === s.customerName.toLowerCase());
      if (c) await api.update('customers', c.id, { totalSpent: Math.max(0, (Number(c.totalSpent) || 0) - (Number(s.total) || 0)) });
      toast.success('Sale deleted');
    } catch (x) { toast.error(x.message); }
    setModal(null);
  };

  if (!ready) return <><PageHeader title="Business manager" /><Skeleton h={420} r={24} /></>;

  const rowMenu = (p) => (
    <Menu align="right" trigger={({ toggle }) => <button className="mini-btn" onClick={toggle} aria-label={`Actions for ${p.name}`}><Icon name="more" size={18} /></button>}
      items={[{ label: 'Edit', icon: 'edit', onClick: () => setModal({ type: 'edit', item: p }) }, { label: 'Restock', icon: 'plus', onClick: () => setModal({ type: 'restock', item: p }) }, { label: 'Duplicate', icon: 'copy', onClick: () => duplicate(p) }, { divider: true }, { label: 'Delete', icon: 'trash', danger: true, onClick: () => setModal({ type: 'delete', item: p }) }]} />
  );
  const titles = { products: 'Products & services', sale: 'Sales history', expenses: 'Expenses' };

  return (
    <>
      <PageHeader title="Business manager" subtitle="Products, sales and expenses" />
      <div style={{ marginBottom: 24 }}><Tabs label="Business manager sections" value={tab} onChange={setTab} tabs={[{ key: 'products', label: 'Products' }, { key: 'sale', label: 'Record Sale' }, { key: 'expenses', label: 'Expenses' }]} /></div>

      <div className="split-2-1" style={{ alignItems: 'start', gridTemplateColumns: 'minmax(0,1.5fr) minmax(0,1fr)' }}>
        <div className="card">
          <div className="row between" style={{ marginBottom: 16, flexWrap: 'wrap' }}>
            <h2 style={{ margin: 0 }}>{titles[tab]}</h2>
            <div className="row-wrap">
              <button className="btn btn-ghost btn-sm" onClick={exportCsv}><Icon name="download" size={14} /> Export CSV</button>
              {tab === 'products' && <button className="btn btn-sm" onClick={() => setModal({ type: 'add' })}>+ Add product</button>}
            </div>
          </div>
          <div className="row-wrap" style={{ marginBottom: 16 }}>
            <label className="input row" style={{ flex: 1, minWidth: 160, minHeight: 44, gap: 8, padding: '0 12px' }}><Icon name="search" size={16} /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Search ${tab === 'products' ? 'products' : tab === 'sale' ? 'sales' : 'expenses'}`} aria-label="Search" style={{ border: 0, outline: 0, width: '100%', background: 'none' }} /></label>
            {tab === 'products' && (
              <>
                <select className="input" style={{ width: 'auto', minHeight: 44 }} value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort products"><option value="name">Sort: Name</option><option value="price">Sort: Price (high)</option><option value="stock">Sort: Stock (low first)</option></select>
                <button className={`filter-chip ${lowOnly ? 'on' : ''}`} style={{ padding: '0 14px' }} aria-pressed={lowOnly} onClick={() => setSp(lowOnly ? {} : { filter: 'low' })}>Low stock only</button>
              </>
            )}
          </div>

          {tab === 'products' && (
            <div className="table">
              <div className="t-head stat-label"><span>Product</span><span>Price</span><span>Stock</span><span /></div>
              {prodList.length === 0 && <EmptyState icon="store" title={products.length ? 'No products match' : 'No products yet'} text={products.length ? 'Try a different search or clear the filter.' : 'Add your first product to start selling.'} action={<button className="btn" onClick={() => setModal({ type: 'add' })}>+ Add product</button>} />}
              {prodList.slice(0, limit).map((p, i) => {
                const st = stockStatus(p.stock);
                return (
                  <div className="t-row" key={p.id}>
                    <div className="row" style={{ gap: 14, minWidth: 0 }}><ProductThumb p={p} index={i} /><div style={{ minWidth: 0 }}><strong>{p.name}</strong><div className="muted small" style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.description}</div></div></div>
                    <strong>{rand(p.price)}</strong>
                    <div><strong>{p.stock}</strong><small className={`c-${st.color}`} style={{ display: 'block', fontWeight: 800, fontSize: 11 }}>{st.label}</small></div>
                    {rowMenu(p)}
                  </div>
                );
              })}
              {prodList.length > limit && <button className="btn btn-soft btn-sm" style={{ alignSelf: 'center' }} onClick={() => setLimit(limit + 12)}>Show more ({prodList.length - limit} left)</button>}
            </div>
          )}

          {tab === 'sale' && (
            <div className="table">
              <div className="t-head sales stat-label"><span>Product</span><span>Qty</span><span>Total</span><span>Date</span><span /></div>
              {saleList.length === 0 && <EmptyState icon="bag" title="No sales yet" text="Record a sale using the form and it will appear here." />}
              {saleList.slice(0, limit).map((s) => (
                <div className="t-row sales" key={s.id}>
                  <div style={{ minWidth: 0 }}><strong>{s.productName}</strong>{s.customerName && <div className="muted small">{s.customerName}</div>}</div>
                  <span>{s.quantity}</span><strong>{rand(s.total)}</strong><span className="muted small">{fmtDate(s.createdAt)}</span>
                  <button className="mini-btn danger" onClick={() => { setReturnStock(true); setModal({ type: 'delSale', item: s }); }} aria-label={`Delete sale of ${s.productName}`}><Icon name="trash" size={16} /></button>
                </div>
              ))}
              {saleList.length > limit && <button className="btn btn-soft btn-sm" style={{ alignSelf: 'center' }} onClick={() => setLimit(limit + 12)}>Show more ({saleList.length - limit} left)</button>}
            </div>
          )}

          {tab === 'expenses' && (
            <div className="table">
              <div className="t-head exp stat-label"><span>Category</span><span>Amount</span><span>Date</span><span /></div>
              {expList.length === 0 && <EmptyState icon="briefcase" title="No expenses yet" text="Save an expense using the form and it will appear here." />}
              {expList.slice(0, limit).map((e) => (
                <div className="t-row exp" key={e.id}>
                  <div style={{ minWidth: 0 }}><strong>{e.category}</strong>{e.note && <div className="muted small">{e.note}</div>}</div>
                  <strong className="c-red">{rand(e.amount)}</strong><span className="muted small">{fmtDate(e.date)}</span>
                  <div className="row" style={{ gap: 0 }}>
                    <button className="mini-btn" onClick={() => setModal({ type: 'editExp', item: e })} aria-label={`Edit ${e.category} expense`}><Icon name="edit" size={16} /></button>
                    <button className="mini-btn danger" onClick={() => setModal({ type: 'delExp', item: e })} aria-label={`Delete ${e.category} expense`}><Icon name="trash" size={16} /></button>
                  </div>
                </div>
              ))}
              {expList.length > limit && <button className="btn btn-soft btn-sm" style={{ alignSelf: 'center' }} onClick={() => setLimit(limit + 12)}>Show more ({expList.length - limit} left)</button>}
            </div>
          )}
        </div>

        <div className="stack" style={{ gap: 24 }} ref={formsRef}>
          <RecordSaleCard />
          <div className="card"><h2>Add expense</h2><ExpenseForm /></div>
        </div>
      </div>

      {modal?.type === 'add' && <ProductModal onClose={() => setModal(null)} />}
      {modal?.type === 'edit' && <ProductModal product={modal.item} onClose={() => setModal(null)} />}
      {modal?.type === 'restock' && <RestockModal product={modal.item} onClose={() => setModal(null)} />}
      {modal?.type === 'delete' && <Confirm title="Delete product?" message={`${modal.item.name} will be removed from your products. Past sales stay in your history.`} confirmLabel="Delete" danger onConfirm={delProduct} onClose={() => setModal(null)} />}
      {modal?.type === 'editExp' && <EditExpenseModal expense={modal.item} onClose={() => setModal(null)} />}
      {modal?.type === 'delExp' && <Confirm title="Delete expense?" message={`${modal.item.category} · ${rand(modal.item.amount)} on ${fmtDate(modal.item.date)} will be removed and your profit will update.`} confirmLabel="Delete" danger onConfirm={delExpense} onClose={() => setModal(null)} />}
      {modal?.type === 'delSale' && (
        <Confirm title="Delete this sale?" confirmLabel="Delete sale" danger onConfirm={delSale} onClose={() => setModal(null)}
          message={<span>This removes {modal.item.quantity} × {modal.item.productName} ({rand(modal.item.total)}) from your sales.
            {modal.item.productId && products.some((p) => p.id === modal.item.productId) && (
              <label className="row" style={{ marginTop: 14, cursor: 'pointer' }}><input type="checkbox" checked={returnStock} onChange={(e) => setReturnStock(e.target.checked)} style={{ width: 18, height: 18, accentColor: '#6938ff' }} /> Return the items to stock</label>)}</span>} />
      )}
    </>
  );
}

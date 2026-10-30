import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import { LineChart } from '../components/Charts.jsx';
import { Menu, PageHeader, Progress, Skeleton, Tilt } from '../components/ui.jsx';
import { UpgradeBanner } from '../site/components.jsx';
import { useApp } from '../state/store.jsx';
import { businessKpis, businessSetup, fmtPct, lastMonths, monthlySeries, rand } from '../lib/metrics.js';
import { BusinessModal, CustomersDrawer, ProductModal } from './bizParts.jsx';

const RANGES = [[3, 'Last 3 months'], [6, 'Last 6 months'], [12, 'Last 12 months']];

function Change({ v, goodWhenDown }) {
  if (v === null || v === undefined) return <span className="flat">No change data yet</span>;
  const good = goodWhenDown ? v <= 0 : v >= 0;
  return <span className={good ? 'up' : 'down'}>{fmtPct(v)}</span>;
}

export default function Business() {
  const { profile, ready, sales, expenses, products, customers } = useApp();
  const nav = useNavigate();
  const [months, setMonths] = useState(6);
  const [modal, setModal] = useState(null);

  const now = useMemo(() => new Date(), []);
  const month = { y: now.getFullYear(), m: now.getMonth() };
  const kpi = useMemo(() => businessKpis({ sales, expenses, products, customers }, month, now), [sales, expenses, products, customers]); // eslint-disable-line
  const series = useMemo(() => monthlySeries(sales, expenses, lastMonths(months, month)).map((s) => ({ label: s.label, value: s.sales })), [sales, expenses, months]); // eslint-disable-line
  const setup = useMemo(() => (profile ? businessSetup(profile, { products, sales, expenses }) : null), [profile, products, sales, expenses]);

  if (!ready || !profile) return <><PageHeader title="Your business" /><div className="grid-4">{[0, 1, 2, 3].map((i) => <Skeleton key={i} h={130} r={24} />)}</div></>;
  const b = profile.business || {};
  const health = kpi.profit < 0 ? ['Loss this month', 'down'] : kpi.margin >= 30 ? ['Healthy', 'up'] : ['Watch your costs', 'flat'];
  const goal = Number(b.goal) || 0;

  const stats = [
    { label: "Today's sales", value: rand(kpi.todaySales), cls: 'c-purple', sub: <Change v={kpi.todayChange} /> },
    { label: 'Monthly sales', value: rand(kpi.monthSales), cls: 'c-coral', sub: <Change v={kpi.salesChange} /> },
    { label: 'Expenses', value: rand(kpi.monthExpenses), cls: 'c-red', sub: <span className="down">This month</span> },
    { label: 'Est. profit', value: rand(kpi.profit), cls: kpi.profit < 0 ? 'c-red' : 'c-green', sub: <span className={health[1]}>{health[0]}</span> },
  ];
  const quick = [
    { t: 'Add product', icon: 'plus', cls: 'card-tint-lav', act: () => setModal('product') },
    { t: 'Record sale', icon: 'bag', cls: 'card-tint-blush', act: () => nav('/my-business/manager?tab=sale') },
    { t: 'Add expense', icon: 'briefcase', cls: 'card-tint-cream', act: () => nav('/my-business/manager?tab=expenses') },
    { t: 'View stock', icon: 'store', cls: 'card-tint-lav', act: () => nav('/my-business/manager?tab=products') },
    { t: 'Analytics', icon: 'chart', cls: 'card-tint-blush', act: () => nav('/my-business/analytics') },
  ];

  return (
    <>
      <PageHeader title={b.name || 'My business'} subtitle={`Business dashboard${b.location ? ` · ${b.location}` : ''}`}>
        <button className="btn btn-ghost" onClick={() => nav('/my-business/payments')}><Icon name="bag" size={16} /> Payments preview</button>
        <button className="btn" onClick={() => nav('/my-business/manager?tab=sale')}><Icon name="plus" size={16} /> Record sale</button>
      </PageHeader>

      <div className="grid-4" style={{ marginBottom: 24 }}>
        {stats.map((s) => (
          <Tilt key={s.label} className="card stat-card"><div className="stat-label">{s.label}</div><div className={`stat-num ${s.cls}`}>{s.value}</div><div>{s.sub}</div></Tilt>
        ))}
      </div>

      <div className="split-2-1" style={{ marginBottom: 24 }}>
        <div className="card">
          <div className="row between"><h2 style={{ margin: 0 }}>Sales overview</h2>
            <Menu align="right" trigger={({ toggle }) => <button className="link-btn" style={{ color: 'var(--body)', fontWeight: 500 }} onClick={toggle}>{RANGES.find((r) => r[0] === months)[1]} <Icon name="chevronDown" size={14} /></button>} items={RANGES.map(([n, l]) => ({ label: l, active: n === months, onClick: () => setMonths(n) }))} />
          </div>
          <div style={{ marginTop: 14 }}><LineChart data={series} /></div>
        </div>
        <div className="card">
          <h2>Business health</h2>
          {[['Products', kpi.productCount, 'c-purple', () => nav('/my-business/manager?tab=products')], ['Customers', kpi.customerCount, 'c-coral', () => setModal('customers')], ['Low stock', kpi.lowStock, 'c-gold', () => nav('/my-business/manager?tab=products&filter=low')]].map(([l, v, c, act]) => (
            <button key={l} className="kv" onClick={act} style={{ width: '100%', background: 'none', border: 0, borderBottom: '1px solid var(--border)', padding: '20px 0', textAlign: 'left' }} aria-label={`${l}: ${v}`}>
              <span className="muted">{l}</span><span className={c} style={{ fontSize: 26, fontWeight: 800 }}>{v}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <h2>Quick actions</h2>
        <div className="grid-5">
          {quick.map((q) => (
            <Tilt as="button" key={q.t} className={`card quick ${q.cls}`} onClick={q.act} style={{ boxShadow: 'none' }}>
              <span style={{ color: 'var(--purple)' }}><Icon name={q.icon} size={24} /></span>
              <strong>{q.t}</strong><small>Open <Icon name="arrow" size={12} /></small>
            </Tilt>
          ))}
        </div>
      </div>

      <div className="split-1-1">
        <div className="card">
          <div className="row between"><h2 style={{ margin: 0 }}>Business setup</h2><b className="c-gold">{setup.pct}%</b></div>
          <div style={{ margin: '12px 0 16px' }}><Progress value={setup.pct} tone="gold" label="Business setup" /></div>
          <div className="stack" style={{ gap: 10 }}>
            {setup.steps.map((s) => (
              <div key={s.key} className="row" style={{ gap: 10, opacity: s.done ? 0.6 : 1 }}>
                <span className="lesson-item" style={{ padding: 0, border: 0, width: 'auto', background: 'none' }}><span className="circ" style={s.done ? { background: 'var(--green)', borderColor: 'var(--green)', width: 22, height: 22, borderRadius: '50%', display: 'grid', placeItems: 'center', color: '#fff', border: '2px solid var(--green)' } : { width: 22, height: 22, borderRadius: '50%', border: '2px solid var(--track)', display: 'inline-block' }}>{s.done && <Icon name="check" size={12} stroke={3} />}</span></span>
                <span style={s.done ? { textDecoration: 'line-through' } : undefined}>{s.label}</span>
              </div>
            ))}
          </div>
          <button className="btn btn-soft btn-sm" style={{ marginTop: 18 }} onClick={() => setModal('business')}><Icon name="edit" size={14} /> Edit business details</button>
        </div>
        <div className="card">
          <h2>Monthly sales goal</h2>
          {goal > 0 ? (
            <>
              <div className="row between" style={{ marginBottom: 8 }}><strong>{rand(kpi.monthSales)} of {rand(goal)}</strong><b className="c-purple">{Math.min(100, Math.round((kpi.monthSales / goal) * 100))}%</b></div>
              <Progress value={Math.round((kpi.monthSales / goal) * 100)} label="Monthly sales goal" />
              <p className="muted small" style={{ marginTop: 10 }}>{kpi.monthSales >= goal ? 'You hit your goal this month. Well done!' : `${rand(goal - kpi.monthSales)} to go this month.`}</p>
            </>
          ) : <p className="muted">Set a monthly sales target to track your progress here.</p>}
          <div className="row-wrap" style={{ marginTop: 18 }}>
            <button className="btn btn-soft btn-sm" onClick={() => setModal('business')}>{goal ? 'Change goal' : 'Set a goal'}</button>
            <Link to="/my-business/analytics" className="btn btn-ghost btn-sm" style={{ textDecoration: 'none' }}>See analytics</Link>
          </div>
        </div>
      </div>

      {modal === 'product' && <ProductModal onClose={() => setModal(null)} />}
      {modal === 'customers' && <CustomersDrawer onClose={() => setModal(null)} />}
      {modal === 'business' && <BusinessModal onClose={() => setModal(null)} />}
      <div style={{ marginTop: 24 }}><UpgradeBanner title="Growing your business?" text="The proposed Free plan covers up to five products. The Business plan adds unlimited inventory, advanced analytics and invoices." /></div>
    </>
  );
}

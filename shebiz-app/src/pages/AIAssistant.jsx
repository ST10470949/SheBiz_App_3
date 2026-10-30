import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import { Confirm, EmptyState, Menu, PageHeader, Progress, Skeleton, Spinner, useReducedMotion, useToast } from '../components/ui.jsx';
import { useApp } from '../state/store.jsx';
import { useOpps, firstName } from '../state/hooks.js';
import { AI_DISCLAIMER, TOPICS, parseAnswer } from '../lib/ai.js';
import { demoStore } from '../site/data.js';
import { businessKpis, bestSellers, lastMonths } from '../lib/metrics.js';

const LIMITS = { free: 5, pro: 30, business: 100 };
const today = () => new Date().toISOString().slice(0, 10);
const readUsed = () => { const u = demoStore.get('aiUsage', null); return u && u.date === today() ? u.count : 0; };

const uid = () => (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`);
const newChat = () => ({ id: uid(), title: 'New chat', messages: [], createdAt: new Date().toISOString() });

function Answer({ text }) {
  const p = parseAnswer(text);
  if (!p.steps.length) return <div>{p.body.map((l, i) => <p key={i} style={{ marginBottom: 6 }}>{l}</p>)}</div>;
  return (
    <div>
      {p.title && <div className="t">{p.title}</div>}
      <ol>{p.steps.map((s, i) => <li key={i}>{s}</li>)}</ol>
    </div>
  );
}

export default function AIAssistant() {
  const { user, profile, ready, backend, aiChats, api, sales, expenses, products, customers } = useApp();
  const toast = useToast();
  const loc = useLocation();
  const nav = useNavigate();
  const reduced = useReducedMotion();
  const opps = useOpps();

  const [chat, setChat] = useState(newChat);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const [stream, setStream] = useState(null); // {id, text}
  const [confirm, setConfirm] = useState(false);
  const [used, setUsed] = useState(readUsed);
  const plan = demoStore.get('plan', 'free');
  const limit = LIMITS[plan] || 5;
  const atLimit = used >= limit;
  const bump = () => { const n = readUsed() + 1; demoStore.set('aiUsage', { date: today(), count: n }); setUsed(n); };
  const endRef = useRef(null);
  const sentFromDashboard = useRef(false);
  const timer = useRef(null);
  const chatRef = useRef(chat);
  chatRef.current = chat;

  // context sent to the assistant so answers are personal
  const ctx = useMemo(() => {
    if (!profile) return {};
    const now = new Date();
    const month = { y: now.getFullYear(), m: now.getMonth() };
    const k = businessKpis({ sales, expenses, products, customers }, month, now);
    const best = bestSellers(sales, lastMonths(6, month), 1)[0];
    return {
      firstName: firstName(profile, user),
      businessName: profile.business?.name,
      bestSeller: best?.name,
      margin: k.margin,
      monthSales: k.monthSales,
      lowStock: products.filter((p) => Number(p.stock) <= 2).map((p) => p.name),
      topOpp: opps.find((o) => o.days >= 0)?.title,
      skills: (profile.skills || []).map((s) => s.name),
      careerInterests: profile.careerInterests || [],
      location: profile.location,
    };
  }, [profile, user, sales, expenses, products, customers, opps]);

  const history = useMemo(() => [...aiChats].filter((c) => c.messages?.length).sort((a, b) => String(b.updatedAt || b.createdAt).localeCompare(String(a.updatedAt || a.createdAt))), [aiChats]);

  useEffect(() => () => clearInterval(timer.current), []);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'nearest' }); }, [chat.messages.length, thinking, stream?.text, reduced]);

  const persist = async (c) => {
    if (!api || !c.messages.length) return;
    try { await api.set('aiChats', c.id, { title: c.title, messages: c.messages, createdAt: c.createdAt, updatedAt: new Date().toISOString() }); } catch (e) { console.warn('could not save chat', e); }
  };

  const answerFor = async (question, variant, msgs) => {
    try {
      return await backend.askAI({ question, context: ctx, history: msgs.slice(-8).map((m) => ({ role: m.role, text: m.text })) });
    } catch (e) {
      console.warn('AI request failed', e);
      return null;
    }
  };

  const reveal = (id, text, done) => {
    if (reduced) { setStream(null); done(); return; }
    const words = text.split(/(\s+)/);
    let i = 0;
    setStream({ id, text: '' });
    clearInterval(timer.current);
    timer.current = setInterval(() => {
      i += 3;
      if (i >= words.length) { clearInterval(timer.current); setStream(null); done(); } else setStream({ id, text: words.slice(0, i).join('') });
    }, 28);
  };

  const ask = async (raw, { regenerate = false } = {}) => {
    const q = raw.trim();
    if (!q || thinking || stream) return;
    if (readUsed() >= limit) { toast.info('You have used today\'s AI allowance. See the options below.'); return; }
    setInput('');
    let c = chatRef.current;
    let msgs = c.messages;
    let variant = 0;
    if (regenerate) {
      const lastAI = [...msgs].reverse().find((m) => m.role === 'ai');
      variant = (lastAI?.variant || 0) + 1;
      msgs = msgs.slice(0, msgs.lastIndexOf(lastAI));
    } else {
      msgs = [...msgs, { id: uid(), role: 'user', text: q, at: new Date().toISOString() }];
    }
    c = { ...c, title: c.title === 'New chat' ? q.slice(0, 48) : c.title, messages: msgs };
    setChat(c);
    setThinking(true);
    await new Promise((r) => setTimeout(r, reduced ? 0 : 700));
    const text = await answerFor(q, variant, msgs);
    setThinking(false);
    if (text) bump();
    if (!text) { toast.error('The assistant could not answer right now. Please try again in a moment.'); setChat({ ...c, messages: msgs }); return; }
    const aiMsg = { id: uid(), role: 'ai', text, variant, at: new Date().toISOString(), feedback: null };
    reveal(aiMsg.id, text, () => {
      const finished = { ...c, messages: [...msgs, aiMsg] };
      setChat((cur) => (cur.id === c.id ? finished : cur));
      persist(finished);
    });
  };

  // question typed on the dashboard
  useEffect(() => {
    const q = loc.state?.ask;
    if (!q || sentFromDashboard.current || !ready || !profile) return;
    sentFromDashboard.current = true;
    nav(loc.pathname, { replace: true, state: null });
    ask(q);
  }, [loc.state, ready, profile]); // eslint-disable-line

  const setFeedback = (msgId, value) => {
    const c = { ...chat, messages: chat.messages.map((m) => (m.id === msgId ? { ...m, feedback: m.feedback === value ? null : value } : m)) };
    setChat(c); persist(c);
  };
  const copy = async (text) => {
    try { await navigator.clipboard.writeText(text); toast.success('Copied'); } catch { toast.error('Could not copy. Select the text and copy it manually.'); }
  };
  const startNew = () => { clearInterval(timer.current); setStream(null); setThinking(false); setChat(newChat()); setInput(''); };
  const loadChat = (c) => { clearInterval(timer.current); setStream(null); setThinking(false); setChat({ id: c.id, title: c.title, messages: c.messages, createdAt: c.createdAt }); };
  const clearAll = async () => {
    try { await Promise.all(aiChats.map((c) => api.remove('aiChats', c.id))); startNew(); toast.success('Chat history cleared'); } catch (e) { toast.error(e.message); }
    setConfirm(false);
  };

  if (!ready || !profile) return <><PageHeader title="SheBiz AI" /><Skeleton h={220} r={28} /></>;

  const lastAiId = [...chat.messages].reverse().find((m) => m.role === 'ai')?.id;
  const busy = thinking || !!stream;

  return (
    <>
      <PageHeader title="SheBiz AI" subtitle="Your personal career and business assistant.">
        <button className="btn btn-ghost btn-sm" onClick={startNew}><Icon name="plus" size={14} /> New chat</button>
        <Menu align="right" trigger={({ toggle }) => <button className="btn btn-soft btn-sm" onClick={toggle}>History ({history.length}) <Icon name="chevronDown" size={14} /></button>}
          items={[
            ...history.slice(0, 8).map((c) => ({ label: c.title || 'Chat', icon: 'message', active: c.id === chat.id, onClick: () => loadChat(c) })),
            ...(history.length ? [{ divider: true }] : []),
            { label: history.length ? 'Clear history' : 'No saved chats yet', icon: 'trash', danger: !!history.length, onClick: () => history.length && setConfirm(true) },
          ]} />
      </PageHeader>

      <div className="ai-allowance" role="status">
        <div className="row between wrap"><b>Daily AI allowance: {Math.min(used, limit)} of {limit} prompt cycles used.</b><span className="muted small">{plan === 'free' ? 'Free plan' : `${plan === 'pro' ? 'Pro' : 'Business'} plan (preview)`}</span></div>
        <Progress value={Math.min(100, Math.round((used / limit) * 100))} label="Daily AI allowance used" />
        <p className="muted small" style={{ marginTop: 8 }}>Resets each day. This counter is stored in your browser as a preview and is not enforced by a server. Plans and the premium AI pass are proposed, not yet on sale. {used > 0 && <button className="link-btn" onClick={() => { demoStore.set('aiUsage', { date: today(), count: 0 }); setUsed(0); }}>Reset demo counter</button>}</p>
      </div>
      {atLimit && (
        <div className="upgrade-banner" style={{ marginBottom: 20 }}>
          <div><h3>You have reached today's AI allowance</h3><p>Come back tomorrow, or see the proposed Pro and Business plans for extended AI usage, or a one-off premium AI pass. Nothing is charged in this preview.</p></div>
          <button className="btn btn-white" onClick={() => nav('/membership')}>View plans</button>
        </div>
      )}
      <form className="ai-banner" onSubmit={(e) => { e.preventDefault(); ask(input); }}>
        <Icon name="sparkle" size={42} stroke={1.5} />
        <div className="grow">
          <div style={{ fontWeight: 800, fontSize: 13 }}>Ask SheBiz AI</div>
          <h2>What would you like guidance on today?</h2>
          <div className="ai-input">
            <input className="input" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about careers, business, skills or mentorship..." aria-label="Ask SheBiz AI" maxLength={500} />
            <button className="btn btn-coral" style={{ width: 54, padding: 0 }} disabled={!input.trim() || busy || atLimit} aria-label="Send">{busy ? <Spinner /> : <Icon name="arrow" size={20} />}</button>
          </div>
        </div>
      </form>

      <h3 style={{ marginBottom: 14 }}>Start with a topic</h3>
      <div className="grid-4" style={{ marginBottom: 28 }}>
        {TOPICS.map((t) => (
          <button key={t.key} className={`topic t-${t.tint}`} onClick={() => ask(t.prompt)} disabled={busy || atLimit}>
            <b><span className="c-purple"><Icon name={t.icon} size={22} /></span>{t.title}</b>
            <small>{t.sub}</small>
          </button>
        ))}
      </div>

      <div className="card">
        <h2 style={{ marginBottom: 16 }}>Recent guidance</h2>
        <div className="chat" aria-live="polite">
          {chat.messages.length === 0 && !busy && <EmptyState icon="sparkle" title="Ask your first question" text="Pick a topic above or type your own question. I can help with careers, business, skills and mentorship." />}
          {chat.messages.map((m) => (m.role === 'user' ? (
            <div key={m.id} className="bubble bubble-me"><div className="who">You</div>{m.text}</div>
          ) : (
            <div key={m.id} className="bubble bubble-ai">
              <div className="who"><Icon name="sparkle" size={14} /> SheBiz AI</div>
              <Answer text={m.text} />
              <div className="bubble-acts">
                <button className="icon-btn sm" onClick={() => copy(m.text)} aria-label="Copy answer"><Icon name="copy" size={15} /></button>
                <button className="icon-btn sm" onClick={() => setFeedback(m.id, 'up')} aria-pressed={m.feedback === 'up'} aria-label="Helpful" style={m.feedback === 'up' ? { background: 'var(--green)', color: '#fff' } : undefined}><Icon name="thumbUp" size={15} /></button>
                <button className="icon-btn sm" onClick={() => setFeedback(m.id, 'down')} aria-pressed={m.feedback === 'down'} aria-label="Not helpful" style={m.feedback === 'down' ? { background: 'var(--red)', color: '#fff' } : undefined}><Icon name="thumbDown" size={15} /></button>
                {m.id === lastAiId && <button className="icon-btn sm" onClick={() => ask(chat.messages.filter((x) => x.role === 'user').slice(-1)[0]?.text || '', { regenerate: true })} disabled={busy} aria-label="Regenerate answer"><Icon name="refresh" size={15} /></button>}
              </div>
            </div>
          )))}
          {thinking && <div className="bubble bubble-ai"><div className="who"><Icon name="sparkle" size={14} /> SheBiz AI</div><span className="typing" aria-label="SheBiz AI is typing"><i /><i /><i /></span></div>}
          {stream && <div className="bubble bubble-ai"><div className="who"><Icon name="sparkle" size={14} /> SheBiz AI</div><Answer text={stream.text || '...'} /></div>}
          <div ref={endRef} />
        </div>
        <p className="disclaimer">{AI_DISCLAIMER}</p>
      </div>

      {confirm && <Confirm title="Clear chat history?" message="All saved conversations with SheBiz AI will be deleted." confirmLabel="Clear history" danger onConfirm={clearAll} onClose={() => setConfirm(false)} />}
    </>
  );
}

import React, { useMemo, useState } from 'react';
import Icon from '../../components/Icon.jsx';
import { EmptyState, Modal, Field, useToast } from '../../components/ui.jsx';
import { COMMUNITY_TOPICS, SAMPLE_POSTS, demoStore } from '../data.js';
import { PageHero, Portrait, SampleBadge, SampleNotice } from '../components.jsx';

const REACTS = ['Like', 'Inspiring', 'Helpful'];

export default function Community() {
  const toast = useToast();
  const [posts, setPosts] = useState(() => demoStore.get('posts', SAMPLE_POSTS));
  const [topic, setTopic] = useState('All');
  const [q, setQ] = useState('');
  const [compose, setCompose] = useState(false);
  const [openC, setOpenC] = useState({});
  const [draft, setDraft] = useState({});
  const persist = (n) => { setPosts(n); demoStore.set('posts', n); };
  const list = useMemo(() => posts.filter((p) => (topic === 'All' || p.topic === topic) && (!q.trim() || p.text.toLowerCase().includes(q.trim().toLowerCase()))), [posts, topic, q]);
  const react = (id, kind) => persist(posts.map((p) => (p.id === id ? { ...p, reactions: { ...p.reactions, [kind]: !p.reactions?.[kind] }, likes: p.likes + (p.reactions?.[kind] ? -1 : 1) } : p)));
  const comment = (id) => { const t = (draft[id] || '').trim(); if (!t) return; persist(posts.map((p) => (p.id === id ? { ...p, comments: [...p.comments, { id: `${Date.now()}`, author: 'You', text: t }] } : p))); setDraft({ ...draft, [id]: '' }); };
  const reset = () => { demoStore.set('posts', SAMPLE_POSTS); setPosts(SAMPLE_POSTS); toast.info('Sample posts restored'); };

  return (
    <>
      <PageHero eyebrow="Community" title="A supportive circle of women who lift each other" text="Ask questions, share wins and get advice from women at every stage of their journey.">
        <div className="row-wrap" style={{ marginTop: 18 }}><button className="btn btn-pink btn-lg" onClick={() => setCompose(true)}><Icon name="plus" size={16} /> Create a post</button></div>
      </PageHero>
      <section className="sec-tight"><div className="wrap-site comm-grid">
        <div>
          <SampleNotice>Sample posts show the design. Anything you post here is stored only in your browser in this preview and is not shared with other people.</SampleNotice>
          <div className="search-big slim" role="search"><Icon name="search" size={18} /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search posts" aria-label="Search posts" /></div>
          <div className="chip-row">{COMMUNITY_TOPICS.map((t) => <button key={t} className={`fchip ${topic === t ? 'on' : ''}`} aria-pressed={topic === t} onClick={() => setTopic(t)}>{t}</button>)}</div>
          {list.length === 0 ? <div className="empty-dark"><EmptyState icon="message" title="No posts here yet" text="Be the first to start a conversation." action={<button className="btn btn-pink" onClick={() => setCompose(true)}>Create a post</button>} /></div> : list.map((p) => (
            <article key={p.id} className="post">
              <div className="post-head"><Portrait skin={p.author === 'You' ? '#8a5a3c' : '#6b3f2a'} tint="blush" size={46} label="Member illustration" /><div className="grow"><b>{p.author}</b><small>{p.role} · {p.topic}</small></div>{p.sample !== false && !p.mine && <SampleBadge />}</div>
              <p className="post-text">{p.text}</p>
              <div className="post-acts">
                {REACTS.map((r) => <button key={r} className={`react ${p.reactions?.[r] ? 'on' : ''}`} aria-pressed={!!p.reactions?.[r]} onClick={() => react(p.id, r)}>{r}</button>)}
                <span className="muted small">{p.likes} reactions</span>
                <button className="link-light ml-auto" onClick={() => setOpenC({ ...openC, [p.id]: !openC[p.id] })}>{p.comments.length} {p.comments.length === 1 ? 'comment' : 'comments'}</button>
              </div>
              {openC[p.id] && (
                <div className="comments">
                  {p.comments.map((c) => <div key={c.id} className="comment"><b>{c.author}</b><span>{c.text}</span></div>)}
                  <form onSubmit={(e) => { e.preventDefault(); comment(p.id); }} className="comment-form"><input value={draft[p.id] || ''} onChange={(e) => setDraft({ ...draft, [p.id]: e.target.value })} placeholder="Write a comment" aria-label="Write a comment" maxLength={300} /><button className="btn btn-pink btn-sm" disabled={!(draft[p.id] || '').trim()}>Post</button></form>
                </div>
              )}
            </article>
          ))}
        </div>
        <aside className="stack">
          <div className="side-card"><h3>Topics</h3><div className="stack" style={{ gap: 6 }}>{COMMUNITY_TOPICS.filter((t) => t !== 'All').map((t) => <button key={t} className="side-link" onClick={() => setTopic(t)}>{t} <span>{posts.filter((p) => p.topic === t).length}</span></button>)}</div></div>
          <div className="side-card"><h3>Community guidelines</h3><p className="muted-on-dark">Be kind, be curious and never share private financial or personal details.</p></div>
          <button className="link-light" onClick={reset}>Restore sample posts</button>
        </aside>
      </div></section>
      {compose && <Compose onClose={() => setCompose(false)} onPost={(p) => { persist([{ id: `${Date.now()}`, author: 'You', role: 'Member', likes: 0, comments: [], mine: true, sample: false, ...p }, ...posts]); toast.success('Posted in this preview'); setCompose(false); }} />}
    </>
  );
}

function Compose({ onClose, onPost }) {
  const [topic, setTopic] = useState('Business');
  const [text, setText] = useState('');
  const [err, setErr] = useState('');
  const submit = (e) => { e.preventDefault(); if (text.trim().length < 10) { setErr('Write at least 10 characters.'); return; } onPost({ topic, text: text.trim() }); };
  return (
    <Modal title="Create a post" onClose={onClose} footer={<><button className="btn btn-ghost" onClick={onClose}>Cancel</button><button className="btn btn-pink" form="post-form">Post</button></>}>
      <form id="post-form" className="stack" onSubmit={submit} noValidate>
        <Field label="Topic"><select value={topic} onChange={(e) => setTopic(e.target.value)}>{COMMUNITY_TOPICS.filter((t) => t !== 'All').map((t) => <option key={t}>{t}</option>)}</select></Field>
        <Field label="What would you like to share or ask?" error={err}><textarea value={text} onChange={(e) => { setText(e.target.value); setErr(''); }} maxLength={600} placeholder="Share a tip, ask a question or celebrate a win..." /></Field>
      </form>
    </Modal>
  );
}

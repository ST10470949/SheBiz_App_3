// SheBiz hero scene: a stylised 3D workspace where women collaborate and a mentor guides them.
// Built procedurally with Three.js (no external model files), so it ships with the project and stays light.
// - Characters are stylised figures (not photographs): diverse skin tones and hairstyles, professional clothing.
// - Subtle camera parallax, idle animation, hotspots linked to real product pages.
// - Respects prefers-reduced-motion (one still frame) and falls back to an illustration if WebGL is missing.
// The video-call screen is drawn from canvas and is clearly sample content.

import React, { useEffect, useRef, useState } from 'react';

const HOTSPOTS = [
  { key: 'mentor', label: 'Mentor session', sub: 'Meet your mentor', to: '/explore/mentorship', anchor: [0.1, 2.15, -1.9] },
  { key: 'biz', label: 'Grow your business', sub: 'Products, sales, analytics', to: '/my-business', anchor: [-0.05, 1.12, 0.12] },
  { key: 'opp', label: 'Find opportunities', sub: 'Jobs, bursaries, funding', to: '/explore/opportunities', anchor: [0.95, 0.95, 0.0] },
];

export function SceneFallback({ className = '' }) {
  return (
    <svg className={`scene-fallback ${className}`} viewBox="0 0 640 460" role="img" aria-label="Women collaborating with a mentor around a table with laptops">
      <defs>
        <linearGradient id="sfg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#7138c8" /><stop offset="1" stopColor="#e84a9b" /></linearGradient>
        <radialGradient id="sff" cx=".5" cy=".5" r=".5"><stop offset="0" stopColor="#5421a8" /><stop offset="1" stopColor="#261338" stopOpacity="0" /></radialGradient>
      </defs>
      <ellipse cx="320" cy="400" rx="290" ry="52" fill="url(#sff)" />
      <rect x="170" y="38" width="300" height="150" rx="14" fill="#1b0b2c" stroke="#b9a1ff" strokeOpacity=".5" />
      <rect x="184" y="52" width="136" height="122" rx="8" fill="url(#sfg)" opacity=".85" /><rect x="330" y="52" width="126" height="56" rx="8" fill="#35135f" /><rect x="330" y="118" width="126" height="56" rx="8" fill="#35135f" />
      <circle cx="252" cy="104" r="22" fill="#f5b7d7" /><path d="M214 174c4-30 20-40 38-40s34 10 38 40z" fill="#fce5f1" />
      <rect x="120" y="296" width="400" height="22" rx="10" fill="#b9a1ff" /><rect x="150" y="318" width="14" height="70" fill="#35135f" /><rect x="476" y="318" width="14" height="70" fill="#35135f" />
      <g><circle cx="230" cy="214" r="30" fill="#6b3f2a" /><circle cx="230" cy="196" r="38" fill="#1a0f14" opacity=".9" /><circle cx="230" cy="214" r="26" fill="#7a4a33" /><rect x="196" y="244" width="68" height="58" rx="24" fill="#e84a9b" /></g>
      <g><circle cx="410" cy="214" r="26" fill="#9a6b4a" /><path d="M384 208c0-30 52-30 52 0z" fill="#e84a9b" /><rect x="378" y="242" width="64" height="60" rx="24" fill="#7138c8" /></g>
      <g><circle cx="540" cy="150" r="26" fill="#5a3322" /><path d="M514 144c0-34 52-34 52 0z" fill="#1a0f14" /><rect x="506" y="178" width="68" height="130" rx="30" fill="#5421a8" /><rect x="470" y="190" width="44" height="12" rx="6" fill="#5a3322" transform="rotate(-24 470 190)" /></g>
      <rect x="196" y="270" width="68" height="30" rx="4" fill="#dccaf0" /><rect x="380" y="272" width="62" height="28" rx="4" fill="#f0e7fa" />
    </svg>
  );
}

export default function CollabScene({ className = '', focus = 'wide', onNavigate, onFail, hotspots = true }) {
  const mount = useRef(null);
  const spotRefs = useRef({});
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let disposed = false;
    let cleanup = () => {};
    const el = mount.current;
    if (!el) return undefined;

    import('three').then((THREE) => {
      if (disposed) return;
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const small = window.innerWidth < 760;
      let renderer;
      try {
        renderer = new THREE.WebGLRenderer({ antialias: !small, alpha: true, powerPreference: 'high-performance' });
      } catch (e) { setFailed(true); onFail?.(); return; }
      if (!renderer.getContext()) { setFailed(true); onFail?.(); return; }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, small ? 1.5 : 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.3;
      renderer.shadowMap.enabled = !small;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.domElement.style.cssText = 'width:100%;height:100%;display:block;touch-action:pan-y';
      el.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 50);
      const root = new THREE.Group();
      scene.add(root);
      const animated = [];

      // ---------- materials ----------
      const M = (color, rough = 0.55, metal = 0, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal, ...extra });
      const mats = {
        floor: M(0x45197a, 0.9), ring: new THREE.MeshBasicMaterial({ color: 0xe84a9b, transparent: true, opacity: 0.55 }),
        table: M(0xf0e7fa, 0.45), tableEdge: M(0x7138c8, 0.4), leg: M(0x261338, 0.5, 0.2),
        chair: M(0x5421a8, 0.6), laptop: M(0xcdb8ee, 0.35, 0.5), notebook: M(0xe84a9b, 0.6), paper: M(0xfff7fb, 0.8),
        mug: M(0xf5b7d7, 0.5), plant: M(0x2a9d78, 0.7), pot: M(0xb9a1ff, 0.6), frame: M(0x1b0b2c, 0.4, 0.3),
      };

      // ---------- helpers ----------
      const V = (x, y, z) => new THREE.Vector3(x, y, z);
      const box = (w, h, d, mat, x = 0, y = 0, z = 0) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; return m; };
      const limb = (a, b, r1, r2, mat) => {
        const dir = new THREE.Vector3().subVectors(b, a); const len = dir.length();
        const m = new THREE.Mesh(new THREE.CylinderGeometry(r2, r1, len, 14), mat);
        m.position.copy(a).addScaledVector(dir, 0.5); m.quaternion.setFromUnitVectors(V(0, 1, 0), dir.normalize()); m.castShadow = true; return m;
      };
      const ball = (r, mat, x, y, z, sx = 1, sy = 1, sz = 1) => { const m = new THREE.Mesh(new THREE.SphereGeometry(r, 20, 16), mat); m.position.set(x, y, z); m.scale.set(sx, sy, sz); m.castShadow = true; return m; };

      // ---------- canvas textures (sample content, clearly labelled) ----------
      const makeCanvas = (w, h, draw) => {
        const c = document.createElement('canvas'); c.width = w; c.height = h; const ctx = c.getContext('2d');
        const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
        const redraw = (t = 0) => { draw(ctx, w, h, t); tex.needsUpdate = true; }; redraw(0); return { tex, redraw };
      };
      const rr = (ctx, x, y, w, h, r) => { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); };
      const person = (ctx, cx, cy, s, skin, hair, top) => {
        ctx.fillStyle = top; ctx.beginPath(); ctx.ellipse(cx, cy + s * 1.45, s * 1.25, s * 0.95, 0, Math.PI, 0); ctx.fill();
        ctx.fillStyle = hair; ctx.beginPath(); ctx.arc(cx, cy - s * 0.05, s * 0.78, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = skin; ctx.beginPath(); ctx.arc(cx, cy, s * 0.6, 0, Math.PI * 2); ctx.fill();
      };
      const call = makeCanvas(1024, 576, (ctx, w, h, t) => {
        const g = ctx.createLinearGradient(0, 0, w, h); g.addColorStop(0, '#2b1244'); g.addColorStop(1, '#4a1d86'); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = 'rgba(255,255,255,.08)'; ctx.fillRect(0, 0, w, 56);
        ctx.fillStyle = '#fff'; ctx.font = '600 24px Inter, sans-serif'; ctx.fillText('SheBiz  ·  Mentorship session (sample)', 24, 36);
        ctx.fillStyle = '#e84a9b'; ctx.beginPath(); ctx.arc(w - 40, 28, 7, 0, 7); ctx.fill();
        const speaking = Math.floor(t * 0.5) % 2;
        const tile = (x, y, tw, th, name, skin, hair, top, active) => {
          const tg = ctx.createLinearGradient(x, y, x + tw, y + th); tg.addColorStop(0, '#5b2a9e'); tg.addColorStop(1, '#8c3fb8');
          ctx.fillStyle = tg; rr(ctx, x, y, tw, th, 18); ctx.fill();
          if (active) { ctx.strokeStyle = '#f5b7d7'; ctx.lineWidth = 5; rr(ctx, x, y, tw, th, 18); ctx.stroke(); }
          ctx.save(); rr(ctx, x, y, tw, th, 18); ctx.clip(); person(ctx, x + tw / 2, y + th * 0.42, th * 0.2, skin, hair, top); ctx.restore();
          ctx.fillStyle = 'rgba(20,5,40,.65)'; rr(ctx, x + 12, y + th - 40, name.length * 11 + 22, 28, 10); ctx.fill();
          ctx.fillStyle = '#fff'; ctx.font = '500 17px Inter, sans-serif'; ctx.fillText(name, x + 22, y + th - 20);
        };
        tile(24, 76, 480, 330, 'Mentor (sample profile)', '#7a4a33', '#1a0f14', '#5421a8', speaking === 0);
        tile(520, 76, 230, 158, 'You', '#9a6b4a', '#1a0f14', '#e84a9b', speaking === 1);
        tile(520, 248, 230, 158, 'Team member', '#5a3322', '#1a0f14', '#7138c8', false);
        ctx.fillStyle = 'rgba(255,255,255,.1)'; rr(ctx, 766, 76, 234, 330, 18); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.font = '700 20px Poppins, sans-serif'; ctx.fillText('Business plan', 786, 112);
        ['Define your customer', 'Price your products', 'Track expenses', 'Pitch to funders'].forEach((s, i) => {
          const done = i < 2 + (Math.floor(t * 0.4) % 2); ctx.fillStyle = done ? '#e84a9b' : 'rgba(255,255,255,.25)'; ctx.beginPath(); ctx.arc(796, 150 + i * 52, 10, 0, 7); ctx.fill();
          if (done) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(791, 150 + i * 52); ctx.lineTo(795, 155 + i * 52); ctx.lineTo(802, 145 + i * 52); ctx.stroke(); }
          ctx.fillStyle = '#f0e7fa'; ctx.font = '500 16px Inter, sans-serif'; ctx.fillText(s, 816, 156 + i * 52);
        });
        // bars (illustrative)
        const bars = [0.4, 0.55, 0.5, 0.72, 0.66, 0.9];
        bars.forEach((v, i) => { const bh = 110 * v; const bg = ctx.createLinearGradient(0, 520 - bh, 0, 520); bg.addColorStop(0, '#e84a9b'); bg.addColorStop(1, '#7138c8'); ctx.fillStyle = bg; rr(ctx, 40 + i * 54, 520 - bh - 40, 36, bh, 6); ctx.fill(); });
        ctx.fillStyle = '#cdb8ee'; ctx.font = '500 16px Inter, sans-serif'; ctx.fillText('Illustrative growth chart', 40, 548);
        ['#e84a9b', '#7138c8', '#f5b7d7'].forEach((c, i) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(w / 2 + (i - 1) * 78 + 160, 478, 26, 0, 7); ctx.fill(); });
      });
      const dash = makeCanvas(512, 320, (ctx, w, h) => {
        ctx.fillStyle = '#35135f'; ctx.fillRect(0, 0, w, h); ctx.fillStyle = '#e84a9b'; ctx.fillRect(0, 0, w, 36);
        ctx.fillStyle = '#fff'; ctx.font = '700 20px Poppins, sans-serif'; ctx.fillText('My Business', 16, 25);
        [[16, 56], [186, 56], [356, 56]].forEach(([x, y], i) => { ctx.fillStyle = ['#7138c8', '#e84a9b', '#b9a1ff'][i]; rr(ctx, x, y, 150, 76, 12); ctx.fill(); });
        for (let i = 0; i < 7; i++) { const bh = 40 + ((i * 37) % 90); ctx.fillStyle = i % 2 ? '#f5b7d7' : '#b9a1ff'; rr(ctx, 24 + i * 66, 290 - bh, 44, bh, 6); ctx.fill(); }
      });
      const doc = makeCanvas(512, 320, (ctx, w, h) => {
        ctx.fillStyle = '#f0e7fa'; ctx.fillRect(0, 0, w, h); ctx.fillStyle = '#7138c8'; ctx.fillRect(0, 0, w, 36);
        ctx.fillStyle = '#fff'; ctx.font = '700 20px Poppins, sans-serif'; ctx.fillText('Opportunities', 16, 25);
        for (let i = 0; i < 4; i++) { ctx.fillStyle = '#fff'; rr(ctx, 16, 52 + i * 62, w - 32, 52, 10); ctx.fill(); ctx.fillStyle = i % 2 ? '#e84a9b' : '#7138c8'; rr(ctx, 28, 64 + i * 62, 28, 28, 8); ctx.fill(); ctx.fillStyle = '#cdb8ee'; ctx.fillRect(70, 66 + i * 62, 240, 10); ctx.fillRect(70, 84 + i * 62, 160, 8); }
      });
      const redrawers = [call, dash, doc];

      // ---------- room ----------
      const floor = new THREE.Mesh(new THREE.CircleGeometry(3.4, 64), mats.floor); floor.rotation.x = -Math.PI / 2; floor.position.set(0, 0, -0.2); floor.receiveShadow = true; root.add(floor);
      const ring = new THREE.Mesh(new THREE.RingGeometry(3.4, 3.46, 96), mats.ring); ring.rotation.x = -Math.PI / 2; ring.position.set(0, 0.004, -0.2); root.add(ring);
      const glow = new THREE.Mesh(new THREE.CircleGeometry(2.2, 48), new THREE.MeshBasicMaterial({ color: 0x7138c8, transparent: true, opacity: 0.35 })); glow.rotation.x = -Math.PI / 2; glow.position.set(0, 0.003, -0.2); root.add(glow);

      // wall display with the sample video call
      const screen = new THREE.Group(); screen.position.set(0, 1.95, -1.9);
      screen.add(box(2.42, 1.4, 0.06, mats.frame));
      const face = new THREE.Mesh(new THREE.PlaneGeometry(2.28, 1.28), new THREE.MeshBasicMaterial({ map: call.tex, toneMapped: false })); face.position.z = 0.035; screen.add(face);
      screen.add(box(0.12, 0.5, 0.06, mats.leg, 0, -0.95, -0.02));
      root.add(screen);

      // table
      const table = new THREE.Group();
      table.add(box(2.0, 0.07, 1.0, mats.table, 0, 0.74, 0)); table.add(box(2.04, 0.02, 1.04, mats.tableEdge, 0, 0.705, 0));
      [[-0.88, -0.4], [0.88, -0.4], [-0.88, 0.4], [0.88, 0.4]].forEach(([x, z]) => { const l = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.03, 0.7, 12), mats.leg); l.position.set(x, 0.35, z); l.castShadow = true; table.add(l); });
      root.add(table);

      const laptop = (x, z, tex, rotY) => {
        const g = new THREE.Group(); g.position.set(x, 0.775, z); g.rotation.y = rotY;
        g.add(box(0.36, 0.014, 0.25, mats.laptop, 0, 0, 0));
        const lid = new THREE.Group(); lid.position.set(0, 0.007, -0.125); lid.rotation.x = -0.4;
        lid.add(box(0.36, 0.22, 0.012, mats.laptop, 0, 0.11, 0));
        const s = new THREE.Mesh(new THREE.PlaneGeometry(0.33, 0.195), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false })); s.position.set(0, 0.11, 0.0075); lid.add(s);
        g.add(lid); root.add(g); return g;
      };
      // shared laptop faces the camera; two more face the women at each end
      laptop(0, 0.08, dash.tex, 0);
      laptop(-0.66, -0.02, doc.tex, -Math.PI / 2);
      laptop(0.66, -0.02, doc.tex, Math.PI / 2);
      const nb = box(0.26, 0.02, 0.19, mats.notebook, 0.42, 0.785, 0.2); nb.rotation.y = 0.35; root.add(nb);
      const pp = box(0.22, 0.004, 0.16, mats.paper, 0.42, 0.797, 0.2); pp.rotation.y = 0.35; root.add(pp);
      const mug = (x, z) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.03, 0.08, 16), mats.mug); m.position.set(x, 0.815, z); m.castShadow = true; root.add(m); };
      mug(-0.3, 0.3); mug(0.6, -0.3);
      // plant
      const plant = new THREE.Group(); plant.position.set(-2.05, 0, -0.9);
      const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.15, 0.32, 20), mats.pot); pot.position.y = 0.16; pot.castShadow = true; plant.add(pot);
      for (let i = 0; i < 9; i++) { const a = (i / 9) * Math.PI * 2; const leaf = ball(0.14, mats.plant, Math.cos(a) * 0.12, 0.6 + (i % 3) * 0.14, Math.sin(a) * 0.12, 0.45, 1.5, 0.45); leaf.rotation.z = Math.cos(a) * 0.5; leaf.rotation.x = Math.sin(a) * 0.5; plant.add(leaf); }
      root.add(plant);

      // chair
      const chair = (x, z) => {
        const g = new THREE.Group(); g.position.set(x, 0, z);
        g.add(box(0.46, 0.06, 0.44, mats.chair, 0, 0.45, 0.05)); g.add(box(0.44, 0.42, 0.05, mats.chair, 0, 0.72, -0.17));
        const st = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.42, 10), mats.leg); st.position.y = 0.22; g.add(st);
        const base = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.03, 20), mats.leg); base.position.y = 0.02; g.add(base); root.add(g);
      };
      const chairAt = (x, z, rot) => { const c0 = root.children.length; chair(x, z); const g = root.children[root.children.length - 1]; g.rotation.y = rot; };
      chairAt(-1.38, 0, Math.PI / 2); chairAt(1.38, 0, -Math.PI / 2);

      // ---------- people ----------
      const makeWoman = (o) => {
        const g = new THREE.Group();
        const skin = M(o.skin, 0.62), hairM = M(o.hair, 0.8), topM = M(o.top, 0.6), botM = M(o.bottom, 0.65), shoe = M(0x1b0b2c, 0.5);
        const seated = !!o.seated;
        const pelvisY = seated ? 0.5 : 0.92;
        const parts = { head: new THREE.Group(), torso: new THREE.Group(), armL: new THREE.Group(), armR: new THREE.Group() };
        const shY = pelvisY + 0.02 + 0.5;
        // legs
        [-1, 1].forEach((s) => {
          const hip = V(s * 0.085, pelvisY, 0.02);
          const knee = seated ? V(s * 0.1, pelvisY + 0.01, 0.44) : V(s * 0.085, 0.5, 0.03);
          const ankle = seated ? V(s * 0.1, 0.1, 0.46) : V(s * 0.085, 0.08, 0.02);
          g.add(limb(hip, knee, 0.075, 0.06, botM)); g.add(ball(0.06, botM, knee.x, knee.y, knee.z)); g.add(limb(knee, ankle, 0.06, 0.042, botM));
          g.add(ball(0.05, shoe, ankle.x, 0.045, ankle.z + 0.05, 1, 0.8, 1.7));
        });
        g.add(ball(0.17, botM, 0, pelvisY + 0.02, 0.02, 1, 0.75, 0.9));
        // torso
        const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.14, 0.26, 8, 18), topM); torso.scale.set(1.15, 1, 0.78); torso.position.set(0, pelvisY + 0.02 + 0.27, 0); torso.castShadow = true;
        parts.torso.position.set(0, pelvisY, 0); torso.position.y -= pelvisY; parts.torso.add(torso);
        if (o.lapel) { const l1 = box(0.05, 0.3, 0.02, M(o.lapel, 0.5), -0.07, 0.4, 0.105); l1.rotation.z = 0.25; const l2 = box(0.05, 0.3, 0.02, M(o.lapel, 0.5), 0.07, 0.4, 0.105); l2.rotation.z = -0.25; parts.torso.add(l1, l2); }
        if (seated) parts.torso.rotation.x = 0.07;
        g.add(parts.torso);
        // neck + head
        const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.05, 0.12, 14), skin); neck.position.set(0, shY + 0.02, 0.01); g.add(neck);
        parts.head.position.set(0, shY + 0.16, 0.02);
        parts.head.add(ball(0.118, skin, 0, 0, 0, 0.93, 1.08, 1));
        parts.head.add(ball(0.013, M(0x1a0f14, 0.3), -0.04, 0.012, 0.108)); parts.head.add(ball(0.013, M(0x1a0f14, 0.3), 0.04, 0.012, 0.108));
        parts.head.add(ball(0.018, skin, 0, -0.012, 0.118, 1, 0.9, 0.8));
        const lip = new THREE.Mesh(new THREE.TorusGeometry(0.022, 0.0065, 8, 16, Math.PI), M(0xc23a7d, 0.5)); lip.position.set(0, -0.042, 0.105); lip.rotation.z = Math.PI; parts.head.add(lip);
        parts.head.add(ball(0.012, M(0xe84a9b, 0.4), -0.112, -0.03, 0.01), ball(0.012, M(0xe84a9b, 0.4), 0.112, -0.03, 0.01));
        if (o.hairStyle === 'afro') { parts.head.add(ball(0.165, hairM, 0, 0.035, -0.035, 1.05, 1, 1)); }
        else if (o.hairStyle === 'braids') {
          const cap = new THREE.Mesh(new THREE.SphereGeometry(0.128, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.62), hairM); cap.position.set(0, 0.012, -0.012); cap.scale.set(0.95, 1.08, 1.02); parts.head.add(cap);
          for (let i = 0; i < 9; i++) { const a = -0.9 + i * 0.225; const top = V(Math.sin(a) * 0.115, 0.0, -Math.cos(a) * 0.07 - 0.02); const end = V(Math.sin(a) * 0.15, -0.38, -Math.cos(a) * 0.09 - 0.03 - (i % 2) * 0.03); parts.head.add(limb(top, end, 0.014, 0.011, hairM)); }
        } else if (o.hairStyle === 'bun') {
          const cap = new THREE.Mesh(new THREE.SphereGeometry(0.126, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.55), hairM); cap.position.set(0, 0.015, -0.01); cap.scale.set(0.95, 1.08, 1.03); parts.head.add(cap);
          parts.head.add(ball(0.06, hairM, 0, 0.14, -0.04));
        } else if (o.hairStyle === 'wrap') {
          const w = ball(0.14, M(o.wrap || 0xe84a9b, 0.55), 0, 0.045, -0.025, 1.0, 0.95, 1.05); parts.head.add(w);
          const knot = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.022, 10, 20), M(o.wrap || 0xe84a9b, 0.55)); knot.position.set(0, 0.17, 0.0); knot.rotation.x = Math.PI / 2; parts.head.add(knot);
          const band = new THREE.Mesh(new THREE.TorusGeometry(0.122, 0.014, 8, 28), M(0xf5b7d7, 0.5)); band.position.set(0, 0.04, -0.01); band.rotation.x = Math.PI / 2 + 0.15; parts.head.add(band);
        }
        g.add(parts.head);
        // arms: built relative to the shoulder so they can be animated around it
        const arm = (grp, s, elbow, hand) => {
          grp.position.set(s * 0.18, shY - 0.01, 0);
          grp.add(ball(0.058, topM, 0, 0, 0)); grp.add(limb(V(0, 0, 0), elbow, 0.05, 0.043, topM)); grp.add(ball(0.043, topM, elbow.x, elbow.y, elbow.z)); grp.add(limb(elbow, hand, 0.04, 0.032, skin)); grp.add(ball(0.04, skin, hand.x, hand.y, hand.z, 1, 0.8, 1.2));
          g.add(grp);
        };
        const rel = (x, y, z) => V(x, y - shY, z);
        if (o.pose === 'type') {
          arm(parts.armL, -1, rel(-0.2, 0.8, 0.16).add(V(0.18, 0, 0)), rel(-0.12, 0.82, 0.44).add(V(0.18, 0, 0)));
          arm(parts.armR, 1, rel(0.2, 0.8, 0.16).sub(V(0.18, 0, 0)), rel(0.12, 0.82, 0.44).sub(V(0.18, 0, 0)));
        } else if (o.pose === 'write') {
          arm(parts.armL, -1, rel(-0.2, 0.82, 0.1).add(V(0.18, 0, 0)), rel(-0.05, 0.81, 0.33).add(V(0.18, 0, 0)));
          arm(parts.armR, 1, rel(0.2, 0.8, 0.14).sub(V(0.18, 0, 0)), rel(0.1, 0.82, 0.36).sub(V(0.18, 0, 0)));
        } else if (o.pose === 'point') {
          arm(parts.armL, -1, V(-0.2, -0.04, 0.1), V(-0.46, 0.2, 0.06));
          arm(parts.armR, 1, V(0.05, -0.26, 0.03), V(0.07, -0.5, 0.12));
        }
        g.position.set(...o.pos); g.rotation.y = o.rotY || 0; g.traverse((m) => { if (m.isMesh) m.castShadow = true; });
        g.userData = { parts, seated, phase: o.phase || 0, pose: o.pose, baseHeadY: o.headY || 0 };
        root.add(g); animated.push(g); return g;
      };

      makeWoman({ seated: true, pose: 'type', pos: [-1.38, 0, 0.02], rotY: 1.2, skin: 0x6b3f2a, hair: 0x2a1a22, hairStyle: 'afro', top: 0xe84a9b, bottom: 0x35135f, phase: 0, headY: 0.1 });
      makeWoman({ seated: true, pose: 'write', pos: [1.38, 0, 0.02], rotY: -1.2, skin: 0x9a6b4a, hair: 0x1a0f14, hairStyle: 'wrap', wrap: 0xf5b7d7, top: 0x7138c8, bottom: 0x261338, phase: 1.7, headY: -0.1 });
      makeWoman({ seated: false, pose: 'point', pos: [1.0, 0, -1.05], rotY: -0.45, skin: 0x5a3322, hair: 0x120a0e, hairStyle: 'braids', top: 0x5421a8, lapel: 0xb9a1ff, bottom: 0x261338, phase: 3.1, headY: -0.25 });

      // ---------- lights ----------
      scene.add(new THREE.HemisphereLight(0xf0e0ff, 0x4a1d86, 1.25));
      const key = new THREE.DirectionalLight(0xfff0f8, 2.1); key.position.set(2.4, 5, 3.2); key.castShadow = !small; key.shadow.mapSize.set(1024, 1024);
      Object.assign(key.shadow.camera, { left: -3.5, right: 3.5, top: 3.5, bottom: -3.5, near: 1, far: 12 }); key.shadow.bias = -0.0005; key.shadow.radius = 4; scene.add(key);
      const rim = new THREE.PointLight(0xe84a9b, 14, 9); rim.position.set(-2.6, 2.4, 1.2); scene.add(rim);
      const rim2 = new THREE.PointLight(0x7138c8, 18, 9); rim2.position.set(2.8, 1.8, -2.2); scene.add(rim2);

      // ---------- camera / layout ----------
      const base = { pos: V(0, 2.2, 4.7), look: V(0, 1.15, -0.4) };
      if (focus === 'mentor') { base.pos = V(0.8, 1.9, 3.7); base.look = V(0.5, 1.2, -0.4); }
      const hot = HOTSPOTS.map((h) => ({ ...h, v: V(...h.anchor) }));
      let w = 1, h = 1;
      const resize = () => {
        w = el.clientWidth || 600; h = el.clientHeight || 420;
        renderer.setSize(w, h, false); camera.aspect = w / h;
        const aspect = w / h; camera.fov = aspect < 1 ? 52 : aspect < 1.25 ? 44 : 36; camera.updateProjectionMatrix();
      };
      resize();
      const ro = new ResizeObserver(() => { resize(); draw(0); }); ro.observe(el);

      const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
      const onMove = (e) => { const r = el.getBoundingClientRect(); mouse.tx = ((e.clientX - r.left) / r.width - 0.5) * 2; mouse.ty = ((e.clientY - r.top) / r.height - 0.5) * 2; };
      const onLeave = () => { mouse.tx = 0; mouse.ty = 0; };
      window.addEventListener('pointermove', onMove, { passive: true }); el.addEventListener('pointerleave', onLeave);

      const tmp = new THREE.Vector3();
      const draw = (t) => {
        mouse.x += (mouse.tx - mouse.x) * 0.05; mouse.y += (mouse.ty - mouse.y) * 0.05;
        const sway = reduced ? 0 : Math.sin(t * 0.25) * 0.05;
        camera.position.set(base.pos.x + mouse.x * 0.5 + sway * 2, base.pos.y - mouse.y * 0.18, base.pos.z);
        camera.lookAt(base.look); root.rotation.y = mouse.x * 0.05;
        animated.forEach((f) => {
          const { parts, seated, phase, pose, baseHeadY } = f.userData; const k = t + phase;
          parts.torso.scale.y = 1 + Math.sin(k * 1.6) * 0.012;
          parts.head.rotation.y = baseHeadY + Math.sin(k * 0.5) * 0.12; parts.head.rotation.x = Math.sin(k * 0.8) * 0.03;
          if (pose === 'type') { parts.armL.rotation.x = Math.sin(k * 9) * 0.04; parts.armR.rotation.x = Math.sin(k * 9 + 1.7) * 0.04; }
          if (pose === 'write') parts.armR.rotation.z = Math.sin(k * 5) * 0.03;
          if (pose === 'point') { parts.armL.rotation.z = Math.sin(k * 1.1) * 0.05; parts.armL.rotation.x = Math.sin(k * 0.9) * 0.03; }
        });
        redrawers[0].redraw(t);
        renderer.render(scene, camera);
        if (hotspots) hot.forEach((hs) => {
          const node = spotRefs.current[hs.key]; if (!node) return;
          tmp.copy(hs.v); root.localToWorld(tmp); tmp.project(camera);
          node.style.transform = `translate(${(tmp.x * 0.5 + 0.5) * w}px, ${(-tmp.y * 0.5 + 0.5) * h}px) translate(-50%, -50%)`;
          node.style.opacity = tmp.z < 1 ? '1' : '0';
        });
      };

      let raf = 0; let running = false; let visible = true; const clock = new THREE.Clock();
      const loop = () => { raf = requestAnimationFrame(loop); draw(clock.getElapsedTime()); };
      const start = () => { if (!running && !reduced && visible && !document.hidden) { running = true; clock.start(); loop(); } };
      const stop = () => { running = false; cancelAnimationFrame(raf); };
      draw(0.4);
      const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; visible ? start() : stop(); }, { threshold: 0.05 }); io.observe(el);
      const onVis = () => (document.hidden ? stop() : start()); document.addEventListener('visibilitychange', onVis);
      start();
      el.dataset.ready = 'true';

      cleanup = () => {
        stop(); io.disconnect(); ro.disconnect(); document.removeEventListener('visibilitychange', onVis);
        window.removeEventListener('pointermove', onMove);
        scene.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => { m.map?.dispose?.(); m.dispose(); }); });
        renderer.dispose(); renderer.domElement.remove();
      };
    }).catch((e) => { console.warn('3D scene unavailable', e); setFailed(true); onFail?.(); });

    return () => { disposed = true; cleanup(); };
  }, [focus, hotspots]); // eslint-disable-line

  if (failed) return <SceneFallback className={className} />;
  return (
    <div className={`collab-scene ${className}`} ref={mount} role="img" aria-label="3D scene: women entrepreneurs collaborating with a mentor in a modern workspace">
      {hotspots && HOTSPOTS.map((h) => (
        <button key={h.key} type="button" className="hotspot" ref={(n) => { spotRefs.current[h.key] = n; }} onClick={() => onNavigate?.(h.to)} aria-label={`${h.label}: ${h.sub}`}>
          <span className="hotspot-dot" /><span className="hotspot-card"><b>{h.label}</b><small>{h.sub}</small></span>
        </button>
      ))}
    </div>
  );
}

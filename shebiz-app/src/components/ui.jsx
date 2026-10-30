import React, { createContext, useCallback, useContext, useEffect, useId, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Icon from './Icon.jsx';
import { initials } from '../lib/metrics.js';

// ---------------- Toasts ----------------
const ToastCtx = createContext(null);
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);
  const push = useCallback((type, message) => {
    const id = Math.random().toString(36).slice(2);
    setItems((l) => [...l.slice(-3), { id, type, message }]);
    setTimeout(() => setItems((l) => l.filter((t) => t.id !== id)), 3200);
  }, []);
  const api = useMemo(() => ({ success: (m) => push('success', m), error: (m) => push('error', m), info: (m) => push('info', m) }), [push]);
  return (
    <ToastCtx.Provider value={api}>
      {children}
      <div className="toasts" role="status" aria-live="polite">
        {items.map((t) => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            <Icon name={t.type === 'error' ? 'alert' : 'checkCircle'} size={18} />
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

// ---------------- Modal / Drawer ----------------
function useOverlay(onClose, panelRef) {
  useEffect(() => {
    const prev = document.activeElement;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab' && panelRef.current) {
        const f = panelRef.current.querySelectorAll('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])');
        const list = [...f].filter((el) => !el.disabled && el.offsetParent !== null);
        if (!list.length) return;
        const first = list[0]; const last = list[list.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    const t = setTimeout(() => {
      const target = panelRef.current?.querySelector('[data-autofocus],input,textarea,select') || panelRef.current?.querySelector('button');
      target?.focus();
    }, 30);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      clearTimeout(t);
      prev?.focus?.();
    };
  }, []); // eslint-disable-line
}

export function Modal({ title, onClose, children, footer, width = 520 }) {
  const ref = useRef(null);
  const tid = useId();
  useOverlay(onClose, ref);
  return createPortal(
    <div className="overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal" ref={ref} role="dialog" aria-modal="true" aria-labelledby={tid} style={{ maxWidth: width }}>
        <div className="modal-head">
          <h2 id={tid}>{title}</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close"><Icon name="x" size={18} /></button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}

export function Drawer({ title, onClose, children, footer, width = 460 }) {
  const ref = useRef(null);
  const tid = useId();
  useOverlay(onClose, ref);
  return createPortal(
    <div className="overlay overlay-drawer" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <aside className="drawer" ref={ref} role="dialog" aria-modal="true" aria-labelledby={tid} style={{ maxWidth: width }}>
        <div className="modal-head">
          <h2 id={tid}>{title}</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close"><Icon name="x" size={18} /></button>
        </div>
        <div className="drawer-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </aside>
    </div>,
    document.body,
  );
}

export function Confirm({ title, message, confirmLabel = 'Confirm', danger, onConfirm, onClose, busy }) {
  return (
    <Modal
      title={title} onClose={onClose} width={440}
      footer={<>
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className={`btn ${danger ? 'btn-red' : ''}`} onClick={onConfirm} disabled={busy} data-autofocus>{busy ? <Spinner /> : confirmLabel}</button>
      </>}
    >
      <p className="muted">{message}</p>
    </Modal>
  );
}

// ---------------- Small building blocks ----------------
export const Spinner = () => <span className="spinner" aria-label="Loading" />;

export function Field({ label, error, hint, children, className = '' }) {
  const id = useId();
  const child = React.isValidElement(children) ? React.cloneElement(children, { id, 'aria-invalid': !!error, 'aria-describedby': error ? `${id}-e` : undefined }) : children;
  return (
    <div className={`field ${error ? 'has-error' : ''} ${className}`}>
      {label && <label htmlFor={id}>{label}</label>}
      {child}
      {hint && !error && <small className="hint">{hint}</small>}
      {error && <small className="err" id={`${id}-e`} role="alert">{error}</small>}
    </div>
  );
}

export function PasswordInput({ value, onChange, placeholder, autoComplete, ...rest }) {
  const [show, setShow] = useState(false);
  return (
    <div className="pw">
      <input {...rest} type={show ? 'text' : 'password'} value={value} onChange={onChange} placeholder={placeholder} autoComplete={autoComplete} />
      <button type="button" className="pw-eye" onClick={() => setShow((s) => !s)} aria-label={show ? 'Hide password' : 'Show password'}>
        <Icon name={show ? 'eyeOff' : 'eye'} size={18} />
      </button>
    </div>
  );
}

export const Pill = ({ tone = 'lav', children, className = '' }) => <span className={`pill pill-${tone} ${className}`}>{children}</span>;

export function Progress({ value, tone = 'purple', label }) {
  return (
    <div className="progress" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
      <span className={`fill fill-${tone}`} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}

export const Skeleton = ({ h = 20, w = '100%', r = 12 }) => <div className="skeleton" style={{ height: h, width: w, borderRadius: r }} />;

export function EmptyState({ icon = 'search', title, text, action }) {
  return (
    <div className="empty">
      <div className="empty-icon"><Icon name={icon} size={26} /></div>
      <h3>{title}</h3>
      {text && <p className="muted">{text}</p>}
      {action}
    </div>
  );
}

/** Soft glossy 3D sphere avatar. Shows a photo when available. */
export function Avatar({ name, tint = 'blush', size = 48, photo, float = false, className = '' }) {
  return (
    <span className={`avatar avatar-${tint} ${float ? 'avatar-float' : ''} ${className}`} style={{ width: size, height: size, fontSize: size * 0.36 }}>
      {photo ? <img src={photo} alt="" /> : <span>{initials(name)}</span>}
    </span>
  );
}

/** Card that tilts in 3D toward the pointer (desktop, fine pointers, no reduced motion). */
export function Tilt({ as: Tag = 'div', max = 6, className = '', children, ...rest }) {
  const ref = useRef(null);
  const enabled = useRef(true);
  useEffect(() => {
    enabled.current = window.matchMedia('(hover: hover) and (pointer: fine)').matches && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);
  const move = (e) => {
    if (!enabled.current || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    ref.current.style.setProperty('--ry', `${(px * max * 2).toFixed(2)}deg`);
    ref.current.style.setProperty('--rx', `${(-py * max * 2).toFixed(2)}deg`);
  };
  const leave = () => { ref.current?.style.setProperty('--ry', '0deg'); ref.current?.style.setProperty('--rx', '0deg'); };
  return <Tag ref={ref} className={`tilt ${className}`} onPointerMove={move} onPointerLeave={leave} {...rest}>{children}</Tag>;
}

export function Tabs({ tabs, value, onChange, label }) {
  return (
    <div className="tabs" role="tablist" aria-label={label}>
      {tabs.map((t) => {
        const key = typeof t === 'string' ? t : t.key;
        const text = typeof t === 'string' ? t : t.label;
        return <button key={key} role="tab" aria-selected={value === key} className={`tab ${value === key ? 'active' : ''}`} onClick={() => onChange(key)}>{text}</button>;
      })}
    </div>
  );
}

export function PageHeader({ title, subtitle, children }) {
  return (
    <div className="page-head">
      <div>
        <h1>{title}</h1>
        {subtitle && <p className="muted">{subtitle}</p>}
      </div>
      {children && <div className="page-actions">{children}</div>}
    </div>
  );
}

/** Dropdown menu button (used for filters and row menus). */
export function Menu({ trigger, items, align = 'left', className = '' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const close = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    const esc = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', close); document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('keydown', esc); };
  }, [open]);
  return (
    <div className={`menu ${className}`} ref={ref}>
      {trigger({ open, toggle: () => setOpen((o) => !o) })}
      {open && (
        <div className={`menu-list menu-${align}`} role="menu">
          {items.map((it, i) => (it.divider
            ? <hr key={i} />
            : <button key={it.label} role="menuitem" className={`menu-item ${it.danger ? 'danger' : ''} ${it.active ? 'active' : ''}`} onClick={() => { setOpen(false); it.onClick?.(); }}>
              {it.icon && <Icon name={it.icon} size={16} />}{it.label}{it.active && <Icon name="check" size={14} className="ml-auto" />}
            </button>))}
        </div>
      )}
    </div>
  );
}

export function useDebounced(value, ms = 200) {
  const [v, setV] = useState(value);
  useEffect(() => { const t = setTimeout(() => setV(value), ms); return () => clearTimeout(t); }, [value, ms]);
  return v;
}

export function useReducedMotion() {
  const [r, setR] = useState(() => (typeof window !== 'undefined' && window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false));
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const f = () => setR(mq.matches);
    mq.addEventListener?.('change', f);
    return () => mq.removeEventListener?.('change', f);
  }, []);
  return r;
}

export function download(filename, text, type = 'text/csv') {
  const blob = new Blob([text], { type: `${type};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

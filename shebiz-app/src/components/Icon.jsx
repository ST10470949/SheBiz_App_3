import React from 'react';

const P = {
  home: <><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" /><path d="M10 21v-6h4v6" /></>,
  briefcase: <><rect x="3" y="7" width="18" height="13" rx="2.5" /><path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7" /><path d="M3 13h18" /></>,
  user: <><circle cx="12" cy="8" r="3.5" /><path d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6" /></>,
  users: <><circle cx="9" cy="8" r="3" /><path d="M3 20c0-3 2.7-5 6-5s6 2 6 5" /><path d="M16 5.3a3 3 0 0 1 0 5.4M18 15.2c1.8.7 3 2.2 3 4.8" /></>,
  store: <><path d="M4 9.5 5.5 4h13L20 9.5" /><path d="M4 9.5h16V20.5H4z" /><path d="M9 20.5v-6h6v6" /></>,
  book: <><rect x="3" y="4" width="7.5" height="16" rx="1.5" /><rect x="13.5" y="4" width="7.5" height="16" rx="1.5" /></>,
  sparkle: <path d="M12 2c.5 6 2 9 10 10-8 1-9.500 4-10 10-.5-6-2-9-10-10 8-1 9.500-4 10-10z" />,
  chart: <><path d="M3 20h18" /><path d="M4 16l5-5 3.500 3.500L20 7" /><path d="M15 7h5v5" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
  bag: <><path d="M6 8h12l-1 12H7L6 8z" /><path d="M9 8V6.500a3 3 0 0 1 6 0V8" /></>,
  search: <><circle cx="11" cy="11" r="6.500" /><path d="m20 20-4.200-4.200" /></>,
  bell: <><path d="M6 9a6 6 0 0 1 12 0c0 6 2.500 7.500 2.500 7.500h-17S6 15 6 9z" /><path d="M10 20a2 2 0 0 0 4 0" /></>,
  check: <path d="m5 12.500 4.500 4.500L19 7.500" />,
  checkCircle: <><circle cx="12" cy="12" r="9" /><path d="m8 12.500 3 3 5-6" /></>,
  x: <path d="M6 6l12 12M18 6 6 18" />,
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  arrowLeft: <path d="M19 12H5M11 6l-6 6 6 6" />,
  eye: <><path d="M2 12s3.500-7 10-7 10 7 10 7-3.500 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></>,
  eyeOff: <><path d="M3 3l18 18" /><path d="M10.600 6.100A9.800 9.800 0 0 1 12 6c6.500 0 10 6 10 6a17 17 0 0 1-3.200 3.900M6.500 7.600C3.800 9.300 2 12 2 12s3.500 7 10 7c1.600 0 3-.4 4.200-1" /><path d="M9.900 10a3 3 0 0 0 4.100 4.100" /></>,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  bookmark: <path d="M6.500 3.500h11v17L12 16.500l-5.500 4z" />,
  upload: <><path d="M12 16V4M7 9l5-5 5 5" /><path d="M4 20h16" /></>,
  download: <><path d="M12 4v12M7 11l5 5 5-5" /><path d="M4 20h16" /></>,
  trash: <><path d="M4 7h16M10 7V4h4v3M6 7l1 13h10l1-13" /><path d="M10 11v5M14 11v5" /></>,
  edit: <><path d="M4 20h4L19 9l-4-4L4 16v4z" /><path d="m13.500 6.500 4 4" /></>,
  more: <><circle cx="5" cy="12" r="1.300" /><circle cx="12" cy="12" r="1.300" /><circle cx="19" cy="12" r="1.300" /></>,
  copy: <><rect x="8" y="8" width="12" height="12" rx="2.500" /><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" /></>,
  thumbUp: <><path d="M7 11v9H4v-9h3zM7 11l4-7c1.500 0 2.500 1 2.500 2.500V9h5a2 2 0 0 1 2 2.300l-1 6.500a2 2 0 0 1-2 1.700H7" /></>,
  thumbDown: <><path d="M17 13V4h3v9h-3zM17 13l-4 7c-1.500 0-2.500-1-2.500-2.500V15h-5a2 2 0 0 1-2-2.300l1-6.500A2 2 0 0 1 6.500 4.500H17" /></>,
  refresh: <><path d="M20 11a8 8 0 0 0-14.500-4M4 5v3.500h3.500" /><path d="M4 13a8 8 0 0 0 14.500 4M20 19v-3.500h-3.500" /></>,
  phone: <path d="M5 4h4l2 5-2.500 1.500a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />,
  calendar: <><rect x="3.500" y="5" width="17" height="15" rx="2.500" /><path d="M3.500 10h17M8 3v4M16 3v4" /></>,
  message: <path d="M4 5h16v11H9l-5 4V5z" />,
  video: <><rect x="3" y="6" width="13" height="12" rx="2.500" /><path d="m16 10 5-3v10l-5-3" /></>,
  lock: <><rect x="5" y="11" width="14" height="9" rx="2.500" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></>,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2.500" /><path d="m3.500 7 8.500 6 8.500-6" /></>,
  star: <path d="m12 3.500 2.600 5.400 5.900.8-4.300 4.100 1 5.800-5.200-2.800-5.200 2.800 1-5.800-4.300-4.100 5.900-.8z" />,
  logout: <><path d="M9 4H5v16h4" /><path d="M16 8l4 4-4 4M20 12H9" /></>,
  help: <><circle cx="12" cy="12" r="9" /><path d="M9.500 9.500a2.500 2.500 0 1 1 3.500 2.300c-.7.300-1 .9-1 1.700M12 17v.1" /></>,
  settings: <><path d="M4 7h10M18 7h2M4 17h2M10 17h10" /><circle cx="16" cy="7" r="2" /><circle cx="8" cy="17" r="2" /></>,
  chevronDown: <path d="m6 9 6 6 6-6" />,
  chevronRight: <path d="m9 6 6 6-6 6" />,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  mapPin: <><path d="M12 21s7-6 7-11a7 7 0 0 0-14 0c0 5 7 11 7 11z" /><circle cx="12" cy="10" r="2.500" /></>,
  award: <><circle cx="12" cy="9" r="5.500" /><path d="m8.500 14 -1.500 7 5-3 5 3-1.500-7" /></>,
  alert: <><path d="M12 4 2.500 20h19L12 4z" /><path d="M12 10v4M12 17v.1" /></>,
  wifiOff: <><path d="M3 3l18 18" /><path d="M5 12.500a10 10 0 0 1 4-2.300M16 10.500a10 10 0 0 1 3 2M8.500 16a5 5 0 0 1 5-1.200" /><path d="M12 19.500v.1" /></>,
  image: <><rect x="3.500" y="4.500" width="17" height="15" rx="2.500" /><circle cx="9" cy="10" r="1.500" /><path d="m4 18 5-4.500 3.500 3 3-2.500L20 17" /></>,
  file: <><path d="M6 3h8l4 4v14H6z" /><path d="M14 3v4h4" /></>,
  globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" /></>,
};

export default function Icon({ name, size = 20, stroke = 1.8, className = '', style }) {
  return (
    <svg
      className={`icon ${className}`} style={style} width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"
    >
      {P[name] || P.sparkle}
    </svg>
  );
}

export function Logo({ size = 34, light = false, text = true }) {
  return (
    <span className="logo">
      <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true" className="logo-mark">
        <defs><linearGradient id="lg1" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#7138C8" /><stop offset="1" stopColor="#E84A9B" /></linearGradient></defs>
        <rect x="2" y="2" width="36" height="36" rx="11" fill="url(#lg1)" />
        <path d="M26 13.5c-1.4-1.3-3.3-2-5.4-2-3.2 0-5.4 1.6-5.4 4.1 0 6 11 2.6 11 8.6 0 2.5-2.4 4.3-5.8 4.3-2.4 0-4.6-.9-6.1-2.4" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" />
      </svg>
      {text && <span className="logo-text" style={{ color: light ? '#fff' : 'var(--ink)' }}>SheBiz</span>}
    </span>
  );
}

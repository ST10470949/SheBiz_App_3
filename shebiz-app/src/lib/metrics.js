// Pure business logic for SheBiz. No React, no Firebase, so it is easy to test.

export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const MONTHS_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export const rand = (n) => `R${Math.round(Number(n) || 0).toLocaleString('en-ZA').replace(/\s| /g, ',')}`;
export const pad2 = (n) => String(n).padStart(2, '0');
export const clamp = (n, a = 0, b = 100) => Math.max(a, Math.min(b, n));

/** % change = (current - previous) / previous x 100. Returns null when there is no previous value. */
export function pctChange(cur, prev) {
  if (!prev) return null;
  return Math.round(((cur - prev) / prev) * 100);
}
export const fmtPct = (p) => (p === null || p === undefined ? '-' : `${p > 0 ? '+' : ''}${p}%`);

/** Stock status rule: 0 = Out of stock, 1-2 = Low stock, 3+ = Available */
export function stockStatus(stock) {
  const s = Number(stock) || 0;
  if (s <= 0) return { key: 'out', label: 'Out of stock', color: 'red' };
  if (s <= 2) return { key: 'low', label: 'Low stock', color: 'gold' };
  return { key: 'ok', label: 'Available', color: 'green' };
}

export const monthStart = (y, m) => new Date(y, m, 1);
export const monthOf = (date) => { const d = new Date(date); return { y: d.getFullYear(), m: d.getMonth() }; };
export const inMonth = (date, y, m) => { const d = new Date(date); return d.getFullYear() === y && d.getMonth() === m; };
export const sameDay = (a, b) => { const x = new Date(a); const y = new Date(b); return x.getFullYear() === y.getFullYear() && x.getMonth() === y.getMonth() && x.getDate() === y.getDate(); };

/** The last n calendar months ending at `end` ({y,m}), oldest first. */
export function lastMonths(n, end) {
  const out = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(end.y, end.m - i, 1);
    out.push({ y: d.getFullYear(), m: d.getMonth(), label: MONTHS[d.getMonth()] });
  }
  return out;
}

const sum = (arr, f) => arr.reduce((a, x) => a + (Number(f(x)) || 0), 0);

export const salesIn = (sales, y, m) => sum(sales.filter((s) => inMonth(s.createdAt, y, m)), (s) => s.total);
export const expensesIn = (expenses, y, m) => sum(expenses.filter((e) => inMonth(e.date || e.createdAt, y, m)), (e) => e.amount);

export function monthlySeries(sales, expenses, months) {
  return months.map((mo) => {
    const s = salesIn(sales, mo.y, mo.m);
    const e = expensesIn(expenses, mo.y, mo.m);
    return { ...mo, sales: s, expenses: e, profit: s - e };
  });
}

export function previousMonth({ y, m }) {
  const d = new Date(y, m - 1, 1);
  return { y: d.getFullYear(), m: d.getMonth() };
}

/** Everything the business dashboard and analytics need for one month. */
export function businessKpis({ sales, expenses, products, customers }, month, now = new Date()) {
  const prev = previousMonth(month);
  const monthSales = salesIn(sales, month.y, month.m);
  const prevSales = salesIn(sales, prev.y, prev.m);
  const monthExpenses = expensesIn(expenses, month.y, month.m);
  const prevExpenses = expensesIn(expenses, prev.y, prev.m);
  const profit = monthSales - monthExpenses;
  const prevProfit = prevSales - prevExpenses;
  const yesterday = new Date(now); yesterday.setDate(now.getDate() - 1);
  const todaySales = sum(sales.filter((s) => sameDay(s.createdAt, now)), (s) => s.total);
  const yesterdaySales = sum(sales.filter((s) => sameDay(s.createdAt, yesterday)), (s) => s.total);
  return {
    todaySales, yesterdaySales, todayChange: pctChange(todaySales, yesterdaySales),
    monthSales, prevSales, salesChange: pctChange(monthSales, prevSales),
    monthExpenses, prevExpenses, expensesChange: pctChange(monthExpenses, prevExpenses),
    profit, prevProfit, profitChange: pctChange(profit, prevProfit),
    margin: monthSales > 0 ? Math.round((profit / monthSales) * 100) : 0,
    productCount: products.length,
    customerCount: customers.length,
    lowStock: products.filter((p) => (Number(p.stock) || 0) <= 2).length,
  };
}

/** Profit split donut: profit %, ingredients %, packaging & other % of sales. */
export function profitSplit(expenses, month, monthSales) {
  const list = expenses.filter((e) => inMonth(e.date || e.createdAt, month.y, month.m));
  const ingredients = sum(list.filter((e) => e.category === 'Ingredients'), (e) => e.amount);
  const other = sum(list.filter((e) => e.category !== 'Ingredients'), (e) => e.amount);
  const total = sum(list, (e) => e.amount);
  const profit = Math.max(0, monthSales - total);
  const base = Math.max(monthSales, total) || 1;
  return [
    { key: 'profit', label: 'Profit', value: profit, pct: Math.round((profit / base) * 100) },
    { key: 'ingredients', label: 'Ingredients', value: ingredients, pct: Math.round((ingredients / base) * 100) },
    { key: 'other', label: 'Packaging & other', value: other, pct: Math.round((other / base) * 100) },
  ];
}

/** Best sellers by units sold across the given months (custom orders are excluded). */
export function bestSellers(sales, months, limit = 3) {
  const map = new Map();
  for (const s of sales) {
    if (!s.productId) continue;
    if (!months.some((mo) => inMonth(s.createdAt, mo.y, mo.m))) continue;
    const cur = map.get(s.productName) || { name: s.productName, productId: s.productId, units: 0, revenue: 0 };
    cur.units += Number(s.quantity) || 0;
    cur.revenue += Number(s.total) || 0;
    map.set(s.productName, cur);
  }
  return [...map.values()].sort((a, b) => b.units - a.units).slice(0, limit);
}

// ---------- Opportunities ----------
const GROUPS = {
  tech: ['html', 'css', 'javascript', 'java', 'react', 'c#', 'asp.net', 'sql', 'python', 'git', 'cloud computing', 'kotlin', 'flutter', 'apis', 'data pipelines', 'figma'],
  business: ['marketing', 'communication', 'growth', 'teamwork', 'leadership', 'planning', 'brand', 'digital', 'content', 'social media', 'sales', 'pitching', 'funding', 'operations', 'pricing', 'creativity', 'problem solving', 'baking', 'copywriting'],
  finance: ['accounting', 'finance', 'budgeting', 'excel', 'tax', 'attention to detail', 'credit', 'risk'],
};
const groupOf = (skill) => Object.keys(GROUPS).find((g) => GROUPS[g].includes(String(skill).toLowerCase()));

/** Maps opportunity categories to the profile interests that count as a category match. */
const CATEGORY_KEYWORDS = {
  Technology: ['software', 'tech', 'it', 'developer', 'data', 'web', 'cloud'],
  Design: ['design', 'ux', 'creative'],
  Business: ['business', 'entrepreneur', 'management', 'startup'],
  Finance: ['finance', 'accounting', 'banking'],
  Marketing: ['marketing', 'brand', 'social', 'content'],
  Leadership: ['leadership', 'management'],
};

/**
 * Match % = 50 x skill coverage + 30 (category matches an interest) + 20 x location fit.
 * Skill coverage per required skill: exact skill = 1, related skill (same group) = 0.45, otherwise 0.
 * Location fit: same city/province or nationwide = 1, remote = 0.75, other South African city = 0.45.
 */
export function matchScore(opp, profile) {
  const userSkills = (profile?.skills || []).map((s) => String(s.name).toLowerCase());
  const userGroups = new Set(userSkills.map(groupOf).filter(Boolean));
  const req = opp.skills || [];
  let coverage = 0;
  for (const r of req) {
    const k = String(r).toLowerCase();
    if (userSkills.includes(k)) coverage += 1;
    else if (groupOf(k) && userGroups.has(groupOf(k))) coverage += 0.45;
  }
  coverage = req.length ? coverage / req.length : 0;

  const interests = [...(profile?.careerInterests || []), ...(profile?.interests || [])].map((s) => s.toLowerCase());
  const keys = CATEGORY_KEYWORDS[opp.category] || [opp.category.toLowerCase()];
  const catMatch = interests.some((i) => keys.some((k) => i.includes(k)));

  const loc = String(profile?.location || '').toLowerCase().trim();
  const oloc = String(opp.location || '').toLowerCase();
  let locFit = 0.45;
  if (/south africa/.test(oloc)) locFit = 1;
  else if (/remote/.test(oloc)) locFit = 0.75;
  else if (loc && (oloc.includes(loc) || (loc.includes('gqeberha') && oloc.includes('eastern cape')) || (loc.includes('east london') && oloc.includes('eastern cape')))) locFit = 1;

  return Math.round(50 * coverage + (catMatch ? 30 : 0) + 20 * locFit);
}

export function daysLeft(opp, now = new Date()) {
  const end = new Date(`${opp.closingDate}T23:59:59`);
  return Math.ceil((end - now) / 86400000);
}

// ---------- Profile / learning / setup ----------
export function profileCompletion(profile) {
  const checks = [
    !!profile?.fullName, !!profile?.photoURL, !!profile?.location, !!profile?.phone,
    (profile?.careerInterests || []).length > 0, (profile?.skills || []).length > 0,
    (profile?.education || []).length > 0, (profile?.achievements || []).length > 0,
  ];
  const labels = ['Add your full name', 'Add a profile photo', 'Add your location', 'Add a phone number', 'Add career interests', 'Add a skill', 'Add your education', 'Add an achievement'];
  const done = checks.filter(Boolean).length;
  const firstMissing = checks.findIndex((c) => !c);
  return { pct: Math.round((done / checks.length) * 100), missing: firstMissing >= 0 ? labels[firstMissing] : null, missingIndex: firstMissing };
}

/** Learning progress = completed lessons / total lessons across all courses. */
export function learningProgress(courses, progress) {
  const total = sum(courses, (c) => c.lessons.length);
  const done = sum(courses, (c) => (progress.find((p) => p.courseId === c.id)?.completedLessons || []).filter((id) => c.lessons.some((l) => l.id === id)).length);
  return total ? Math.round((done / total) * 100) : 0;
}

export const courseProgressPct = (course, progress) => {
  const done = (progress.find((p) => p.courseId === course.id)?.completedLessons || []).filter((id) => course.lessons.some((l) => l.id === id)).length;
  return course.lessons.length ? Math.round((done / course.lessons.length) * 100) : 0;
};

/** Skills progress = average level of the user's skills. */
export const skillsProgress = (profile) => {
  const s = profile?.skills || [];
  return s.length ? Math.round(sum(s, (x) => x.level) / s.length) : 0;
};

export function businessSetup(profile, { products, sales, expenses }) {
  const b = profile?.business || {};
  const steps = [
    { key: 'name', label: 'Name your business', done: !!b.name },
    { key: 'location', label: 'Add your business location', done: !!b.location },
    { key: 'products', label: 'Add at least 3 products', done: products.length >= 3 },
    { key: 'sale', label: 'Record your first sale', done: sales.length >= 1 },
    { key: 'expense', label: 'Record your first expense', done: expenses.length >= 1 },
    { key: 'description', label: 'Write a short business description', done: !!b.description },
    { key: 'logo', label: 'Upload a business logo', done: !!b.logoURL },
    { key: 'phone', label: 'Add a business phone number', done: !!b.phone },
    { key: 'social', label: 'Add a social media or website link', done: !!b.social },
    { key: 'cipc', label: 'Mark your business as registered (CIPC)', done: !!b.cipc },
    { key: 'goal', label: 'Set a monthly sales goal', done: Number(b.goal) > 0 },
  ];
  const done = steps.filter((s) => s.done).length;
  return { steps, pct: Math.round((done / steps.length) * 100) };
}

export const greeting = (now = new Date()) => {
  const h = now.getHours();
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
};

export const initials = (name = '') => {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return 'SB';
  return ((parts[0][0] || '') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
};

export const validEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v).trim());
/** South African phone: +27 or 0 followed by 9 digits (spaces allowed). */
export const validPhone = (v) => /^(\+27|0)[1-9]\d{8}$/.test(String(v).replace(/[\s-]/g, ''));
export function passwordChecks(pw) {
  return {
    length: pw.length >= 8, upper: /[A-Z]/.test(pw), lower: /[a-z]/.test(pw), number: /\d/.test(pw),
  };
}
export const passwordScore = (pw) => Object.values(passwordChecks(pw)).filter(Boolean).length + (pw.length >= 12 ? 1 : 0);

export function toCSV(rows, columns) {
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  return [columns.map((c) => esc(c.label)).join(','), ...rows.map((r) => columns.map((c) => esc(c.get(r))).join(','))].join('\n');
}

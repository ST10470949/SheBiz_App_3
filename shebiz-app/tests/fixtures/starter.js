// Builds the starter data every new account receives: the bakery business, 24 products,
// six months of sales/expense history and 56 customers. Everything is relative to "now"
// so the dashboard always shows the current month.
// Users can wipe it from Settings > "Clear demo business data".

import { addDays } from './seed.js';

const PRODUCTS = [
  ['Chocolate Cake', 'Custom celebration cake', 350, 5],
  ['Cupcakes', 'Box of 12', 180, 2],
  ['Vanilla Cake', 'Classic vanilla sponge', 300, 0],
  ['Wedding Cake', 'Three-tier custom cake', 1800, 3],
  ['Red Velvet Cake', 'Cream cheese frosting', 380, 6],
  ['Carrot Cake', 'Walnuts and cream cheese icing', 320, 8],
  ['Lemon Drizzle Loaf', 'Zesty tea-time loaf', 150, 10],
  ['Banana Bread', 'Moist loaf with pecans', 120, 12],
  ['Brownies', 'Box of 9', 140, 9],
  ['Blueberry Muffins', 'Pack of 6', 110, 14],
  ['Scones', 'Box of 6 with jam', 95, 15],
  ['Cheesecake', 'Baked vanilla cheesecake', 360, 4],
  ['Koeksisters', 'Pack of 12', 130, 11],
  ['Vetkoek', 'Pack of 4 with mince', 90, 7],
  ['Melktert', 'Traditional milk tart', 180, 5],
  ['Rusks', '500g buttermilk rusks', 85, 20],
  ['Cookies', 'Box of 12', 100, 16],
  ['Birthday Cake', 'Decorated 2-layer cake', 420, 6],
  ['Party Box', '24 mini cupcakes', 340, 5],
  ['Gluten-free Loaf', 'Seeded gluten-free loaf', 160, 4],
  ['Almond Croissants', 'Pack of 4', 120, 9],
  ['Cinnamon Rolls', 'Pack of 6', 130, 8],
  ['Name Cookies', 'Custom iced cookies', 220, 6],
  ['Tea Loaf', 'Fruit tea loaf', 110, 10],
];

const FIRST = ['Nomsa', 'Lwazi', 'Ayanda', 'Zinhle', 'Sipho', 'Thabo', 'Lindiwe', 'Busi', 'Mandla', 'Kamva', 'Anele', 'Nandi', 'Siya', 'Yolanda'];
const LAST = ['Dlamini', 'Nkosi', 'Mbeki', 'Jacobs', 'Ndlovu', 'Pillay', 'Sithole', 'Botha'];
const TINTS = ['blush', 'cream', 'lav'];

const SALES_TARGET = [7300, 9600, 8500, 11000, 10550, 12450];
const EXP_TARGET = [3800, 4600, 4100, 4800, 5400, 5200];
const CUPCAKES = [16, 19, 17, 22, 22, 24];
const CHOC = [6, 8, 7, 8, 7, 9];
const VANILLA = [4, 5, 5, 6, 6, 6];

const ymd = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const at = (d, h = 12) => { const x = new Date(d); x.setHours(h, 0, 0, 0); return x.toISOString(); };

function nextFriday10(now) {
  const d = new Date(now);
  d.setHours(10, 0, 0, 0);
  const add = (5 - d.getDay() + 7) % 7;
  d.setDate(d.getDate() + add);
  if (d <= now) d.setDate(d.getDate() + 7);
  return d.toISOString();
}

export function buildStarter({ demo = false, now = new Date() } = {}) {
  const base = now.getTime();
  const products = PRODUCTS.map((p, i) => ({
    id: `prod-${String(i + 1).padStart(2, '0')}`,
    name: p[0], description: p[1], price: p[2], stock: p[3], imageURL: '', tint: TINTS[i % 3],
    createdAt: new Date(base - (PRODUCTS.length - i) * 1000).toISOString(),
  }));
  const byName = Object.fromEntries(products.map((p) => [p.name, p]));

  const sales = [];
  const expenses = [];
  let n = 0;
  for (let k = 5; k >= 0; k--) {
    const idx = 5 - k;
    const first = new Date(now.getFullYear(), now.getMonth() - k, 1);
    const isCurrent = k === 0;
    const dayCap = isCurrent ? now.getDate() : 28;
    const dateOn = (day) => { const d = new Date(first); d.setDate(Math.max(1, Math.min(day, dayCap))); return d; };
    const lines = [
      [byName['Cupcakes'], CUPCAKES[idx], 10], [byName['Chocolate Cake'], CHOC[idx], 14], [byName['Vanilla Cake'], VANILLA[idx], 20],
    ];
    let productTotal = 0;
    for (const [p, qty, day] of lines) {
      const total = qty * p.price;
      productTotal += total;
      sales.push({ id: `sale-${String(++n).padStart(3, '0')}`, productId: p.id, productName: p.name, quantity: qty, unitPrice: p.price, total, customerName: '', createdAt: at(dateOn(day)) });
    }
    let rest = SALES_TARGET[idx] - productTotal;
    const custom = (amount, d) => {
      if (amount <= 0) return;
      sales.push({ id: `sale-${String(++n).padStart(3, '0')}`, productId: null, productName: 'Custom orders', quantity: 1, unitPrice: amount, total: amount, customerName: '', createdAt: at(d, 15) });
    };
    if (isCurrent) {
      custom(850, now); rest -= 850; // today's sales
      if (now.getDate() > 1) { custom(760, addDays(-1, now)); rest -= 760; } // yesterday
      custom(rest, dateOn(1));
    } else {
      const a = Math.round((rest * 0.6) / 10) * 10;
      custom(a, dateOn(8)); custom(rest - a, dateOn(22));
    }

    const E = EXP_TARGET[idx];
    let ing; let others;
    if (isCurrent) { ing = 4200; others = [450, 250, 200, 100]; }
    else {
      ing = Math.round((E * 0.8) / 10) * 10;
      const r = E - ing;
      const a = Math.round((r * 0.4) / 10) * 10; const b = Math.round((r * 0.25) / 10) * 10; const c = Math.round((r * 0.25) / 10) * 10;
      others = [a, b, c, r - a - b - c];
    }
    const cats = ['Ingredients', 'Packaging', 'Transport', 'Utilities', 'Marketing'];
    [ing, ...others].forEach((amount, i) => {
      expenses.push({ id: `exp-${String(idx + 1)}-${i + 1}`, category: cats[i], amount, date: ymd(dateOn([3, 5, 8, 10, 12][i])), note: '', createdAt: at(dateOn([3, 5, 8, 10, 12][i]), 9) });
    });
  }

  const customers = Array.from({ length: 56 }, (_, i) => ({
    id: `cust-${String(i + 1).padStart(2, '0')}`,
    name: `${FIRST[i % 14]} ${LAST[(Math.floor(i / 14) * 2 + (i % 14)) % 8]}`,
    phone: `+27 7${(i % 8) + 1} ${String(100 + ((i * 37) % 900))} ${String(1000 + ((i * 731) % 9000))}`,
    totalSpent: 200 + ((i * 137) % 1800),
    createdAt: new Date(base - (56 - i) * 1000).toISOString(),
  }));

  const stamp = new Date(base).toISOString();
  const notifications = [
    { id: 'n1', title: 'Welcome to SheBiz', body: 'Complete your profile to get better opportunity matches.', read: false, createdAt: stamp },
    { id: 'n2', title: 'Low stock: Cupcakes', body: 'Only 2 boxes left. Restock before your next order.', read: false, createdAt: stamp },
    { id: 'n3', title: 'New opportunity matched', body: 'Junior Web Developer Internship at ABC Technologies.', read: false, createdAt: stamp },
  ];

  const out = { products, sales, expenses, customers, notifications, mentorships: [], messages: [], courseProgress: [] };

  if (demo) {
    out.mentorships.push({ id: 'mship-1', mentorId: 'mentor-01', mentorName: 'Sarah M.', status: 'Connected', goal: 'Career development', nextCheckIn: nextFriday10(now), createdAt: stamp });
    out.messages.push(
      { id: 'msg-1', mentorId: 'mentor-01', senderId: 'mentor', text: 'Hi Thandi! Great to connect. What would you like to focus on first?', createdAt: new Date(base - 3600e3 * 26).toISOString() },
      { id: 'msg-2', mentorId: 'mentor-01', senderId: 'me', text: 'Hi Sarah, I would like help preparing for my first developer interview.', createdAt: new Date(base - 3600e3 * 25).toISOString() },
    );
    out.notifications.push({ id: 'n4', title: 'Mentor check-in confirmed', body: 'Sarah M. confirmed your next check-in.', read: false, createdAt: stamp });
    out.courseProgress = [
      { id: 'web-development-basics', courseId: 'web-development-basics', completedLessons: [1, 2, 3, 4, 5].map((i) => `web-development-basics-${i}`) },
      { id: 'digital-marketing', courseId: 'digital-marketing', completedLessons: [1, 2, 3, 4].map((i) => `digital-marketing-${i}`) },
      { id: 'bookkeeping-accounting', courseId: 'bookkeeping-accounting', completedLessons: [1, 2, 3].map((i) => `bookkeeping-accounting-${i}`) },
      { id: 'business-plan-writing', courseId: 'business-plan-writing', completedLessons: ['business-plan-writing-1'] },
    ];
  }
  return out;
}

export const defaultBusiness = (location = '') => ({
  name: "Abo's Bakery", location, description: '', phone: '', social: '', cipc: false, goal: 0, logoURL: '',
});

export const COLLECTIONS = ['products', 'sales', 'expenses', 'customers', 'notifications', 'mentorships', 'messages', 'courseProgress', 'applications', 'saved', 'aiChats'];

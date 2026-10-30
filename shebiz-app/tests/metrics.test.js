import test from 'node:test';
import assert from 'node:assert/strict';
import { buildStarter } from './fixtures/starter.js';
import { buildOpportunities, DEMO_USER } from './fixtures/seed.js';
import {
  businessKpis, monthlySeries, lastMonths, bestSellers, profitSplit, matchScore, stockStatus,
  businessSetup, profileCompletion, pctChange, validPhone, validEmail, passwordChecks, rand,
} from '../src/lib/metrics.js';
import { defaultBusiness } from './fixtures/starter.js';

const now = new Date(2026, 8, 23, 11, 0, 0); // 23 Sep 2026
const s = buildStarter({ demo: true, now });
const month = { y: 2026, m: 8 };
const months = lastMonths(6, month);

test('starter data matches the design numbers', () => {
  const k = businessKpis(s, month, now);
  assert.equal(k.monthSales, 12450);
  assert.equal(k.monthExpenses, 5200);
  assert.equal(k.profit, 7250);
  assert.equal(k.todaySales, 850);
  assert.equal(k.productCount, 24);
  assert.equal(k.customerCount, 56);
  assert.equal(k.lowStock, 2);
  assert.equal(k.margin, 58);
  assert.equal(k.salesChange, 18);
  assert.equal(k.expensesChange, -4);
  assert.equal(k.todayChange, 12);
});

test('monthly series equals the targets', () => {
  const series = monthlySeries(s.sales, s.expenses, months);
  assert.deepEqual(series.map((x) => x.sales), [7300, 9600, 8500, 11000, 10550, 12450]);
  assert.deepEqual(series.map((x) => x.expenses), [3800, 4600, 4100, 4800, 5400, 5200]);
});

test('best sellers and profit split', () => {
  const best = bestSellers(s.sales, months);
  assert.deepEqual(best.map((b) => [b.name, b.units]), [['Cupcakes', 120], ['Chocolate Cake', 45], ['Vanilla Cake', 32]]);
  const split = profitSplit(s.expenses, month, 12450);
  assert.deepEqual(split.map((x) => x.pct), [58, 34, 8]);
});

test('stock status rule', () => {
  assert.equal(stockStatus(0).label, 'Out of stock');
  assert.equal(stockStatus(1).label, 'Low stock');
  assert.equal(stockStatus(2).label, 'Low stock');
  assert.equal(stockStatus(3).label, 'Available');
});

test('business setup is 45% for the starter business', () => {
  const profile = { ...DEMO_USER.profile, business: defaultBusiness('Gqeberha') };
  assert.equal(businessSetup(profile, s).pct, 45);
});

test('profile completion and match score', () => {
  assert.ok(profileCompletion(DEMO_USER.profile).pct >= 80);
  const opps = buildOpportunities(now);
  const m = matchScore(opps[0], DEMO_USER.profile);
  assert.ok(m >= 80 && m <= 100, `match ${m}`);
  const none = matchScore(opps[0], { skills: [], careerInterests: [], location: '' });
  assert.ok(none < 30);
});

test('helpers', () => {
  assert.equal(pctChange(110, 100), 10);
  assert.equal(pctChange(5, 0), null);
  assert.equal(rand(12450), 'R12,450');
  assert.ok(validPhone('+27 71 234 5678') && validPhone('0712345678') && !validPhone('12345'));
  assert.ok(validEmail('a@b.co') && !validEmail('nope'));
  assert.deepEqual(passwordChecks('Abcdef12'), { length: true, upper: true, lower: true, number: true });
});

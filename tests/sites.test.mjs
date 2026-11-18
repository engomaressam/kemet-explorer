// Data checks for the site catalogue (src/data/sites.js).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CATEGORIES, PERIODS, SITES, getSite, groupByPeriod, periodOf, photoThumb, relatedSites, siteOfTheDay } from '../src/data/sites.js';

test('every site has the fields the screens use', () => {
  for (const s of SITES) {
    for (const field of ['id', 'name', 'city', 'region', 'category', 'era', 'summary', 'wiki']) {
      assert.equal(typeof s[field], 'string', `${s.id}.${field}`);
      assert.ok(s[field].length > 0, `${s.id}.${field} is empty`);
    }
    assert.ok(Number.isFinite(s.year), `${s.id}.year`);
    assert.equal(s.highlights.length, 3, `${s.id} should have three highlights`);
  }
});

test('site ids are unique and work as URL segments', () => {
  const ids = SITES.map((s) => s.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const id of ids) assert.match(id, /^[a-z0-9-]+$/);
});

test('every category is one of the filter chips, and every chip has sites', () => {
  for (const s of SITES) assert.ok(CATEGORIES.includes(s.category), `${s.id}: ${s.category}`);
  for (const c of CATEGORIES.filter((c) => c !== 'All')) assert.ok(SITES.some((s) => s.category === c), `no site in ${c}`);
});

test('coordinates fall inside Egypt', () => {
  for (const s of SITES) {
    assert.ok(s.lat > 22 && s.lat < 31.7, `${s.id} latitude ${s.lat}`);
    assert.ok(s.lon > 24.7 && s.lon < 36.9, `${s.id} longitude ${s.lon}`);
  }
});

test('own photos are Wikimedia Commons thumbnails with a smaller list version', () => {
  for (const s of SITES.filter((s) => s.photo)) {
    assert.match(s.photo, /^https:\/\/upload\.wikimedia\.org\/wikipedia\/commons\/thumb\/.+\/960px-/, s.id);
    assert.match(photoThumb(s.photo), /\/330px-/);
  }
});

test('getSite and relatedSites', () => {
  assert.equal(getSite('karnak').name, 'Karnak Temple Complex');
  assert.equal(getSite('nowhere'), undefined);
  const related = relatedSites(getSite('karnak'));
  assert.ok(related.length > 0 && related.length <= 4);
  assert.ok(related.every((s) => s.region === 'Luxor' && s.id !== 'karnak'));
});

test('site of the day is stable for a date and changes the next day', () => {
  const day = new Date('2026-11-18T08:00:00Z');
  assert.equal(siteOfTheDay(day).id, siteOfTheDay(new Date('2026-11-18T20:00:00Z')).id);
  assert.notEqual(siteOfTheDay(day).id, siteOfTheDay(new Date('2026-11-19T08:00:00Z')).id);
});

test('periods: boundaries and grouping', () => {
  assert.equal(periodOf(-2670).id, 'old');
  assert.equal(periodOf(-2000).id, 'middle');
  assert.equal(periodOf(-1539).id, 'new');
  assert.equal(periodOf(-380).id, 'late');
  assert.equal(periodOf(-237).id, 'ptolemaic');
  assert.equal(periodOf(100).id, 'roman');
  assert.equal(periodOf(2025).id, 'modern');

  const groups = groupByPeriod(SITES);
  assert.equal(groups.reduce((n, g) => n + g.sites.length, 0), SITES.length);
  const order = PERIODS.map((p) => p.id);
  const seen = groups.map((g) => order.indexOf(g.period.id));
  assert.deepEqual(seen, [...seen].sort((a, b) => a - b));
  for (const g of groups) {
    const years = g.sites.map((s) => s.year);
    assert.deepEqual(years, [...years].sort((a, b) => a - b));
  }
});

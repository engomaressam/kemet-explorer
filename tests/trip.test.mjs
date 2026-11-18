// Tests for the trip planner (src/lib/trip.js).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SITES, getSite } from '../src/data/sites.js';
import { googleMapsRouteUrl, haversineKm, legInfo, planDays, planRoute, routeLengthKm, summariseTrip } from '../src/lib/trip.js';

const sites = (...ids) => ids.map(getSite);

test('haversine distance matches known values', () => {
  assert.equal(haversineKm({ lat: 0, lon: 0 }, { lat: 0, lon: 0 }), 0);
  // One degree of latitude is about 111 km.
  assert.ok(Math.abs(haversineKm({ lat: 25, lon: 32 }, { lat: 26, lon: 32 }) - 111.2) < 0.5);
  // Giza to Abu Simbel is about 850 km in a straight line.
  const d = haversineKm(getSite('giza-pyramids'), getSite('abu-simbel'));
  assert.ok(d > 830 && d < 870, `got ${d}`);
});

test('a route visits every stop once and starts in the north', () => {
  const stops = sites('abu-simbel', 'karnak', 'great-sphinx', 'philae', 'hatshepsut', 'edfu');
  const route = planRoute(stops);
  assert.equal(route.length, stops.length);
  assert.deepEqual(new Set(route.map((s) => s.id)), new Set(stops.map((s) => s.id)));
  assert.equal(route[0].id, 'great-sphinx');
  assert.equal(route[route.length - 1].id, 'abu-simbel');
});

test('2-opt never makes the route longer than simply sorting by latitude', () => {
  const route = planRoute(SITES);
  const byLatitude = [...SITES].sort((a, b) => b.lat - a.lat);
  assert.ok(routeLengthKm(route) <= routeLengthKm(byLatitude) + 1e-6);
});

test('small trips', () => {
  assert.deepEqual(planRoute([]), []);
  assert.deepEqual(planRoute(sites('karnak')).map((s) => s.id), ['karnak']);
  assert.deepEqual(planRoute(sites('philae', 'karnak')).map((s) => s.id), ['karnak', 'philae']);
  const empty = summariseTrip([]);
  assert.equal(empty.totalKm, 0);
  assert.deepEqual(empty.days, []);
});

test('days: at most three stops, and a new day after a long transfer', () => {
  const route = planRoute(sites('great-sphinx', 'giza-pyramids', 'djoser', 'red-pyramid', 'karnak', 'luxor-temple'));
  const days = planDays(route);
  assert.ok(days.every((d) => d.stops.length <= 3));
  const luxorDay = days.find((d) => d.stops.some((s) => s.id === 'karnak'));
  assert.ok(luxorDay.travelKmBefore >= 150);
  assert.ok(luxorDay.stops.every((s) => s.region === 'Luxor'));
  assert.deepEqual(
    days.map((d) => d.day),
    days.map((_, i) => i + 1),
  );
});

test('leg labels', () => {
  assert.equal(legInfo(1).label, 'A short walk');
  assert.equal(legInfo(3).label, 'A few minutes by car');
  assert.match(legInfo(20).label, /^About \d+ min by road$/);
  assert.match(legInfo(100).label, /^About [\d.]+ h by road$/);
  assert.equal(legInfo(100).long, false);
  assert.equal(legInfo(500).long, true);
});

test('Google Maps link lists the stops in order', () => {
  const url = googleMapsRouteUrl(sites('karnak', 'philae'));
  assert.equal(url, 'https://www.google.com/maps/dir/25.7188,32.6573/24.0255,32.8844');
});

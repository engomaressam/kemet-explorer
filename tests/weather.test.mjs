// Tests for the weather helpers used with the Open-Meteo data.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { describeWeather, formatTemperature, visitTip } from '../src/lib/weather.js';

test('WMO codes map to labels and icons', () => {
  assert.deepEqual(describeWeather(0, 1), { label: 'Clear sky', icon: 'sunny' });
  assert.deepEqual(describeWeather(0, 0), { label: 'Clear sky', icon: 'moon' });
  assert.equal(describeWeather(63).label, 'Rain');
  assert.equal(describeWeather(95).label, 'Thunderstorm');
  assert.equal(describeWeather(-1).label, 'Unknown');
});

test('temperatures in Celsius and Fahrenheit', () => {
  assert.equal(formatTemperature(25), '25°C');
  assert.equal(formatTemperature(25, 'F'), '77°F');
  assert.equal(formatTemperature(null), '--');
  assert.equal(formatTemperature(Number.NaN), '--');
});

test('visiting tips', () => {
  assert.match(visitTip({ temperature: 40, windSpeed: 10 }), /^Very hot/);
  assert.match(visitTip({ temperature: 33, windSpeed: 10 }), /^Hot/);
  assert.match(visitTip({ temperature: 24, windSpeed: 10 }), /^Pleasant/);
  assert.match(visitTip({ temperature: 12, windSpeed: 10 }), /^Cool/);
  assert.match(visitTip({ temperature: 24, windSpeed: 40 }), /^Windy/);
});

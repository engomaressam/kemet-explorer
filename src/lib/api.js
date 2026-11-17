// External API integration for Kemet Explorer.
//
// Two free, key-less public APIs are used:
//   1. Open-Meteo (https://open-meteo.com): current weather at every site, in one
//      GET request that takes a comma-separated list of coordinates.
//   2. Wikipedia REST API (https://en.wikipedia.org/api/rest_v1/): a summary and a
//      photo for each site.
// Responses are cached in local storage (src/lib/storage.js) so the app still shows
// the last data when it is offline, and so it does not call the APIs on every render.

import { Platform } from 'react-native';
import { KEYS, getJSON, setJSON } from './storage';

const OPEN_METEO_URL = 'https://api.open-meteo.com/v1/forecast';
const WIKI_SUMMARY_URL = 'https://en.wikipedia.org/api/rest_v1/page/summary/';
const WEATHER_MAX_AGE_MS = 15 * 60 * 1000; // refresh weather every 15 minutes
const WIKI_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // summaries change rarely

// fetch() with a timeout, so a slow network never leaves a spinner forever.
async function fetchWithTimeout(url, options = {}, timeoutMs = 12000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

// ----------------------------------------------------------------------------- weather (Open-Meteo)

// WMO weather codes used by Open-Meteo, mapped to a label and an Ionicons icon.
export function describeWeather(code, isDay = 1) {
  if (code === 0) return { label: 'Clear sky', icon: isDay ? 'sunny' : 'moon' };
  if (code === 1) return { label: 'Mainly clear', icon: isDay ? 'sunny' : 'moon' };
  if (code === 2) return { label: 'Partly cloudy', icon: isDay ? 'partly-sunny' : 'cloudy-night' };
  if (code === 3) return { label: 'Overcast', icon: 'cloudy' };
  if (code === 45 || code === 48) return { label: 'Fog', icon: 'cloud' };
  if (code >= 51 && code <= 57) return { label: 'Drizzle', icon: 'rainy' };
  if (code >= 61 && code <= 67) return { label: 'Rain', icon: 'rainy' };
  if (code >= 71 && code <= 77) return { label: 'Snow', icon: 'snow' };
  if (code >= 80 && code <= 82) return { label: 'Rain showers', icon: 'rainy' };
  if (code >= 95) return { label: 'Thunderstorm', icon: 'thunderstorm' };
  return { label: 'Unknown', icon: 'help-circle' };
}

// A practical visiting tip derived from the live conditions.
export function visitTip({ temperature, windSpeed }) {
  if (windSpeed >= 35) return 'Windy: expect blowing sand, protect cameras and eyes.';
  if (temperature >= 38) return 'Very hot: go at opening time and carry plenty of water.';
  if (temperature >= 32) return 'Hot: plan outdoor time before 10:00 or after 16:00.';
  if (temperature >= 18) return 'Pleasant conditions for exploring today.';
  return 'Cool: bring a light jacket for the early morning.';
}

export function formatTemperature(celsius, unit = 'C') {
  if (celsius === null || celsius === undefined || Number.isNaN(celsius)) return '--';
  const value = unit === 'F' ? celsius * 1.8 + 32 : celsius;
  return `${Math.round(value)}°${unit}`;
}

function parseWeather(entry) {
  const c = entry.current || {};
  const d = entry.daily || {};
  return {
    temperature: c.temperature_2m,
    feelsLike: c.apparent_temperature,
    humidity: c.relative_humidity_2m,
    windSpeed: c.wind_speed_10m,
    code: c.weather_code,
    isDay: c.is_day,
    time: c.time,
    max: d.temperature_2m_max ? d.temperature_2m_max[0] : null,
    min: d.temperature_2m_min ? d.temperature_2m_min[0] : null,
    sunrise: d.sunrise ? d.sunrise[0] : null,
    sunset: d.sunset ? d.sunset[0] : null,
  };
}

// GET the current weather for a list of sites in a single request.
// Returns { bySite: { [siteId]: weather }, fetchedAt, fromCache }.
export async function fetchWeatherForSites(sites, { force = false } = {}) {
  const cached = await getJSON(KEYS.weatherCache, null);
  const fresh = cached && Date.now() - new Date(cached.fetchedAt).getTime() < WEATHER_MAX_AGE_MS;
  const coversAll = cached && sites.every((s) => cached.bySite && cached.bySite[s.id]);
  if (!force && fresh && coversAll) return { ...cached, fromCache: true };

  const params = new URLSearchParams({
    latitude: sites.map((s) => s.lat).join(','),
    longitude: sites.map((s) => s.lon).join(','),
    current: 'temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m,is_day',
    daily: 'temperature_2m_max,temperature_2m_min,sunrise,sunset',
    forecast_days: '1',
    timezone: 'Africa/Cairo',
  });

  try {
    const response = await fetchWithTimeout(`${OPEN_METEO_URL}?${params.toString()}`);
    if (!response.ok) throw new Error(`Open-Meteo answered ${response.status}`);
    const json = await response.json();
    // One location returns an object; several locations return an array.
    const entries = Array.isArray(json) ? json : [json];
    const bySite = { ...(cached ? cached.bySite : {}) };
    entries.forEach((entry, index) => {
      bySite[sites[index].id] = parseWeather(entry);
    });
    const result = { bySite, fetchedAt: new Date().toISOString() };
    await setJSON(KEYS.weatherCache, result);
    return { ...result, fromCache: false };
  } catch (error) {
    if (cached) return { ...cached, fromCache: true, error: error.message };
    throw error;
  }
}

// ----------------------------------------------------------------------------- site summaries (Wikipedia)

// GET the Wikipedia summary (text and photo) for one article title.
export async function fetchWikiSummary(title, { force = false } = {}) {
  const cache = await getJSON(KEYS.wikiCache, {});
  const hit = cache[title];
  if (!force && hit && Date.now() - new Date(hit.fetchedAt).getTime() < WIKI_MAX_AGE_MS) return hit.data;

  // Wikimedia asks API clients to identify themselves. Browsers cannot set the
  // User-Agent, so the Api-User-Agent header is used on native platforms only.
  const headers =
    Platform.OS === 'web'
      ? {}
      : { 'Api-User-Agent': 'KemetExplorer/1.0 (https://github.com/engomaressam/kemet-explorer)' };

  const response = await fetchWithTimeout(WIKI_SUMMARY_URL + encodeURIComponent(title), { headers });
  if (!response.ok) throw new Error(`Wikipedia answered ${response.status}`);
  const json = await response.json();
  const data = {
    title: json.title,
    description: json.description || '',
    extract: json.extract || '',
    thumbnail: json.thumbnail ? json.thumbnail.source : null,
    image: json.originalimage ? json.originalimage.source : json.thumbnail ? json.thumbnail.source : null,
    url: json.content_urls && json.content_urls.mobile ? json.content_urls.mobile.page : null,
  };
  const latest = await getJSON(KEYS.wikiCache, {});
  latest[title] = { data, fetchedAt: new Date().toISOString() };
  await setJSON(KEYS.wikiCache, latest);
  return data;
}

// Photos for the home screen cards: summaries for every site, fetched in parallel.
export async function fetchSitePhotos(sites) {
  const results = await Promise.allSettled(sites.map((s) => fetchWikiSummary(s.wiki)));
  const photos = {};
  results.forEach((r, i) => {
    if (r.status === 'fulfilled' && r.value.thumbnail) photos[sites[i].id] = r.value.thumbnail;
  });
  return photos;
}

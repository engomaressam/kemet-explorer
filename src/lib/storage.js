// Local storage layer for Kemet Explorer.
//
// Every piece of persistent data goes through this file. It uses AsyncStorage
// from @react-native-async-storage/async-storage, which writes to the device's
// key-value store on iOS and Android and to the browser's localStorage on the web.
// Data is saved as JSON under readable keys so it can be inspected
// (Settings > Privacy & data, or the browser's developer tools).

import AsyncStorage from '@react-native-async-storage/async-storage';

// ----------------------------------------------------------------------------- keys
export const KEYS = {
  users: 'kemet:users', // registered accounts (password stored as a salted SHA-256 hash)
  session: 'kemet:session', // who is logged in, so the login survives an app restart
  favorites: (userId) => `kemet:favorites:${userId}`, // favourite site ids
  visited: (userId) => `kemet:visited:${userId}`, // sites the user marked as visited
  settings: (userId) => `kemet:settings:${userId}`, // theme, units and other preferences
  notifications: (userId) => `kemet:notifications:${userId}`, // notification history
  activity: (userId) => `kemet:activity:${userId}`, // recent user actions
  weatherAlerts: (userId) => `kemet:weather-alerts:${userId}`, // heat alerts already sent today
  wikiCache: 'kemet:cache:wiki', // cached Wikipedia summaries (API responses)
  weatherCache: 'kemet:cache:weather', // last Open-Meteo response
};

// ----------------------------------------------------------------------------- generic JSON helpers
export async function getJSON(key, fallback = null) {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    console.warn(`[storage] could not read ${key}`, error);
    return fallback;
  }
}

export async function setJSON(key, value) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.warn(`[storage] could not write ${key}`, error);
    return false;
  }
}

export async function removeKey(key) {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.warn(`[storage] could not remove ${key}`, error);
  }
}

// ----------------------------------------------------------------------------- users and session
export const getUsers = () => getJSON(KEYS.users, []);
export const saveUsers = (users) => setJSON(KEYS.users, users);

export async function getSession() {
  return getJSON(KEYS.session, null);
}

export async function saveSession(user) {
  return setJSON(KEYS.session, { userId: user.id, email: user.email, loggedInAt: new Date().toISOString() });
}

export const clearSession = () => removeKey(KEYS.session);

// ----------------------------------------------------------------------------- favourites and visited sites
export const getFavorites = (userId) => getJSON(KEYS.favorites(userId), []);

export async function toggleFavorite(userId, siteId) {
  const current = await getFavorites(userId);
  const next = current.includes(siteId) ? current.filter((id) => id !== siteId) : [...current, siteId];
  await setJSON(KEYS.favorites(userId), next);
  await logActivity(userId, next.includes(siteId) ? 'favorite-added' : 'favorite-removed', siteId);
  return next;
}

export const getVisited = (userId) => getJSON(KEYS.visited(userId), []);

export async function toggleVisited(userId, siteId) {
  const current = await getVisited(userId);
  const next = current.includes(siteId) ? current.filter((id) => id !== siteId) : [...current, siteId];
  await setJSON(KEYS.visited(userId), next);
  await logActivity(userId, next.includes(siteId) ? 'visited-marked' : 'visited-unmarked', siteId);
  return next;
}

// ----------------------------------------------------------------------------- user preferences
export const DEFAULT_SETTINGS = {
  darkMode: false,
  temperatureUnit: 'C', // 'C' or 'F'
  textSize: 'medium', // small | medium | large
  defaultCategory: 'All',
  sortBy: 'name', // name | region | era
  showPhotos: true,
  notifications: {
    enabled: false,
    dailyReminder: true,
    reminderTime: '09:00',
    weatherAlerts: true,
    promotions: false,
  },
};

export async function getSettings(userId) {
  const saved = await getJSON(KEYS.settings(userId), {});
  // Merge with defaults so new settings get a value for existing users.
  return {
    ...DEFAULT_SETTINGS,
    ...saved,
    notifications: { ...DEFAULT_SETTINGS.notifications, ...(saved.notifications || {}) },
  };
}

export const saveSettings = (userId, settings) => setJSON(KEYS.settings(userId), settings);

// ----------------------------------------------------------------------------- notification history and activity log
export const getNotificationHistory = (userId) => getJSON(KEYS.notifications(userId), []);

export async function addNotificationToHistory(userId, entry) {
  const history = await getNotificationHistory(userId);
  const next = [entry, ...history].slice(0, 30);
  await setJSON(KEYS.notifications(userId), next);
  return next;
}

export async function logActivity(userId, action, detail) {
  if (!userId) return;
  const log = await getJSON(KEYS.activity(userId), []);
  const next = [{ action, detail, at: new Date().toISOString() }, ...log].slice(0, 50);
  await setJSON(KEYS.activity(userId), next);
}

// ----------------------------------------------------------------------------- inspection (Privacy & data screen)
export async function getAllStoredData() {
  const keys = (await AsyncStorage.getAllKeys()).filter((k) => k.startsWith('kemet:')).sort();
  const pairs = await AsyncStorage.multiGet(keys);
  return pairs.map(([key, value]) => ({ key, value, bytes: value ? value.length : 0 }));
}

export async function clearCaches() {
  await AsyncStorage.multiRemove([KEYS.wikiCache, KEYS.weatherCache]);
}

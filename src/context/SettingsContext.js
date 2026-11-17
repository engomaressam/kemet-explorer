// User preferences (theme, units, home screen options, notifications) and the
// active colour palette. Settings are stored per user in local storage and applied
// immediately across the app.

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';
import { DEFAULT_SETTINGS, getSettings, logActivity, saveSettings } from '../lib/storage';
import { FONT_SCALE, PALETTES } from '../constants/theme';

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const { user } = useAuth();
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  // Load the signed-in user's saved preferences (defaults when signed out).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const next = user ? await getSettings(user.id) : DEFAULT_SETTINGS;
      if (!cancelled) {
        setSettings(next);
        setLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  // Update one or more settings and persist them straight away.
  const updateSettings = useCallback(
    async (patch) => {
      const next = { ...settings, ...patch };
      if (patch.notifications) next.notifications = { ...settings.notifications, ...patch.notifications };
      setSettings(next);
      if (user) {
        await saveSettings(user.id, next);
        await logActivity(user.id, 'settings-changed', Object.keys(patch).join(', '));
      }
      return next;
    },
    [settings, user],
  );

  const resetSettings = useCallback(async () => {
    setSettings(DEFAULT_SETTINGS);
    if (user) await saveSettings(user.id, DEFAULT_SETTINGS);
  }, [user]);

  const colors = settings.darkMode ? PALETTES.dark : PALETTES.light;
  const fontScale = FONT_SCALE[settings.textSize] || 1;

  const value = useMemo(
    () => ({ settings, loaded, updateSettings, resetSettings, colors, fontScale }),
    [settings, loaded, updateSettings, resetSettings, colors, fontScale],
  );
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  return useContext(SettingsContext);
}

// Shortcut for components that only need colours.
export function useTheme() {
  const { colors, fontScale } = useContext(SettingsContext);
  return { colors, fontScale };
}

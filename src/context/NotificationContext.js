// Connects the notification service (src/lib/notifications.js) to the UI:
// keeps the notification history of the signed-in user in local storage,
// shows the in-app banner when a notification arrives, and keeps the daily
// reminder scheduled according to the user's settings.

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from './AuthContext';
import { useSettings } from './SettingsContext';
import { addNotificationToHistory, getNotificationHistory } from '../lib/storage';
import {
  cancelDailyReminder,
  getPermissionStatus,
  initNotifications,
  scheduleDailyReminder,
  subscribeToNotifications,
} from '../lib/notifications';
import { siteOfTheDay } from '../data/sites';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const { settings, loaded } = useSettings();
  const [history, setHistory] = useState([]);
  const [banner, setBanner] = useState(null);
  const [nextDailyAt, setNextDailyAt] = useState(null);
  const userRef = useRef(user);
  userRef.current = user;

  useEffect(() => {
    initNotifications();
  }, []);

  // Load the history of the signed-in user.
  useEffect(() => {
    (async () => setHistory(user ? await getNotificationHistory(user.id) : []))();
  }, [user]);

  // Every delivered notification: show the banner and save it to the history.
  useEffect(
    () =>
      subscribeToNotifications(async (notification) => {
        const entry = { ...notification, receivedAt: new Date().toISOString() };
        setBanner(entry);
        if (userRef.current) setHistory(await addNotificationToHistory(userRef.current.id, entry));
      }),
    [],
  );

  // Keep the daily reminder in line with the settings.
  const { enabled, dailyReminder, reminderTime } = settings.notifications;
  useEffect(() => {
    if (!loaded || !user) return;
    (async () => {
      const permission = await getPermissionStatus();
      if (enabled && dailyReminder && permission === 'granted') {
        const scheduled = await scheduleDailyReminder(reminderTime, siteOfTheDay().name);
        setNextDailyAt(scheduled.nextAt);
      } else {
        await cancelDailyReminder();
        setNextDailyAt(null);
      }
    })();
  }, [loaded, user, enabled, dailyReminder, reminderTime]);

  const dismissBanner = useCallback(() => setBanner(null), []);

  const value = useMemo(
    () => ({ history, banner, dismissBanner, nextDailyAt }),
    [history, banner, dismissBanner, nextDailyAt],
  );
  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotifications() {
  return useContext(NotificationContext);
}

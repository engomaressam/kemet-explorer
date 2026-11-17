// Notifications for Kemet Explorer.
//
// On iOS and Android, notifications are scheduled with expo-notifications, so they
// are delivered by the operating system even when the app is closed.
// On the web, expo-notifications cannot schedule local notifications, so a timer
// fires them while the app is open and the browser's Notification API shows them.
// In both cases the app also shows an in-app banner when a notification arrives
// while it is in the foreground, and records it in the notification history.

import { Platform } from 'react-native';

const isWeb = Platform.OS === 'web';
// expo-notifications is only loaded on iOS and Android; on the web its push-token
// module has nothing to do and only logs a warning.
const Notifications = isWeb ? null : require('expo-notifications');
const CHANNEL_ID = 'reminders';

// ----------------------------------------------------------------------------- in-app event bus
const listeners = new Set();

// Components subscribe here to show the in-app banner and record the history.
export function subscribeToNotifications(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function emit(notification) {
  listeners.forEach((listener) => listener(notification));
}

// ----------------------------------------------------------------------------- setup
let initialised = false;

export async function initNotifications() {
  if (initialised || isWeb) {
    initialised = true;
    return;
  }
  initialised = true;

  // Show notifications as banners even when the app is in the foreground.
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });

  // Android 8+ needs a channel before anything can be shown.
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'Reminders and alerts',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  // Forward OS notifications received in the foreground to the in-app listeners.
  Notifications.addNotificationReceivedListener((event) => {
    const { title, body, data } = event.request.content;
    emit({ id: event.request.identifier, title, body, kind: data ? data.kind : 'general', system: true });
  });
}

// ----------------------------------------------------------------------------- permissions

// Returns 'granted', 'denied', 'undetermined' or 'unsupported'.
export async function getPermissionStatus() {
  if (isWeb) {
    if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
    return Notification.permission === 'default' ? 'undetermined' : Notification.permission;
  }
  const { status } = await Notifications.getPermissionsAsync();
  return status;
}

export async function requestPermission() {
  if (isWeb) {
    if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
    const result = await Notification.requestPermission();
    return result === 'default' ? 'undetermined' : result;
  }
  const { status } = await Notifications.requestPermissionsAsync();
  return status;
}

// ----------------------------------------------------------------------------- web delivery
const webTimers = new Map();

function deliverOnWeb(id, { title, body, kind }) {
  webTimers.delete(id);
  let system = false;
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    try {
      // The browser shows this through the operating system's notification centre.
      new Notification(title, { body, tag: id, icon: '/logo.png' }); // public/logo.png
      system = true;
    } catch (error) {
      console.warn('[notifications] browser notification failed', error);
    }
  }
  emit({ id, title, body, kind, system });
}

// ----------------------------------------------------------------------------- scheduling

// Schedules one notification `seconds` from now. Returns its identifier.
export async function scheduleNotification({ title, body, kind = 'general', seconds = 5 }) {
  if (isWeb) {
    const id = `web-${kind}-${Date.now()}`;
    webTimers.set(id, setTimeout(() => deliverOnWeb(id, { title, body, kind }), seconds * 1000));
    return id;
  }
  return Notifications.scheduleNotificationAsync({
    content: { title, body, data: { kind } },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: Math.max(1, seconds),
      channelId: CHANNEL_ID,
    },
  });
}

// A test notification, used by Settings > Notifications to check the setup works.
export function sendTestNotification(seconds = 5) {
  return scheduleNotification({
    title: 'Kemet Explorer test notification',
    body: 'Notifications are working. You will get your daily discovery reminder at the time you chose.',
    kind: 'test',
    seconds,
  });
}

let dailyReminderId = null;

// Schedules the daily discovery reminder at "HH:MM" (24-hour clock).
export async function scheduleDailyReminder(time, siteName) {
  await cancelDailyReminder();
  const [hour, minute] = time.split(':').map((part) => parseInt(part, 10));
  const title = 'Your daily discovery';
  const body = siteName
    ? `Today's site is ${siteName}. Open Kemet Explorer to learn more.`
    : 'A new ancient site is waiting for you in Kemet Explorer.';

  if (isWeb) {
    // While the web app is open, fire at the next occurrence of that time.
    const next = new Date();
    next.setHours(hour, minute, 0, 0);
    if (next <= new Date()) next.setDate(next.getDate() + 1);
    const id = `web-daily-${next.getTime()}`;
    webTimers.set(
      id,
      setTimeout(() => deliverOnWeb(id, { title, body, kind: 'daily' }), next.getTime() - Date.now()),
    );
    dailyReminderId = id;
    return { id, nextAt: next.toISOString() };
  }

  dailyReminderId = await Notifications.scheduleNotificationAsync({
    content: { title, body, data: { kind: 'daily' } },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
      channelId: CHANNEL_ID,
    },
  });
  return { id: dailyReminderId, nextAt: null };
}

export async function cancelDailyReminder() {
  if (!dailyReminderId) return;
  if (isWeb) {
    clearTimeout(webTimers.get(dailyReminderId));
    webTimers.delete(dailyReminderId);
  } else {
    await Notifications.cancelScheduledNotificationAsync(dailyReminderId);
  }
  dailyReminderId = null;
}

// Heat alert for a favourite site, sent from the Live screen after a weather refresh.
export function sendWeatherAlert(siteName, temperatureText) {
  return scheduleNotification({
    title: `Heat alert: ${siteName}`,
    body: `It is ${temperatureText} at ${siteName} right now. Visit early and carry water.`,
    kind: 'weather',
    seconds: 1,
  });
}

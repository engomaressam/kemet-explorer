// Notifications & reminders: set up notifications. The user grants permission,
// turns notifications on, chooses the time of the daily discovery reminder and
// which alerts to receive, and can send a test notification. The settings are
// saved to local storage and the reminder is (re)scheduled by NotificationContext.

import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Redirect } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { useNotifications } from '../../context/NotificationContext';
import {
  AppText,
  Card,
  Chip,
  ErrorBanner,
  OutlineButton,
  PrimaryButton,
  SettingRow,
  SuccessBanner,
} from '../../components/ui';
import { getPermissionStatus, requestPermission, sendTestNotification } from '../../lib/notifications';
import { RADIUS } from '../../constants/theme';

const PRESET_TIMES = ['07:00', '09:00', '12:00', '18:00'];
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const KIND_ICON = { test: 'flask-outline', daily: 'calendar-outline', weather: 'thermometer-outline', general: 'notifications-outline' };

const PERMISSION_LABEL = {
  granted: { text: 'Allowed', icon: 'checkmark-circle', tone: 'success' },
  denied: { text: 'Blocked in system settings', icon: 'close-circle', tone: 'danger' },
  undetermined: { text: 'Not requested yet', icon: 'help-circle', tone: 'muted' },
  unsupported: { text: 'Not supported on this device', icon: 'alert-circle', tone: 'danger' },
};

export default function NotificationSettingsScreen() {
  const { user, ready } = useAuth();
  const { settings, updateSettings, colors } = useSettings();
  const { history, nextDailyAt } = useNotifications();
  const prefs = settings.notifications;

  const [permission, setPermission] = useState('undetermined');
  const [customTime, setCustomTime] = useState(prefs.reminderTime);
  const [message, setMessage] = useState({});

  const refreshPermission = useCallback(async () => setPermission(await getPermissionStatus()), []);
  useEffect(() => {
    refreshPermission();
  }, [refreshPermission]);
  useEffect(() => setCustomTime(prefs.reminderTime), [prefs.reminderTime]);

  if (ready && !user) return <Redirect href="/login" />;

  const setPrefs = (patch) => updateSettings({ notifications: patch });

  // Turning notifications on asks for permission first.
  const toggleEnabled = async (value) => {
    if (value && permission !== 'granted') {
      const result = await requestPermission();
      setPermission(result);
      if (result !== 'granted') {
        setMessage({ error: 'Notifications are blocked. Allow them in your device or browser settings, then try again.' });
        return;
      }
    }
    await setPrefs({ enabled: value });
    setMessage({ ok: value ? 'Notifications turned on.' : 'Notifications turned off.' });
  };

  const chooseTime = async (time) => {
    if (!TIME_RE.test(time)) {
      setMessage({ error: 'Enter the time as HH:MM on a 24-hour clock, for example 08:30.' });
      return;
    }
    await setPrefs({ reminderTime: time });
    setMessage({ ok: `Daily reminder set for ${time}.` });
  };

  const sendTest = async () => {
    if (permission !== 'granted') {
      const result = await requestPermission();
      setPermission(result);
      if (result !== 'granted') {
        setMessage({ error: 'Allow notifications first to receive the test notification.' });
        return;
      }
    }
    await sendTestNotification(5);
    setMessage({ ok: 'Test notification scheduled: it arrives in 5 seconds.' });
  };

  const status = PERMISSION_LABEL[permission] || PERMISSION_LABEL.undetermined;
  const toneColor = status.tone === 'success' ? colors.success : status.tone === 'danger' ? colors.danger : colors.textMuted;

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <ErrorBanner message={message.error} />
      <SuccessBanner message={message.ok} />

      {/* Permission status */}
      <Card style={styles.permission}>
        <Ionicons name={status.icon} size={26} color={toneColor} />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <AppText size={13} muted>
            Notification permission
          </AppText>
          <AppText size={16} weight="700" color={toneColor} testID="notif-permission">
            {status.text}
          </AppText>
        </View>
        {permission !== 'granted' ? (
          <OutlineButton
            title="Allow"
            icon="notifications-outline"
            style={{ minHeight: 38 }}
            onPress={async () => setPermission(await requestPermission())}
          />
        ) : null}
      </Card>

      {/* Main switches */}
      <AppText size={13} weight="700" muted style={styles.group}>
        NOTIFICATIONS
      </AppText>
      <Card style={styles.card}>
        <SettingRow
          icon="notifications-outline"
          title="Enable notifications"
          description="Master switch for every reminder and alert"
          switchValue={prefs.enabled}
          onSwitch={toggleEnabled}
          testID="notif-enabled"
        />
        <SettingRow
          icon="calendar-outline"
          title="Daily discovery reminder"
          description="A new site to explore every day"
          switchValue={prefs.dailyReminder}
          onSwitch={(v) => setPrefs({ dailyReminder: v })}
        />
        <SettingRow
          icon="thermometer-outline"
          title="Heat alerts for favourite sites"
          description="When a saved site reaches 38°C"
          switchValue={prefs.weatherAlerts}
          onSwitch={(v) => setPrefs({ weatherAlerts: v })}
        />
        <SettingRow
          icon="megaphone-outline"
          title="News and feature tips"
          description="Optional promotional messages"
          switchValue={prefs.promotions}
          onSwitch={(v) => setPrefs({ promotions: v })}
        />
      </Card>

      {/* Reminder time */}
      <AppText size={13} weight="700" muted style={styles.group}>
        REMINDER TIME
      </AppText>
      <Card>
        <View style={styles.chips}>
          {PRESET_TIMES.map((t) => (
            <Chip key={t} label={t} icon="time-outline" selected={prefs.reminderTime === t} onPress={() => chooseTime(t)} />
          ))}
        </View>
        <View style={styles.customRow}>
          <TextInput
            value={customTime}
            onChangeText={setCustomTime}
            placeholder="HH:MM"
            placeholderTextColor={colors.textMuted}
            style={[styles.timeInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.cardAlt }]}
            maxLength={5}
          />
          <OutlineButton title="Set time" style={{ minHeight: 44, marginLeft: 10 }} onPress={() => chooseTime(customTime.trim())} />
        </View>
        <AppText size={12.5} muted style={{ marginTop: 10 }}>
          {prefs.enabled && prefs.dailyReminder && permission === 'granted'
            ? `Scheduled every day at ${prefs.reminderTime}${
                nextDailyAt ? ` (next: ${new Date(nextDailyAt).toLocaleString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' })})` : ''
              }.`
            : 'Turn on notifications and the daily reminder to schedule it.'}
        </AppText>
      </Card>

      {/* Test notification */}
      <PrimaryButton title="Send test notification" icon="paper-plane-outline" onPress={sendTest} style={{ marginTop: 18 }} testID="notif-test" />

      {/* History saved in local storage */}
      <AppText size={13} weight="700" muted style={styles.group}>
        RECENT NOTIFICATIONS
      </AppText>
      <Card style={styles.card}>
        {history.length === 0 ? (
          <AppText muted style={{ paddingVertical: 12 }}>
            No notifications yet.
          </AppText>
        ) : (
          history.slice(0, 5).map((h) => (
            <View key={`${h.id}-${h.receivedAt}`} style={[styles.historyRow, { borderBottomColor: colors.border }]}>
              <View style={[styles.historyIcon, { backgroundColor: colors.cardAlt }]}>
                <Ionicons name={KIND_ICON[h.kind] || KIND_ICON.general} size={16} color={colors.primary} />
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <AppText size={14} weight="600" numberOfLines={1}>
                  {h.title}
                </AppText>
                <AppText size={12} muted>
                  {new Date(h.receivedAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  {h.system ? ' · delivered by the system' : ''}
                </AppText>
              </View>
            </View>
          ))
        )}
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 40, maxWidth: 720, width: '100%', alignSelf: 'center' },
  permission: { flexDirection: 'row', alignItems: 'center' },
  group: { marginTop: 18, marginBottom: 8, marginLeft: 4, letterSpacing: 1 },
  card: { paddingVertical: 4 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  customRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  timeInput: { flex: 1, borderWidth: 1, borderRadius: RADIUS.md, paddingHorizontal: 12, minHeight: 44, fontSize: 15 },
  historyRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  historyIcon: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
});

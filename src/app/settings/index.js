// Settings menu: opened from the settings icon in the header of every main screen.
// It greets the user and groups the options (account, preferences, notifications,
// privacy and data, about) with icons, and ends with the logout action, which
// clears the saved session and returns to the login screen.

import React, { useEffect, useState } from 'react';
import Constants from 'expo-constants';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { AppText, Card, SettingRow } from '../../components/ui';
import { getPermissionStatus } from '../../lib/notifications';

export default function SettingsMenuScreen() {
  const router = useRouter();
  const { user, ready, logOut } = useAuth();
  const { settings, colors } = useSettings();
  const [permission, setPermission] = useState('undetermined');

  useEffect(() => {
    getPermissionStatus().then(setPermission);
  }, []);

  if (ready && !user) return <Redirect href="/login" />;
  if (!user) return null;

  const initials = user.username.slice(0, 2).toUpperCase();
  const memberSince = new Date(user.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  const n = settings.notifications;
  const notificationSummary = !n.enabled
    ? 'Off'
    : `On${n.dailyReminder ? `, daily reminder at ${n.reminderTime}` : ''}${permission !== 'granted' ? ' (permission needed)' : ''}`;

  const handleLogout = async () => {
    await logOut();
    router.replace('/login');
  };

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      {/* Personalised header */}
      <Card style={[styles.profile, { backgroundColor: colors.primary, borderColor: colors.primary }]}>
        <View style={[styles.avatar, { backgroundColor: colors.accent }]}>
          <AppText size={22} weight="800" color="#fff">
            {initials}
          </AppText>
        </View>
        <View style={{ flex: 1, marginLeft: 14 }}>
          <AppText size={20} weight="800" color="#fff">
            Hello, {user.username}!
          </AppText>
          <AppText size={13} color="#DCE6F2">
            {user.email}
          </AppText>
          <AppText size={12} color="#DCE6F2" style={{ marginTop: 2 }}>
            Member since {memberSince}
          </AppText>
        </View>
      </Card>

      <AppText size={13} weight="700" muted style={styles.group}>
        ACCOUNT
      </AppText>
      <Card style={styles.list}>
        <SettingRow
          icon="person-circle-outline"
          title="Profile & account"
          description="Username, email and password"
          onPress={() => router.push('/settings/account')}
          testID="menu-account"
        />
      </Card>

      <AppText size={13} weight="700" muted style={styles.group}>
        PREFERENCES
      </AppText>
      <Card style={styles.list}>
        <SettingRow
          icon="color-palette-outline"
          title="Appearance & preferences"
          description={`${settings.darkMode ? 'Dark' : 'Light'} theme, °${settings.temperatureUnit}, sorted by ${settings.sortBy}`}
          onPress={() => router.push('/settings/preferences')}
          testID="menu-preferences"
        />
        <SettingRow
          icon="notifications-outline"
          title="Notifications & reminders"
          description={notificationSummary}
          onPress={() => router.push('/settings/notifications')}
          testID="menu-notifications"
        />
      </Card>

      <AppText size={13} weight="700" muted style={styles.group}>
        PRIVACY & SUPPORT
      </AppText>
      <Card style={styles.list}>
        <SettingRow
          icon="server-outline"
          title="Privacy & stored data"
          description="See everything the app saves on this device"
          onPress={() => router.push('/settings/storage')}
          testID="menu-storage"
        />
        <SettingRow
          icon="information-circle-outline"
          title="About Kemet Explorer"
          description={`Version ${Constants.expoConfig?.version ?? '1.1.0'}, data sources and credits`}
          onPress={() => router.push('/settings/about')}
          testID="menu-about"
        />
      </Card>

      <Card style={[styles.list, { marginTop: 18 }]}>
        <SettingRow icon="log-out-outline" title="Log out" danger onPress={handleLogout} testID="menu-logout" />
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 40, maxWidth: 720, width: '100%', alignSelf: 'center' },
  profile: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 58, height: 58, borderRadius: 29, alignItems: 'center', justifyContent: 'center' },
  group: { marginTop: 20, marginBottom: 8, marginLeft: 4, letterSpacing: 1 },
  list: { paddingVertical: 0 },
});

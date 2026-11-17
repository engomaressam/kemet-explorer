// Root layout: wraps the whole app in its providers (authentication, settings,
// notifications) and declares the screens of the root stack. Expo Router turns
// every file in src/app into a route.

import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '../context/AuthContext';
import { SettingsProvider, useSettings } from '../context/SettingsContext';
import { NotificationProvider } from '../context/NotificationContext';
import NotificationBanner from '../components/NotificationBanner';
import { HeaderSettingsButton } from '../components/ui';

function ThemedStack() {
  const { colors, settings } = useSettings();
  return (
    <>
      <StatusBar style={settings.darkMode ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.card },
          headerTintColor: colors.primary,
          headerTitleStyle: { color: colors.text, fontWeight: '700' },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="site/[id]" options={{ title: 'Site details', headerRight: () => <HeaderSettingsButton /> }} />
        <Stack.Screen name="settings/index" options={{ title: 'Settings' }} />
        <Stack.Screen name="settings/preferences" options={{ title: 'Appearance & preferences' }} />
        <Stack.Screen name="settings/account" options={{ title: 'Profile & account' }} />
        <Stack.Screen name="settings/notifications" options={{ title: 'Notifications' }} />
        <Stack.Screen name="settings/storage" options={{ title: 'Privacy & stored data' }} />
        <Stack.Screen name="settings/about" options={{ title: 'About' }} />
      </Stack>
      <NotificationBanner />
    </>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <SettingsProvider>
          <NotificationProvider>
            <ThemedStack />
          </NotificationProvider>
        </SettingsProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

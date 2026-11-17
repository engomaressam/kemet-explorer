// Layout for the signed-out screens (login and sign-up). A signed-in user is
// sent straight to the home screen.

import React from 'react';
import { Redirect, Stack } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/SettingsContext';

export default function AuthLayout() {
  const { user, ready } = useAuth();
  const { colors } = useTheme();
  if (ready && user) return <Redirect href="/home" />;
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }} />;
}

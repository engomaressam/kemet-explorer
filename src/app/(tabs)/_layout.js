// Bottom-tab layout for the signed-in part of the app: Home, Live (external API)
// and Favourites. Every tab shares a header with the app logo on the left and the
// settings icon on the right. Signed-out users are sent to the login screen.

import React from 'react';
import { Platform } from 'react-native';
import { Redirect } from 'expo-router';
import { Tabs } from 'expo-router/js-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/SettingsContext';
import { HeaderLogo, HeaderSettingsButton } from '../../components/ui';

export default function TabsLayout() {
  const { user, ready } = useAuth();
  const { colors } = useTheme();
  if (ready && !user) return <Redirect href="/login" />;

  return (
    <Tabs
      screenOptions={{
        headerTitle: () => <HeaderLogo />,
        headerTitleAlign: 'left',
        headerRight: () => <HeaderSettingsButton />,
        headerStyle: { backgroundColor: colors.card },
        headerShadowVisible: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.tabInactive,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          // On the web there is no safe-area inset, so give the labels room.
          ...(Platform.OS === 'web' ? { height: 72, paddingTop: 6, paddingBottom: 8 } : null),
        },
        tabBarLabelStyle: { fontWeight: '600', fontSize: 12, lineHeight: 16 },
        sceneStyle: { backgroundColor: colors.background },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size, focused }) => <Ionicons name={focused ? 'home' : 'home-outline'} size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="live"
        options={{
          title: 'Live',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'partly-sunny' : 'partly-sunny-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: 'Favourites',
          tabBarIcon: ({ color, size, focused }) => <Ionicons name={focused ? 'heart' : 'heart-outline'} size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}

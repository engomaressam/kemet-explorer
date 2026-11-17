// In-app banner shown at the top of the screen when a notification is delivered
// while the app is open (a test notification, the daily reminder or a heat alert).
// It hides itself after a few seconds or when tapped.

import React, { useEffect, useRef } from 'react';
import { Animated, Image, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNotifications } from '../context/NotificationContext';
import { useTheme } from '../context/SettingsContext';
import { AppText } from './ui';
import { APP_NAME } from '../constants/theme';

const logo = require('../../assets/logo.png');
const VISIBLE_MS = 8000;

export default function NotificationBanner() {
  const { banner, dismissBanner } = useNotifications();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const slide = useRef(new Animated.Value(-160)).current;

  useEffect(() => {
    if (!banner) return undefined;
    Animated.spring(slide, { toValue: 0, useNativeDriver: false }).start();
    const timer = setTimeout(() => {
      Animated.timing(slide, { toValue: -160, duration: 250, useNativeDriver: false }).start(() => dismissBanner());
    }, VISIBLE_MS);
    return () => clearTimeout(timer);
  }, [banner, slide, dismissBanner]);

  if (!banner) return null;
  return (
    <Animated.View
      pointerEvents="box-none"
      style={[styles.wrap, { top: insets.top + 8, transform: [{ translateY: slide }] }]}
      testID="notification-banner"
    >
      <Pressable
        onPress={dismissBanner}
        style={[styles.banner, { backgroundColor: colors.card, borderColor: colors.border, shadowColor: colors.shadow }]}
        accessibilityRole="alert"
      >
        <View style={styles.headerRow}>
          <Image source={logo} style={styles.icon} />
          <AppText size={12} weight="700" muted style={{ flex: 1 }}>
            {APP_NAME.toUpperCase()}
          </AppText>
          <AppText size={12} muted>
            now
          </AppText>
        </View>
        <AppText size={15} weight="700" style={{ marginTop: 6 }}>
          {banner.title}
        </AppText>
        <AppText size={14} style={{ marginTop: 2, lineHeight: 19 }}>
          {banner.body}
        </AppText>
        {banner.system ? (
          <View style={styles.footRow}>
            <Ionicons name="notifications" size={12} color={colors.success} />
            <AppText size={11.5} color={colors.success} style={{ marginLeft: 4 }}>
              Also delivered to the system notification centre
            </AppText>
          </View>
        ) : null}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 10, right: 10, zIndex: 1000 },
  banner: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 8,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  icon: { width: 22, height: 22, borderRadius: 5, marginRight: 8 },
  footRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
});

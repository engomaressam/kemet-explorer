// Card for one ancient site in the home and favourites lists.
// Tapping the card, or its arrow icon, opens the detail screen for that site.

import React from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../context/SettingsContext';
import { AppText } from './ui';
import { RADIUS } from '../constants/theme';

const CATEGORY_ICON = { Pyramids: 'triangle-outline', Temples: 'business-outline', Tombs: 'key-outline' };

export default function SiteCard({ site, photo, isFavorite, onToggleFavorite, visited, showPhoto = true }) {
  const router = useRouter();
  const { colors } = useTheme();
  const openDetail = () => router.push(`/site/${site.id}`);

  return (
    <Pressable
      onPress={openDetail}
      accessibilityRole="button"
      accessibilityLabel={`Open details for ${site.name}`}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.85 : 1 },
      ]}
      testID={`site-card-${site.id}`}
    >
      {/* Thumbnail from the Wikipedia API, or a category icon while it loads */}
      {showPhoto && photo ? (
        <Image source={{ uri: photo }} style={styles.thumb} />
      ) : (
        <View style={[styles.thumb, styles.placeholder, { backgroundColor: colors.accentSoft }]}>
          <Ionicons name={CATEGORY_ICON[site.category] || 'location-outline'} size={28} color={colors.accent} />
        </View>
      )}

      <View style={styles.body}>
        <AppText size={16} weight="700" numberOfLines={1}>
          {site.name}
        </AppText>
        <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={13} color={colors.textMuted} />
          <AppText size={12.5} muted numberOfLines={1} style={{ marginLeft: 3, flex: 1 }}>
            {site.city}
          </AppText>
        </View>
        <View style={styles.metaRow}>
          <View style={[styles.tag, { backgroundColor: colors.cardAlt }]}>
            <AppText size={11.5} weight="600" color={colors.primary}>
              {site.category}
            </AppText>
          </View>
          {visited ? (
            <View style={[styles.tag, { backgroundColor: colors.successSoft, marginLeft: 6 }]}>
              <AppText size={11.5} weight="600" color={colors.success}>
                Visited
              </AppText>
            </View>
          ) : null}
        </View>
      </View>

      <View style={styles.actions}>
        {onToggleFavorite ? (
          <Pressable
            onPress={onToggleFavorite}
            hitSlop={8}
            testID={`site-fav-${site.id}`}
            accessibilityLabel={isFavorite ? 'Remove from favourites' : 'Add to favourites'}
          >
            <Ionicons name={isFavorite ? 'heart' : 'heart-outline'} size={22} color={isFavorite ? colors.danger : colors.textMuted} />
          </Pressable>
        ) : null}
        {/* Navigation icon to the detail screen */}
        <Pressable
          onPress={openDetail}
          hitSlop={8}
          accessibilityLabel={`Go to ${site.name} details`}
          style={[styles.navIcon, { backgroundColor: colors.primary }]}
          testID={`site-nav-${site.id}`}
        >
          <Ionicons name="chevron-forward" size={18} color="#fff" />
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: RADIUS.lg,
    padding: 10,
    marginBottom: 12,
  },
  thumb: { width: 76, height: 76, borderRadius: RADIUS.md },
  placeholder: { alignItems: 'center', justifyContent: 'center' },
  body: { flex: 1, marginLeft: 12 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
  tag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  actions: { alignItems: 'center', justifyContent: 'space-between', height: 76, paddingVertical: 4, marginLeft: 6 },
  navIcon: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
});

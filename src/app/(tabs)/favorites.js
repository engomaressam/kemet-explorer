// Favourites screen: the user's saved sites and visit progress, both read from
// local storage. Removing a favourite here updates storage immediately.

import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { AppText, Card, PrimaryButton, SectionTitle } from '../../components/ui';
import SiteCard from '../../components/SiteCard';
import { SITES } from '../../data/sites';
import { getFavorites, getVisited, toggleFavorite } from '../../lib/storage';
import { fetchSitePhotos } from '../../lib/api';

export default function FavoritesScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { settings, colors } = useSettings();
  const [favorites, setFavorites] = useState([]);
  const [visited, setVisited] = useState([]);
  const [photos, setPhotos] = useState({});

  // Read favourites and visited sites from local storage each time the tab opens.
  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      getFavorites(user.id).then(setFavorites);
      getVisited(user.id).then(setVisited);
      fetchSitePhotos(SITES).then(setPhotos).catch(() => {});
    }, [user]),
  );

  const favoriteSites = SITES.filter((s) => favorites.includes(s.id));
  const progress = Math.round((visited.length / SITES.length) * 100);

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <AppText size={24} weight="800">
        My favourites
      </AppText>
      <AppText muted style={{ marginTop: 4 }}>
        Saved on this device, so they are still here next time you open the app.
      </AppText>

      {/* Visit progress */}
      <Card style={{ marginTop: 16 }}>
        <View style={styles.progressHeader}>
          <Ionicons name="trophy-outline" size={20} color={colors.accent} />
          <AppText size={15} weight="700" style={{ marginLeft: 8, flex: 1 }}>
            Explorer progress
          </AppText>
          <AppText size={15} weight="800" color={colors.primary}>
            {visited.length} / {SITES.length}
          </AppText>
        </View>
        <View style={[styles.track, { backgroundColor: colors.cardAlt }]}>
          <View style={[styles.fill, { width: `${progress}%`, backgroundColor: colors.accent }]} />
        </View>
        <AppText size={12.5} muted style={{ marginTop: 6 }}>
          {visited.length ? `You have visited ${progress}% of the sites in the guide.` : 'Mark a site as visited from its detail screen.'}
        </AppText>
      </Card>

      <SectionTitle>{`Favourite sites (${favoriteSites.length})`}</SectionTitle>
      {favoriteSites.length === 0 ? (
        <Card style={{ alignItems: 'center' }}>
          <Ionicons name="heart-outline" size={36} color={colors.textMuted} />
          <AppText muted style={{ marginVertical: 10, textAlign: 'center' }}>
            No favourites yet. Tap the heart on any site to save it here.
          </AppText>
          <PrimaryButton title="Browse sites" icon="compass-outline" onPress={() => router.push('/home')} />
        </Card>
      ) : (
        favoriteSites.map((site) => (
          <SiteCard
            key={site.id}
            site={site}
            photo={photos[site.id]}
            showPhoto={settings.showPhotos}
            isFavorite
            visited={visited.includes(site.id)}
            onToggleFavorite={async () => setFavorites(await toggleFavorite(user.id, site.id))}
          />
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 32, maxWidth: 720, width: '100%', alignSelf: 'center' },
  progressHeader: { flexDirection: 'row', alignItems: 'center' },
  track: { height: 10, borderRadius: 5, marginTop: 12, overflow: 'hidden' },
  fill: { height: 10, borderRadius: 5 },
});

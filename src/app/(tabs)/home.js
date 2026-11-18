// Home screen: the hub of the app. It greets the user, shows their progress,
// highlights a "site of the day" and lists every site with search and category
// filters, either as a list or as a timeline grouped by historical period. Each
// card leads to the detail screen; the round button picks a random site.

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { AppText, Chip, SectionTitle } from '../../components/ui';
import SiteCard from '../../components/SiteCard';
import { CATEGORIES, SITES, groupByPeriod, siteOfTheDay } from '../../data/sites';
import { getFavorites, getVisited, toggleFavorite } from '../../lib/storage';
import { fetchSitePhotos } from '../../lib/api';
import { RADIUS } from '../../constants/theme';

const SORTERS = {
  name: (a, b) => a.name.localeCompare(b.name),
  region: (a, b) => a.region.localeCompare(b.region) || a.name.localeCompare(b.name),
  era: (a, b) => a.year - b.year,
};

export default function HomeScreen() {
  const router = useRouter();
  const { user, logOut } = useAuth();
  const { settings, colors } = useSettings();
  const [view, setView] = useState('list'); // 'list' or 'timeline'

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState(settings.defaultCategory);
  const [favorites, setFavorites] = useState([]);
  const [visited, setVisited] = useState([]);
  const [photos, setPhotos] = useState({});

  // Reload favourites and visited sites from local storage whenever the tab is shown.
  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      getFavorites(user.id).then(setFavorites);
      getVisited(user.id).then(setVisited);
    }, [user]),
  );

  // Site photos come from the Wikipedia API (cached locally after the first load).
  useEffect(() => {
    fetchSitePhotos(SITES).then(setPhotos).catch(() => {});
  }, []);

  useEffect(() => setCategory(settings.defaultCategory), [settings.defaultCategory]);

  // Filter by category and search text, then sort according to the user's setting.
  const visibleSites = useMemo(() => {
    const q = query.trim().toLowerCase();
    return SITES.filter((s) => category === 'All' || s.category === category)
      .filter((s) => !q || `${s.name} ${s.city} ${s.region}`.toLowerCase().includes(q))
      .sort(SORTERS[settings.sortBy] || SORTERS.name);
  }, [query, category, settings.sortBy]);

  const featured = siteOfTheDay();

  const renderCard = (site) => (
    <SiteCard
      key={site.id}
      site={site}
      photo={photos[site.id]}
      showPhoto={settings.showPhotos}
      isFavorite={favorites.includes(site.id)}
      visited={visited.includes(site.id)}
      onToggleFavorite={() => onToggleFavorite(site.id)}
    />
  );

  // The demo account is for trying the app; this swaps it for a real account.
  const createOwnAccount = async () => {
    await logOut();
    router.replace('/signup');
  };

  const onToggleFavorite = async (siteId) => setFavorites(await toggleFavorite(user.id, siteId));

  const surpriseMe = () => {
    const random = SITES[Math.floor(Math.random() * SITES.length)];
    router.push(`/site/${random.id}`);
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Personalised welcome */}
        <AppText size={24} weight="800">
          Hello, {user ? user.username : 'explorer'}
        </AppText>
        <AppText muted style={{ marginTop: 4 }}>
          Discover the wonders of ancient Egypt, from Giza to Abu Simbel.
        </AppText>

        {user && user.demo ? (
          <View style={[styles.demo, { backgroundColor: colors.accentSoft, borderColor: colors.accent }]} testID="demo-banner">
            <Ionicons name="sparkles-outline" size={18} color={colors.text} />
            <AppText size={13} style={{ flex: 1, marginLeft: 8, lineHeight: 19 }}>
              You are using the demo account, with a few sites already saved. Everything stays in this browser.{' '}
              <AppText size={13} weight="700" color={colors.primary} onPress={createOwnAccount}>
                Create my own account
              </AppText>
            </AppText>
          </View>
        ) : null}

        {/* Progress overview */}
        <View style={styles.statsRow}>
          {[
            { icon: 'map-outline', value: SITES.length, label: 'Sites' },
            { icon: 'heart-outline', value: favorites.length, label: 'Favourites' },
            { icon: 'checkmark-done-outline', value: visited.length, label: 'Visited' },
          ].map((stat) => (
            <View key={stat.label} style={[styles.stat, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Ionicons name={stat.icon} size={18} color={colors.accent} />
              <AppText size={20} weight="800" style={{ marginTop: 4 }}>
                {stat.value}
              </AppText>
              <AppText size={12} muted>
                {stat.label}
              </AppText>
            </View>
          ))}
        </View>

        {/* Search and category filters */}
        <View style={[styles.search, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Ionicons name="search-outline" size={18} color={colors.textMuted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search sites, cities or regions"
            placeholderTextColor={colors.textMuted}
            style={[styles.searchInput, { color: colors.text }]}
            testID="home-search"
          />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }}>
          {CATEGORIES.map((c) => (
            <Chip key={c} label={c} selected={category === c} onPress={() => setCategory(c)} />
          ))}
        </ScrollView>

        {/* Featured site of the day */}
        {category === 'All' && !query ? (
          <>
            <SectionTitle>Site of the day</SectionTitle>
            <Pressable
              onPress={() => router.push(`/site/${featured.id}`)}
              style={[styles.featured, { backgroundColor: colors.primary }]}
              testID="featured-site"
            >
              {settings.showPhotos && photos[featured.id] ? (
                <Image source={{ uri: photos[featured.id] }} style={styles.featuredImage} />
              ) : null}
              <View style={styles.featuredBody}>
                <AppText size={12} weight="700" color={colors.accentSoft}>
                  {featured.era.toUpperCase()}
                </AppText>
                <AppText size={19} weight="800" color="#fff" style={{ marginTop: 4 }}>
                  {featured.name}
                </AppText>
                <AppText size={13} color="#E7EEF7" numberOfLines={2} style={{ marginTop: 4 }}>
                  {featured.summary}
                </AppText>
                <View style={styles.featuredCta}>
                  <AppText size={13} weight="700" color={colors.primary}>
                    Explore
                  </AppText>
                  <Ionicons name="arrow-forward" size={14} color={colors.primary} style={{ marginLeft: 4 }} />
                </View>
              </View>
            </Pressable>
          </>
        ) : null}

        {/* All sites, as a list or as a timeline by period */}
        <SectionTitle
          action={view === 'list' ? 'Timeline view' : 'List view'}
          onAction={() => setView(view === 'list' ? 'timeline' : 'list')}
        >
          {`All sites (${visibleSites.length})`}
        </SectionTitle>
        {visibleSites.length === 0 ? (
          <AppText muted style={{ textAlign: 'center', marginTop: 20 }}>
            No sites match your search. Try another name or category.
          </AppText>
        ) : view === 'list' ? (
          visibleSites.map(renderCard)
        ) : (
          groupByPeriod(visibleSites).map(({ period, sites }) => (
            <View key={period.id} testID={`timeline-${period.id}`}>
              <View style={styles.periodHeader}>
                <View style={[styles.periodDot, { backgroundColor: colors.accent }]} />
                <AppText size={15} weight="800">
                  {period.name}
                </AppText>
                <AppText size={12.5} muted style={{ marginLeft: 8 }}>
                  {period.dates}
                </AppText>
              </View>
              <View style={[styles.periodBody, { borderLeftColor: colors.border }]}>{sites.map(renderCard)}</View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Floating action button: open a random site */}
      <Pressable
        onPress={surpriseMe}
        accessibilityLabel="Open a random site"
        style={[styles.fab, { backgroundColor: colors.accent }]}
        testID="surprise-button"
      >
        <Ionicons name="shuffle" size={26} color="#fff" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 100, maxWidth: 720, width: '100%', alignSelf: 'center' },
  statsRow: { flexDirection: 'row', marginTop: 16, gap: 10 },
  stat: { flex: 1, borderWidth: 1, borderRadius: RADIUS.md, paddingVertical: 12, alignItems: 'center' },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: RADIUS.md,
    paddingHorizontal: 12,
    marginTop: 16,
    minHeight: 46,
  },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 15, paddingVertical: 10, outlineStyle: 'none' },
  demo: { flexDirection: 'row', alignItems: 'flex-start', borderWidth: 1, borderRadius: RADIUS.md, padding: 12, marginTop: 14 },
  periodHeader: { flexDirection: 'row', alignItems: 'center', marginTop: 8, marginBottom: 8 },
  periodDot: { width: 12, height: 12, borderRadius: 6, marginRight: 10 },
  periodBody: { borderLeftWidth: 2, marginLeft: 5, paddingLeft: 14 },
  featured: { borderRadius: RADIUS.lg, overflow: 'hidden' },
  featuredImage: { width: '100%', height: 150 },
  featuredBody: { padding: 16 },
  featuredCta: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderRadius: RADIUS.pill,
    paddingHorizontal: 14,
    paddingVertical: 7,
    marginTop: 12,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
});

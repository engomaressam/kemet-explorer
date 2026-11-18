// Detail screen for one ancient site. The site id comes from the route
// (/site/<id>). It combines local data (era, summary, highlights) with live data
// from two APIs (a Wikipedia summary and photo, Open-Meteo weather), and lets the
// user save the site as a favourite, mark it as visited, add it to the trip
// planner, open directions in Google Maps or share a link to it.

import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Linking, Platform, Pressable, ScrollView, Share, StyleSheet, View } from 'react-native';
import Constants from 'expo-constants';
import { Ionicons } from '@expo/vector-icons';
import { Redirect, Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { AppText, Card, OutlineButton, SectionTitle } from '../../components/ui';
import { getSite, relatedSites } from '../../data/sites';
import { describeWeather, fetchWeatherForSites, fetchWikiSummary, formatTemperature, visitTip } from '../../lib/api';
import { getFavorites, getTrip, getVisited, logActivity, toggleFavorite, toggleTripStop, toggleVisited } from '../../lib/storage';
import { googleMapsPlaceUrl } from '../../lib/trip';
import { RADIUS } from '../../constants/theme';

export default function SiteDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { user, ready } = useAuth();
  const { settings, colors } = useSettings();
  const site = getSite(id);

  const [wiki, setWiki] = useState(null);
  const [wikiError, setWikiError] = useState(false);
  const [weather, setWeather] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isVisited, setIsVisited] = useState(false);
  const [inTrip, setInTrip] = useState(false);
  const [shareNote, setShareNote] = useState(null);

  // Load the user's saved state and the live data for this site.
  useEffect(() => {
    if (!site || !user) return;
    setWiki(null);
    setWeather(null);
    getFavorites(user.id).then((f) => setIsFavorite(f.includes(site.id)));
    getVisited(user.id).then((v) => setIsVisited(v.includes(site.id)));
    getTrip(user.id).then((t) => setInTrip(t.includes(site.id)));
    setShareNote(null);
    logActivity(user.id, 'site-viewed', site.id);
    fetchWikiSummary(site.wiki)
      .then(setWiki)
      .catch(() => setWikiError(true));
    fetchWeatherForSites([site])
      .then((r) => setWeather(r.bySite[site.id]))
      .catch(() => {});
  }, [site, user]);

  if (ready && !user) return <Redirect href="/login" />;
  if (!site) {
    return (
      <View style={styles.center}>
        <AppText>Site not found.</AppText>
      </View>
    );
  }

  const onFavorite = async () => setIsFavorite((await toggleFavorite(user.id, site.id)).includes(site.id));
  const onVisited = async () => setIsVisited((await toggleVisited(user.id, site.id)).includes(site.id));
  const onTrip = async () => setInTrip((await toggleTripStop(user.id, site.id)).includes(site.id));

  // On a phone this opens the system share sheet. In a browser it uses the Web
  // Share API where there is one, and otherwise copies a link to this page.
  const onShare = async () => {
    const text = `${site.name} (${site.city}): ${site.summary}`;
    if (Platform.OS !== 'web') {
      try {
        await Share.share({ message: text, title: site.name });
      } catch (e) {
        // The user closed the share sheet; nothing else to do.
      }
      return;
    }
    const base = Constants.expoConfig?.experiments?.baseUrl || '';
    const url = `${window.location.origin}${base}/site/${site.id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: site.name, text, url });
      } else {
        await navigator.clipboard.writeText(url);
        setShareNote('Link copied to the clipboard.');
      }
    } catch (e) {
      if (e && e.name !== 'AbortError') setShareNote(`Copy this link: ${url}`);
    }
  };

  const conditions = weather ? describeWeather(weather.code, weather.isDay) : null;
  const unit = settings.temperatureUnit;

  return (
    <>
      <Stack.Screen options={{ title: site.name }} />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Photo from the Wikipedia API */}
        {settings.showPhotos && (site.photo || (wiki && wiki.image)) ? (
          <Image source={{ uri: site.photo || wiki.image }} style={styles.hero} accessibilityLabel={`Photo of ${site.name}`} />
        ) : (
          <View style={[styles.hero, styles.heroPlaceholder, { backgroundColor: colors.accentSoft }]}>
            {wiki || wikiError ? (
              <Ionicons name="image-outline" size={40} color={colors.accent} />
            ) : (
              <ActivityIndicator color={colors.accent} />
            )}
          </View>
        )}

        {/* Title and key facts */}
        <AppText size={25} weight="800" style={{ marginTop: 16 }} testID="detail-title">
          {site.name}
        </AppText>
        <View style={styles.row}>
          <Ionicons name="location-outline" size={15} color={colors.textMuted} />
          <AppText muted style={{ marginLeft: 4, flex: 1 }}>
            {site.city} · {site.region}
          </AppText>
          <AppText
            size={14}
            weight="700"
            color={colors.primary}
            onPress={() => Linking.openURL(googleMapsPlaceUrl(site))}
            accessibilityRole="link"
            testID="detail-directions"
          >
            Directions
          </AppText>
        </View>
        <View style={[styles.row, { flexWrap: 'wrap', gap: 8 }]}>
          <View style={[styles.pill, { backgroundColor: colors.cardAlt }]}>
            <AppText size={12} weight="700" color={colors.primary}>
              {site.category}
            </AppText>
          </View>
          <View style={[styles.pill, { backgroundColor: colors.accentSoft }]}>
            <AppText size={12} weight="700" color={colors.text}>
              {site.era}
            </AppText>
          </View>
        </View>

        {/* Actions saved to local storage */}
        <View style={styles.actions}>
          <ActionButton
            icon={isFavorite ? 'heart' : 'heart-outline'}
            label={isFavorite ? 'Favourite' : 'Add to favourites'}
            active={isFavorite}
            activeColor={colors.danger}
            onPress={onFavorite}
            colors={colors}
            testID="detail-favorite"
          />
          <ActionButton
            icon={isVisited ? 'checkmark-circle' : 'checkmark-circle-outline'}
            label={isVisited ? 'Visited' : 'Mark visited'}
            active={isVisited}
            activeColor={colors.success}
            onPress={onVisited}
            colors={colors}
            testID="detail-visited"
          />
          <ActionButton
            icon={inTrip ? 'map' : 'map-outline'}
            label={inTrip ? 'In your trip' : 'Add to trip'}
            active={inTrip}
            activeColor={colors.accent}
            onPress={onTrip}
            colors={colors}
            testID="detail-trip"
          />
          <ActionButton icon="share-social-outline" label="Share" onPress={onShare} colors={colors} testID="detail-share" />
        </View>
        {shareNote ? (
          <AppText size={13} muted style={{ marginTop: 8, textAlign: 'center' }} selectable>
            {shareNote}
          </AppText>
        ) : null}

        {/* Live weather from Open-Meteo */}
        <Card style={{ marginTop: 16 }}>
          <View style={styles.row}>
            <Ionicons name={conditions ? conditions.icon : 'cloud-outline'} size={26} color={colors.accent} />
            <View style={{ marginLeft: 10, flex: 1 }}>
              <AppText size={13} muted>
                Right now at {site.name}
              </AppText>
              <AppText size={17} weight="700">
                {weather ? `${formatTemperature(weather.temperature, unit)}, ${conditions.label}` : 'Loading weather...'}
              </AppText>
            </View>
          </View>
          {weather ? (
            <AppText size={13} style={{ marginTop: 8 }}>
              {visitTip(weather)} Wind {Math.round(weather.windSpeed)} km/h, humidity {weather.humidity}%.
            </AppText>
          ) : null}
        </Card>

        {/* Local information */}
        <SectionTitle>About</SectionTitle>
        <AppText style={{ lineHeight: 22 }}>{site.summary}</AppText>

        <SectionTitle>Highlights</SectionTitle>
        {site.highlights.map((h) => (
          <View key={h} style={[styles.row, { alignItems: 'flex-start', marginTop: 6 }]}>
            <Ionicons name="star" size={14} color={colors.accent} style={{ marginTop: 4 }} />
            <AppText style={{ marginLeft: 8, flex: 1, lineHeight: 21 }}>{h}</AppText>
          </View>
        ))}

        {/* Summary from the Wikipedia API */}
        <SectionTitle>From Wikipedia</SectionTitle>
        {wiki ? (
          <>
            <AppText muted style={{ lineHeight: 21 }} numberOfLines={8}>
              {wiki.extract}
            </AppText>
            {wiki.url ? (
              <AppText
                color={colors.primary}
                weight="700"
                style={{ marginTop: 8 }}
                onPress={() => Linking.openURL(wiki.url)}
              >
                Read the full article
              </AppText>
            ) : null}
          </>
        ) : (
          <AppText muted>{wikiError ? 'The summary could not be loaded right now.' : 'Loading summary...'}</AppText>
        )}

        {/* Related items: other sites in the same region */}
        <SectionTitle>{`More in ${site.region}`}</SectionTitle>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {relatedSites(site).map((r) => (
            <Pressable
              key={r.id}
              onPress={() => router.push(`/site/${r.id}`)}
              style={[styles.related, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <AppText size={14} weight="700" numberOfLines={2}>
                {r.name}
              </AppText>
              <AppText size={12} muted style={{ marginTop: 4 }}>
                {r.category}
              </AppText>
            </Pressable>
          ))}
        </ScrollView>

        <OutlineButton
          title="Back to all sites"
          icon="arrow-back"
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/home'))}
          style={{ marginTop: 24 }}
        />
      </ScrollView>
    </>
  );
}

function ActionButton({ icon, label, onPress, active, activeColor, colors, testID }) {
  const tint = active ? activeColor : colors.primary;
  return (
    <Pressable
      onPress={onPress}
      testID={testID}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.actionButton,
        { borderColor: active ? activeColor : colors.border, backgroundColor: colors.card, opacity: pressed ? 0.7 : 1 },
      ]}
    >
      <Ionicons name={icon} size={20} color={tint} />
      <AppText size={12} weight="600" color={tint} style={{ marginTop: 4, textAlign: 'center' }}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 40, maxWidth: 720, width: '100%', alignSelf: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  hero: { width: '100%', height: 220, borderRadius: RADIUS.lg },
  heroPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  pill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 16 },
  actionButton: { flex: 1, borderWidth: 1.5, borderRadius: RADIUS.md, paddingVertical: 10, alignItems: 'center' },
  related: { width: 150, borderWidth: 1, borderRadius: RADIUS.md, padding: 12, marginRight: 10 },
});

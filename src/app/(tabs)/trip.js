// Trip planner: the user picks the sites they want to see and the app orders them
// into a route along the Nile (src/lib/trip.js), with the distance and a rough
// travel time for every leg, a suggested day-by-day pacing, the live weather at
// each stop and a button that opens the whole route in Google Maps.

import React, { useCallback, useMemo, useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { AppText, Card, Chip, OutlineButton, PrimaryButton, SectionTitle } from '../../components/ui';
import { CATEGORIES, SITES, getSite } from '../../data/sites';
import { getFavorites, getTrip, saveTrip, toggleTripStop } from '../../lib/storage';
import { fetchWeatherForSites, formatTemperature } from '../../lib/api';
import { googleMapsRouteUrl, summariseTrip } from '../../lib/trip';
import { RADIUS } from '../../constants/theme';

export default function TripScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { settings, colors } = useSettings();
  const [tripIds, setTripIds] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [weather, setWeather] = useState({});
  const [addCategory, setAddCategory] = useState('All');

  // Read the saved trip and favourites each time the tab is shown; weather comes
  // from the same 15-minute Open-Meteo cache as the Live tab.
  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      getTrip(user.id).then(setTripIds);
      getFavorites(user.id).then(setFavorites);
      fetchWeatherForSites(SITES)
        .then((r) => setWeather(r.bySite || {}))
        .catch(() => {});
    }, [user]),
  );

  const stops = useMemo(() => tripIds.map(getSite).filter(Boolean), [tripIds]);
  const trip = useMemo(() => summariseTrip(stops), [stops]);
  const dayOfStop = useMemo(() => {
    const map = {};
    trip.days.forEach((d) => d.stops.forEach((s, i) => (map[s.id] = { day: d, first: i === 0 })));
    return map;
  }, [trip]);

  const candidates = SITES.filter((s) => !tripIds.includes(s.id) && (addCategory === 'All' || s.category === addCategory)).sort(
    (a, b) => b.lat - a.lat,
  );
  const favoritesToAdd = favorites.filter((id) => !tripIds.includes(id));

  const toggle = async (siteId) => setTripIds(await toggleTripStop(user.id, siteId));
  const addFavorites = async () => setTripIds(await saveTrip(user.id, [...tripIds, ...favoritesToAdd]));
  const clearTrip = async () => setTripIds(await saveTrip(user.id, []));
  const unit = settings.temperatureUnit;

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <AppText size={24} weight="800">
        Trip planner
      </AppText>
      <AppText muted style={{ marginTop: 4 }}>
        Pick the sites you want to see. The planner orders them into a route along the Nile and suggests how to pace the days.
      </AppText>

      {stops.length === 0 ? (
        <Card style={{ marginTop: 16, alignItems: 'center' }}>
          <Ionicons name="map-outline" size={36} color={colors.accent} />
          <AppText muted style={{ marginVertical: 10, textAlign: 'center', lineHeight: 21 }}>
            Your trip is empty. Add sites from the list below, or from the "Add to trip" button on any site.
          </AppText>
          {favoritesToAdd.length ? (
            <PrimaryButton
              title={`Start from my favourites (${favoritesToAdd.length})`}
              icon="heart-outline"
              onPress={addFavorites}
              testID="trip-from-favorites"
            />
          ) : null}
        </Card>
      ) : (
        <>
          {/* Summary of the planned route */}
          <View style={[styles.summary, { backgroundColor: colors.primary }]} testID="trip-summary">
            <View style={styles.summaryStats}>
              {[
                { value: stops.length, label: stops.length === 1 ? 'stop' : 'stops' },
                { value: trip.days.length, label: trip.days.length === 1 ? 'day' : 'days' },
                { value: trip.totalKm.toLocaleString('en'), label: 'km in all' },
              ].map((s) => (
                <View key={s.label} style={{ alignItems: 'center', flex: 1 }}>
                  <AppText size={22} weight="800" color="#fff">
                    {s.value}
                  </AppText>
                  <AppText size={12} color="#DCE6F2">
                    {s.label}
                  </AppText>
                </View>
              ))}
            </View>
            <Pressable
              onPress={() => Linking.openURL(googleMapsRouteUrl(trip.route))}
              accessibilityRole="link"
              style={({ pressed }) => [styles.mapsButton, { opacity: pressed ? 0.8 : 1 }]}
              testID="trip-open-maps"
            >
              <Ionicons name="navigate-outline" size={16} color={colors.primary} />
              <AppText size={14} weight="700" color={colors.primary} style={{ marginLeft: 6 }}>
                Open the route in Google Maps
              </AppText>
            </Pressable>
          </View>

          {/* The route, day by day */}
          <SectionTitle>Your route</SectionTitle>
          {trip.route.map((site, index) => {
            const { day, first } = dayOfStop[site.id];
            const leg = index ? trip.legs[index - 1] : null;
            const w = weather[site.id];
            return (
              <View key={site.id}>
                {first ? (
                  <View style={styles.dayHeader}>
                    <AppText size={13} weight="800" color={colors.accent} style={{ letterSpacing: 1 }}>
                      {`DAY ${day.day}`}
                    </AppText>
                    <AppText size={13} muted style={{ marginLeft: 8, flex: 1 }} numberOfLines={1}>
                      {day.regions.join(' and ')}
                    </AppText>
                  </View>
                ) : null}
                {leg ? (
                  <View style={styles.leg}>
                    <View style={[styles.legLine, { backgroundColor: leg.long ? colors.accent : colors.border }]} />
                    <Ionicons name={leg.long ? 'train-outline' : 'car-outline'} size={14} color={colors.textMuted} />
                    <AppText size={12.5} muted style={{ marginLeft: 6, flex: 1 }}>
                      {`${Math.round(leg.km)} km: ${leg.label}`}
                    </AppText>
                  </View>
                ) : null}
                <View style={[styles.stop, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <View style={[styles.stopNumber, { backgroundColor: colors.primary }]}>
                    <AppText size={13} weight="800" color="#fff">
                      {index + 1}
                    </AppText>
                  </View>
                  <Pressable style={{ flex: 1, marginLeft: 10 }} onPress={() => router.push(`/site/${site.id}`)} accessibilityRole="link">
                    <AppText size={15} weight="700" numberOfLines={1}>
                      {site.name}
                    </AppText>
                    <AppText size={12.5} muted numberOfLines={1}>
                      {site.city}
                      {w ? ` · ${formatTemperature(w.temperature, unit)} now` : ''}
                    </AppText>
                  </Pressable>
                  <Pressable
                    onPress={() => toggle(site.id)}
                    hitSlop={8}
                    accessibilityLabel={`Remove ${site.name} from the trip`}
                    testID={`trip-remove-${site.id}`}
                  >
                    <Ionicons name="close-circle-outline" size={22} color={colors.textMuted} />
                  </Pressable>
                </View>
              </View>
            );
          })}
          <AppText size={11.5} muted style={{ marginTop: 10, lineHeight: 17 }}>
            Distances are straight lines between the sites; travel times are rough road estimates. Check opening hours and
            transport before you go.
          </AppText>
          <View style={styles.rowButtons}>
            {favoritesToAdd.length ? (
              <OutlineButton title={`Add my favourites (${favoritesToAdd.length})`} icon="heart-outline" onPress={addFavorites} />
            ) : null}
            <OutlineButton title="Clear trip" icon="trash-outline" color={colors.danger} onPress={clearTrip} testID="trip-clear" />
          </View>
        </>
      )}

      {/* Sites that can still be added */}
      <SectionTitle>Add sites</SectionTitle>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
        {CATEGORIES.map((c) => (
          <Chip key={c} label={c} selected={addCategory === c} onPress={() => setAddCategory(c)} />
        ))}
      </ScrollView>
      {candidates.length === 0 ? (
        <AppText muted style={{ marginTop: 8 }}>
          Every site in this category is already in your trip.
        </AppText>
      ) : (
        candidates.map((site) => (
          <Pressable
            key={site.id}
            onPress={() => toggle(site.id)}
            accessibilityRole="button"
            accessibilityLabel={`Add ${site.name} to the trip`}
            style={({ pressed }) => [styles.candidate, { borderBottomColor: colors.border, opacity: pressed ? 0.7 : 1 }]}
            testID={`trip-add-${site.id}`}
          >
            <View style={{ flex: 1 }}>
              <AppText size={15} weight="600" numberOfLines={1}>
                {site.name}
              </AppText>
              <AppText size={12.5} muted numberOfLines={1}>
                {site.city} · {site.region}
              </AppText>
            </View>
            <Ionicons name="add-circle" size={26} color={colors.primary} />
          </Pressable>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 40, maxWidth: 720, width: '100%', alignSelf: 'center' },
  summary: { borderRadius: RADIUS.lg, padding: 16, marginTop: 16 },
  summaryStats: { flexDirection: 'row' },
  mapsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: RADIUS.pill,
    paddingVertical: 10,
    marginTop: 14,
  },
  dayHeader: { flexDirection: 'row', alignItems: 'center', marginTop: 14, marginBottom: 6 },
  leg: { flexDirection: 'row', alignItems: 'center', paddingLeft: 13, paddingVertical: 6 },
  legLine: { width: 2, height: 22, borderRadius: 1, marginRight: 12 },
  stop: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: RADIUS.md, padding: 10 },
  stopNumber: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  rowButtons: { gap: 10, marginTop: 14 },
  candidate: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});

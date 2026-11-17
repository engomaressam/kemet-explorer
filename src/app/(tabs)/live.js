// Live screen: external API integration. It fetches the current weather at all
// twelve sites from the Open-Meteo API in a single GET request, shows it with a
// visiting tip for each site, and sends a heat alert for favourite sites when it
// is very hot (if the user enabled those alerts in Settings > Notifications).

import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { AppText, Card, OutlineButton } from '../../components/ui';
import { SITES } from '../../data/sites';
import { describeWeather, fetchWeatherForSites, formatTemperature, visitTip } from '../../lib/api';
import { KEYS, getFavorites, getJSON, setJSON } from '../../lib/storage';
import { getPermissionStatus, sendWeatherAlert } from '../../lib/notifications';
import { RADIUS } from '../../constants/theme';

const HEAT_ALERT_C = 38;

export default function LiveScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { settings, colors } = useSettings();
  const unit = settings.temperatureUnit;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Heat alerts: at most one per favourite site per day.
  const checkHeatAlerts = useCallback(
    async (bySite) => {
      const prefs = settings.notifications;
      if (!user || !prefs.enabled || !prefs.weatherAlerts) return;
      if ((await getPermissionStatus()) !== 'granted') return;
      const today = new Date().toISOString().slice(0, 10);
      const sent = await getJSON(KEYS.weatherAlerts(user.id), { date: today, sites: [] });
      const alreadySent = sent.date === today ? sent.sites : [];
      const favorites = await getFavorites(user.id);
      const hot = SITES.filter(
        (s) => favorites.includes(s.id) && bySite[s.id] && bySite[s.id].temperature >= HEAT_ALERT_C && !alreadySent.includes(s.id),
      );
      for (const site of hot) await sendWeatherAlert(site.name, formatTemperature(bySite[site.id].temperature, unit));
      if (hot.length) await setJSON(KEYS.weatherAlerts(user.id), { date: today, sites: [...alreadySent, ...hot.map((s) => s.id)] });
    },
    [user, settings.notifications, unit],
  );

  // GET the weather for every site (one request) and update the screen.
  const load = useCallback(
    async (force = false) => {
      try {
        setError(null);
        const result = await fetchWeatherForSites(SITES, { force });
        setData(result);
        if (result.error) setError(`Showing saved data: ${result.error}`);
        await checkHeatAlerts(result.bySite);
      } catch (e) {
        setError(`Could not load live data: ${e.message}`);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [checkHeatAlerts],
  );

  useEffect(() => {
    load(false);
  }, [load]);

  const onRefresh = () => {
    setRefreshing(true);
    load(true);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <AppText muted style={{ marginTop: 12 }}>
          Fetching live conditions from Open-Meteo...
        </AppText>
      </View>
    );
  }

  const entries = SITES.map((s) => ({ site: s, w: data && data.bySite ? data.bySite[s.id] : null })).filter((e) => e.w);
  const hottest = entries.reduce((a, b) => (!a || b.w.temperature > a.w.temperature ? b : a), null);
  const coolest = entries.reduce((a, b) => (!a || b.w.temperature < a.w.temperature ? b : a), null);
  const updated = data ? new Date(data.fetchedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--';

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <AppText size={24} weight="800">
        Live conditions
      </AppText>
      <AppText muted style={{ marginTop: 4 }}>
        Current weather at Egypt's ancient sites, fetched from the Open-Meteo API.
      </AppText>

      <View style={styles.metaRow}>
        <Ionicons name="time-outline" size={14} color={colors.textMuted} />
        <AppText size={12.5} muted style={{ marginLeft: 4, flex: 1 }} testID="live-updated">
          Updated {updated} (Cairo time zone){data && data.fromCache ? ', from saved data' : ''}
        </AppText>
        <OutlineButton title="Refresh" icon="refresh" onPress={onRefresh} style={styles.refresh} />
      </View>
      {error ? (
        <AppText size={13} color={colors.danger} style={{ marginBottom: 10 }}>
          {error}
        </AppText>
      ) : null}

      {/* Highlights computed from the API response */}
      {hottest && coolest ? (
        <View style={styles.summaryRow}>
          <Card style={styles.summaryCard}>
            <Ionicons name="thermometer-outline" size={18} color={colors.danger} />
            <AppText size={12} muted style={{ marginTop: 4 }}>
              Warmest now
            </AppText>
            <AppText size={15} weight="700" numberOfLines={1}>
              {hottest.site.name}
            </AppText>
            <AppText size={20} weight="800" color={colors.danger}>
              {formatTemperature(hottest.w.temperature, unit)}
            </AppText>
          </Card>
          <Card style={styles.summaryCard}>
            <Ionicons name="snow-outline" size={18} color={colors.primary} />
            <AppText size={12} muted style={{ marginTop: 4 }}>
              Coolest now
            </AppText>
            <AppText size={15} weight="700" numberOfLines={1}>
              {coolest.site.name}
            </AppText>
            <AppText size={20} weight="800" color={colors.primary}>
              {formatTemperature(coolest.w.temperature, unit)}
            </AppText>
          </Card>
        </View>
      ) : null}

      {/* One card per site with the fetched values */}
      {entries.map(({ site, w }) => {
        const weather = describeWeather(w.code, w.isDay);
        return (
          <Card key={site.id} style={styles.siteCard}>
            <View style={styles.siteHeader}>
              <View style={[styles.weatherIcon, { backgroundColor: colors.accentSoft }]}>
                <Ionicons name={weather.icon} size={24} color={colors.accent} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <AppText size={16} weight="700" numberOfLines={1} onPress={() => router.push(`/site/${site.id}`)}>
                  {site.name}
                </AppText>
                <AppText size={12.5} muted>
                  {site.city} · {weather.label}
                </AppText>
              </View>
              <AppText size={24} weight="800">
                {formatTemperature(w.temperature, unit)}
              </AppText>
            </View>
            <View style={styles.detailsRow}>
              <AppText size={12.5} muted>
                Feels like {formatTemperature(w.feelsLike, unit)}
              </AppText>
              <AppText size={12.5} muted>
                Humidity {w.humidity}%
              </AppText>
              <AppText size={12.5} muted>
                Wind {Math.round(w.windSpeed)} km/h
              </AppText>
            </View>
            <View style={styles.detailsRow}>
              <AppText size={12.5} muted>
                Today {formatTemperature(w.min, unit)} to {formatTemperature(w.max, unit)}
              </AppText>
              <AppText size={12.5} muted>
                Sunset {w.sunset ? w.sunset.slice(11, 16) : '--'}
              </AppText>
            </View>
            <View style={[styles.tip, { backgroundColor: colors.cardAlt }]}>
              <Ionicons name="bulb-outline" size={14} color={colors.accent} />
              <AppText size={12.5} style={{ marginLeft: 6, flex: 1 }}>
                {visitTip(w)}
              </AppText>
            </View>
          </Card>
        );
      })}

      <AppText size={11.5} muted style={{ textAlign: 'center', marginTop: 8 }}>
        Weather data by Open-Meteo.com (CC BY 4.0)
      </AppText>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 32, maxWidth: 720, width: '100%', alignSelf: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12, marginBottom: 12 },
  refresh: { minHeight: 34, paddingHorizontal: 12 },
  summaryRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  summaryCard: { flex: 1, padding: 12 },
  siteCard: { padding: 14, marginBottom: 12 },
  siteHeader: { flexDirection: 'row', alignItems: 'center' },
  weatherIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  detailsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  tip: { flexDirection: 'row', alignItems: 'center', borderRadius: RADIUS.sm, padding: 8, marginTop: 10 },
});

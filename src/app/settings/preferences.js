// Settings screen: appearance and app preferences. Every change is applied at once
// across the app and saved to local storage for the signed-in user
// (SettingsContext.updateSettings), so it is remembered after a restart.

import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { AppText, Card, Chip, OutlineButton, SettingRow, SuccessBanner } from '../../components/ui';
import { CATEGORIES } from '../../data/sites';
import { formatTemperature } from '../../lib/api';

const TEXT_SIZES = [
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' },
];
const SORT_OPTIONS = [
  { value: 'name', label: 'Name' },
  { value: 'region', label: 'Region' },
  { value: 'era', label: 'Oldest first' },
];

export default function PreferencesScreen() {
  const { user, ready } = useAuth();
  const { settings, updateSettings, resetSettings, colors } = useSettings();
  const [saved, setSaved] = useState(null);

  if (ready && !user) return <Redirect href="/login" />;

  // Save a change and show a short confirmation.
  const change = async (patch, label) => {
    await updateSettings(patch);
    setSaved(`${label} saved.`);
  };

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <SuccessBanner message={saved} />

      {/* Appearance */}
      <AppText size={13} weight="700" muted style={styles.group}>
        APPEARANCE
      </AppText>
      <Card style={styles.card}>
        <SettingRow
          icon="moon-outline"
          title="Dark mode"
          description="Easier on the eyes at night"
          switchValue={settings.darkMode}
          onSwitch={(v) => change({ darkMode: v }, 'Theme')}
          testID="pref-dark-mode"
        />
        <View style={styles.optionBlock}>
          <AppText size={15} weight="600">
            Text size
          </AppText>
          <View style={styles.chips}>
            {TEXT_SIZES.map((o) => (
              <Chip
                key={o.value}
                label={o.label}
                selected={settings.textSize === o.value}
                onPress={() => change({ textSize: o.value }, 'Text size')}
              />
            ))}
          </View>
        </View>
      </Card>

      {/* Units */}
      <AppText size={13} weight="700" muted style={styles.group}>
        UNITS
      </AppText>
      <Card style={styles.card}>
        <View style={styles.optionBlock}>
          <AppText size={15} weight="600">
            Temperature
          </AppText>
          <AppText size={12.5} muted style={{ marginTop: 2 }}>
            Example: {formatTemperature(34, settings.temperatureUnit)} in Luxor at midday
          </AppText>
          <View style={styles.chips}>
            <Chip label="Celsius (°C)" selected={settings.temperatureUnit === 'C'} onPress={() => change({ temperatureUnit: 'C' }, 'Units')} />
            <Chip label="Fahrenheit (°F)" selected={settings.temperatureUnit === 'F'} onPress={() => change({ temperatureUnit: 'F' }, 'Units')} />
          </View>
        </View>
      </Card>

      {/* Home screen */}
      <AppText size={13} weight="700" muted style={styles.group}>
        HOME SCREEN
      </AppText>
      <Card style={styles.card}>
        <View style={styles.optionBlock}>
          <AppText size={15} weight="600">
            Default category
          </AppText>
          <View style={styles.chips}>
            {CATEGORIES.map((c) => (
              <Chip key={c} label={c} selected={settings.defaultCategory === c} onPress={() => change({ defaultCategory: c }, 'Default category')} />
            ))}
          </View>
        </View>
        <View style={styles.optionBlock}>
          <AppText size={15} weight="600">
            Sort sites by
          </AppText>
          <View style={styles.chips}>
            {SORT_OPTIONS.map((o) => (
              <Chip key={o.value} label={o.label} selected={settings.sortBy === o.value} onPress={() => change({ sortBy: o.value }, 'Sort order')} />
            ))}
          </View>
        </View>
        <SettingRow
          icon="image-outline"
          title="Show site photos"
          description="Turn off to save mobile data"
          switchValue={settings.showPhotos}
          onSwitch={(v) => change({ showPhotos: v }, 'Photo setting')}
        />
      </Card>

      <OutlineButton
        title="Reset to defaults"
        icon="refresh"
        color={colors.danger}
        onPress={async () => {
          await resetSettings();
          setSaved('All preferences reset to their defaults.');
        }}
        style={{ marginTop: 20 }}
      />
      <AppText size={12} muted style={{ textAlign: 'center', marginTop: 10 }}>
        Preferences are saved on this device for {user ? user.username : 'you'}.
      </AppText>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 40, maxWidth: 720, width: '100%', alignSelf: 'center' },
  group: { marginTop: 16, marginBottom: 8, marginLeft: 4, letterSpacing: 1 },
  card: { paddingVertical: 4 },
  optionBlock: { paddingVertical: 12 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 10, gap: 4 },
});

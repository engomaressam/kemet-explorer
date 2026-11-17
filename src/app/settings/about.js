// About screen: app version, purpose, data sources and credits.

import React from 'react';
import { Image, Linking, ScrollView, StyleSheet, View } from 'react-native';
import { useSettings } from '../../context/SettingsContext';
import { AppText, Card } from '../../components/ui';
import { APP_NAME } from '../../constants/theme';

const logo = require('../../../assets/logo.png');

const SOURCES = [
  { name: 'Open-Meteo', detail: 'Live weather at each site (CC BY 4.0)', url: 'https://open-meteo.com' },
  { name: 'Wikipedia', detail: 'Site summaries and photos (CC BY-SA)', url: 'https://www.wikipedia.org' },
];

export default function AboutScreen() {
  const { colors } = useSettings();
  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.hero}>
        <Image source={logo} style={styles.logo} />
        <AppText size={22} weight="800" style={{ marginTop: 10 }}>
          {APP_NAME}
        </AppText>
        <AppText muted>Version 1.0.0</AppText>
      </View>
      <Card>
        <AppText style={{ lineHeight: 22 }}>
          {APP_NAME} is a pocket guide to twelve of Egypt's great ancient sites, from the pyramids of Giza to Abu Simbel.
          Save favourites, track the sites you have visited, check live conditions before you go and get a daily
          discovery reminder.
        </AppText>
      </Card>
      <AppText size={13} weight="700" muted style={styles.group}>
        DATA SOURCES
      </AppText>
      <Card>
        {SOURCES.map((s) => (
          <View key={s.name} style={{ paddingVertical: 8 }}>
            <AppText weight="700" color={colors.primary} onPress={() => Linking.openURL(s.url)}>
              {s.name}
            </AppText>
            <AppText size={13} muted>
              {s.detail}
            </AppText>
          </View>
        ))}
      </Card>
      <AppText size={12} muted style={{ textAlign: 'center', marginTop: 18 }}>
        Built with React Native and Expo by Omar Essam El Sherbiny.
      </AppText>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 40, maxWidth: 720, width: '100%', alignSelf: 'center' },
  hero: { alignItems: 'center', marginVertical: 16 },
  logo: { width: 88, height: 88, borderRadius: 22 },
  group: { marginTop: 18, marginBottom: 8, marginLeft: 4, letterSpacing: 1 },
});

// Privacy & stored data: lists every key the app keeps in local storage with its
// size and a preview of the saved JSON, so users can see what is stored about them.
// On the web these keys live in the browser's localStorage; on a phone, in the
// app's private storage.

import React, { useCallback, useState } from 'react';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Redirect, useFocusEffect } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { AppText, Card, OutlineButton, SuccessBanner } from '../../components/ui';
import { clearCaches, getAllStoredData } from '../../lib/storage';
import { RADIUS } from '../../constants/theme';

// Short, readable preview of a stored JSON value (password hashes are masked).
function preview(raw) {
  try {
    const value = JSON.parse(raw);
    const masked = JSON.stringify(value, (k, v) => (k === 'passwordHash' || k === 'salt' ? '(hidden)' : v));
    return masked.length > 160 ? `${masked.slice(0, 160)}...` : masked;
  } catch (e) {
    return raw;
  }
}

export default function StoredDataScreen() {
  const { user, ready } = useAuth();
  const { colors } = useSettings();
  const [items, setItems] = useState([]);
  const [message, setMessage] = useState(null);

  const load = useCallback(() => {
    getAllStoredData().then(setItems);
  }, []);
  useFocusEffect(load);

  if (ready && !user) return <Redirect href="/login" />;

  const total = items.reduce((sum, i) => sum + i.bytes, 0);

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <SuccessBanner message={message} />
      <Card style={styles.summary}>
        <Ionicons name="server-outline" size={24} color={colors.primary} />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <AppText size={16} weight="700">
            {items.length} keys, {(total / 1024).toFixed(1)} KB
          </AppText>
          <AppText size={12.5} muted>
            Saved with AsyncStorage {Platform.OS === 'web' ? "in this browser's localStorage" : 'on this device'}
          </AppText>
        </View>
      </Card>

      {items.map((item) => (
        <Card key={item.key} style={styles.item}>
          <View style={styles.itemHeader}>
            <AppText size={14} weight="700" color={colors.primary} style={{ flex: 1 }}>
              {item.key}
            </AppText>
            <AppText size={12} muted>
              {item.bytes} B
            </AppText>
          </View>
          <View style={[styles.code, { backgroundColor: colors.cardAlt }]}>
            <AppText size={12} style={styles.mono}>
              {preview(item.value)}
            </AppText>
          </View>
        </Card>
      ))}

      <View style={styles.buttons}>
        <OutlineButton title="Refresh" icon="refresh" onPress={load} style={{ flex: 1 }} />
        <OutlineButton
          title="Clear cached API data"
          icon="trash-outline"
          color={colors.danger}
          style={{ flex: 1.4 }}
          onPress={async () => {
            await clearCaches();
            load();
            setMessage('Cached weather and Wikipedia data cleared.');
          }}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 40, maxWidth: 720, width: '100%', alignSelf: 'center' },
  summary: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  item: { padding: 12, marginBottom: 10 },
  itemHeader: { flexDirection: 'row', alignItems: 'center' },
  code: { borderRadius: RADIUS.sm, padding: 8, marginTop: 8 },
  mono: { fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'Consolas, monospace' }) },
  buttons: { flexDirection: 'row', gap: 10, marginTop: 8 },
});

// Small reusable building blocks used by every screen. They all read the active
// palette from SettingsContext, so dark mode and text size apply everywhere.

import React, { useState } from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../context/SettingsContext';
import { APP_NAME, RADIUS, SPACING } from '../constants/theme';

const logo = require('../../assets/logo.png');

// ----------------------------------------------------------------------------- text
export function AppText({ style, size = 15, weight = '400', muted, color, children, ...rest }) {
  const { colors, fontScale } = useTheme();
  return (
    <Text
      style={[
        { color: color || (muted ? colors.textMuted : colors.text), fontSize: size * fontScale, fontWeight: weight },
        style,
      ]}
      {...rest}
    >
      {children}
    </Text>
  );
}

// ----------------------------------------------------------------------------- header pieces
// App logo and name, shown in the header of the main screens.
export function HeaderLogo() {
  const { colors } = useTheme();
  return (
    <View style={styles.headerLogo}>
      <Image source={logo} style={styles.headerLogoImage} accessibilityLabel="Kemet Explorer logo" />
      <Text style={[styles.headerLogoText, { color: colors.text }]}>{APP_NAME}</Text>
    </View>
  );
}

// Settings icon in the top-right corner: opens the settings menu from any screen.
export function HeaderSettingsButton() {
  const router = useRouter();
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={() => router.push('/settings')}
      accessibilityRole="button"
      accessibilityLabel="Open settings menu"
      style={({ pressed }) => [styles.iconButton, { backgroundColor: colors.cardAlt, opacity: pressed ? 0.7 : 1 }]}
      testID="settings-menu-button"
    >
      <Ionicons name="settings-outline" size={22} color={colors.primary} />
    </Pressable>
  );
}

// ----------------------------------------------------------------------------- buttons
export function PrimaryButton({ title, onPress, icon, loading, disabled, style, testID }) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      testID={testID}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: colors.primary, opacity: disabled ? 0.5 : pressed ? 0.85 : 1 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <>
          {icon ? <Ionicons name={icon} size={18} color="#fff" style={{ marginRight: 8 }} /> : null}
          <Text style={styles.buttonText}>{title}</Text>
        </>
      )}
    </Pressable>
  );
}

export function OutlineButton({ title, onPress, icon, style, color, testID }) {
  const { colors } = useTheme();
  const tint = color || colors.primary;
  return (
    <Pressable
      onPress={onPress}
      testID={testID}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: tint, opacity: pressed ? 0.7 : 1 },
        style,
      ]}
    >
      {icon ? <Ionicons name={icon} size={18} color={tint} style={{ marginRight: 8 }} /> : null}
      <Text style={[styles.buttonText, { color: tint }]}>{title}</Text>
    </Pressable>
  );
}

export function LinkText({ children, onPress, testID }) {
  const { colors } = useTheme();
  return (
    <Text onPress={onPress} testID={testID} accessibilityRole="link" style={[styles.link, { color: colors.primary }]}>
      {children}
    </Text>
  );
}

// ----------------------------------------------------------------------------- form fields
export function TextField({ label, icon, value, onChangeText, secure, error, ...rest }) {
  const { colors } = useTheme();
  const [hidden, setHidden] = useState(!!secure);
  return (
    <View style={{ marginBottom: SPACING.md }}>
      <AppText size={13} weight="600" style={{ marginBottom: 6 }}>
        {label}
      </AppText>
      <View
        style={[
          styles.inputRow,
          { backgroundColor: colors.card, borderColor: error ? colors.danger : colors.border },
        ]}
      >
        {icon ? <Ionicons name={icon} size={18} color={error ? colors.danger : colors.textMuted} /> : null}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={hidden}
          placeholderTextColor={colors.textMuted}
          style={[styles.input, { color: colors.text }]}
          autoCapitalize="none"
          {...rest}
        />
        {secure ? (
          <Pressable onPress={() => setHidden((h) => !h)} accessibilityLabel={hidden ? 'Show password' : 'Hide password'}>
            <Ionicons name={hidden ? 'eye-outline' : 'eye-off-outline'} size={18} color={colors.textMuted} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

// Red error box used for sign-up and login feedback.
export function ErrorBanner({ message, testID }) {
  const { colors } = useTheme();
  if (!message) return null;
  return (
    <View
      testID={testID}
      accessibilityRole="alert"
      style={[styles.banner, { backgroundColor: colors.dangerSoft, borderColor: colors.danger }]}
    >
      <Ionicons name="alert-circle" size={20} color={colors.danger} style={{ marginRight: 8, marginTop: 1 }} />
      <AppText color={colors.danger} size={14} weight="600" style={{ flex: 1, lineHeight: 20 }}>
        {message}
      </AppText>
    </View>
  );
}

export function SuccessBanner({ message }) {
  const { colors } = useTheme();
  if (!message) return null;
  return (
    <View style={[styles.banner, { backgroundColor: colors.successSoft, borderColor: colors.success }]}>
      <Ionicons name="checkmark-circle" size={20} color={colors.success} style={{ marginRight: 8 }} />
      <AppText color={colors.success} size={14} weight="600" style={{ flex: 1 }}>
        {message}
      </AppText>
    </View>
  );
}

// ----------------------------------------------------------------------------- layout helpers
export function Card({ children, style }) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border, shadowColor: colors.shadow },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function SectionTitle({ children, action, onAction }) {
  const { colors } = useTheme();
  return (
    <View style={styles.sectionTitle}>
      <AppText size={17} weight="700">
        {children}
      </AppText>
      {action ? (
        <Text onPress={onAction} style={{ color: colors.primary, fontWeight: '600' }}>
          {action}
        </Text>
      ) : null}
    </View>
  );
}

export function Chip({ label, selected, onPress, icon }) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={[
        styles.chip,
        {
          backgroundColor: selected ? colors.primary : colors.card,
          borderColor: selected ? colors.primary : colors.border,
        },
      ]}
    >
      {icon ? (
        <Ionicons name={icon} size={14} color={selected ? '#fff' : colors.textMuted} style={{ marginRight: 4 }} />
      ) : null}
      <Text style={{ color: selected ? '#fff' : colors.text, fontWeight: '600', fontSize: 13 }}>{label}</Text>
    </Pressable>
  );
}

// One row in a settings list: icon, title, optional description and a right-hand control.
export function SettingRow({ icon, iconColor, title, description, onPress, right, switchValue, onSwitch, danger, testID }) {
  const { colors } = useTheme();
  const tint = danger ? colors.danger : iconColor || colors.primary;
  const content = (
    <>
      <View style={[styles.rowIcon, { backgroundColor: danger ? colors.dangerSoft : colors.cardAlt }]}>
        <Ionicons name={icon} size={20} color={tint} />
      </View>
      <View style={{ flex: 1 }}>
        <AppText size={15} weight="600" color={danger ? colors.danger : undefined}>
          {title}
        </AppText>
        {description ? (
          <AppText size={12.5} muted style={{ marginTop: 2 }}>
            {description}
          </AppText>
        ) : null}
      </View>
      {onSwitch ? (
        <Switch
          value={switchValue}
          onValueChange={onSwitch}
          trackColor={{ true: colors.primary, false: colors.border }}
          thumbColor="#fff"
          activeThumbColor="#fff"
          testID={testID ? `${testID}-switch` : undefined}
        />
      ) : (
        right || (onPress ? <Ionicons name="chevron-forward" size={18} color={colors.textMuted} /> : null)
      )}
    </>
  );
  // A row with a switch toggles when tapped anywhere, like the system settings app.
  if (onSwitch && !onPress) {
    return (
      <Pressable
        onPress={() => onSwitch(!switchValue)}
        testID={testID}
        accessibilityRole="switch"
        accessibilityState={{ checked: !!switchValue }}
        style={[styles.row, { borderBottomColor: colors.border }]}
      >
        {content}
      </Pressable>
    );
  }
  if (!onPress) return <View style={[styles.row, { borderBottomColor: colors.border }]} testID={testID}>{content}</View>;
  return (
    <Pressable
      onPress={onPress}
      testID={testID}
      accessibilityRole="button"
      style={({ pressed }) => [styles.row, { borderBottomColor: colors.border, opacity: pressed ? 0.7 : 1 }]}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  headerLogo: { flexDirection: 'row', alignItems: 'center' },
  headerLogoImage: { width: 34, height: 34, borderRadius: 8, marginRight: 10 },
  headerLogoText: { fontSize: 19, fontWeight: '800', letterSpacing: 0.3 },
  iconButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  button: {
    minHeight: 50,
    borderRadius: RADIUS.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  link: { fontWeight: '700', textDecorationLine: 'underline' },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    minHeight: 50,
  },
  input: { flex: 1, fontSize: 15, paddingHorizontal: 10, paddingVertical: 12, outlineStyle: 'none' },
  banner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  card: {
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    padding: SPACING.lg,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    marginRight: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowIcon: { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
});

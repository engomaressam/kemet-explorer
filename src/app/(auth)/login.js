// Login screen: email and password, with validation and error feedback.
// Credentials are checked against the accounts saved in local storage
// (see AuthContext.logIn). A successful login opens the home screen.

import React, { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/SettingsContext';
import { AppText, Card, ErrorBanner, LinkText, OutlineButton, PrimaryButton, TextField } from '../../components/ui';
import { APP_NAME } from '../../constants/theme';

const logo = require('../../../assets/logo.png');

export default function LoginScreen() {
  const router = useRouter();
  const { logIn } = useAuth();
  const { colors } = useTheme();

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [busy, setBusy] = useState(false);

  // Validate, check the stored account and navigate on success.
  const handleLogin = async () => {
    setBusy(true);
    const result = await logIn({ email, password });
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      setFieldErrors(result.fieldErrors || {});
      return;
    }
    setError(null);
    router.replace('/home');
  };

  const goToSignup = () => router.push('/signup');

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {/* Brand header */}
        <View style={styles.hero}>
          <Image source={logo} style={styles.logo} accessibilityLabel={`${APP_NAME} logo`} />
          <AppText size={13} weight="700" color={colors.accent} style={styles.brand}>
            {APP_NAME.toUpperCase()}
          </AppText>
          <AppText size={26} weight="800">
            Welcome back
          </AppText>
          <AppText muted style={{ marginTop: 6, textAlign: 'center' }}>
            Log in to keep exploring the wonders of ancient Egypt.
          </AppText>
        </View>

        <Card>
          <ErrorBanner message={error} testID="login-error" />
          <TextField
            label="Email"
            icon="mail-outline"
            value={email}
            onChangeText={setEmail}
            placeholder="name@example.com"
            keyboardType="email-address"
            error={fieldErrors.email}
            testID="login-email"
          />
          <TextField
            label="Password"
            icon="lock-closed-outline"
            value={password}
            onChangeText={setPassword}
            placeholder="Your password"
            secure
            error={fieldErrors.password}
            onSubmitEditing={handleLogin}
            testID="login-password"
          />
          <PrimaryButton title="Log In" icon="log-in-outline" onPress={handleLogin} loading={busy} testID="login-button" />

          {/* Route to registration for new users */}
          <View style={styles.dividerRow}>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <AppText size={13} muted style={{ marginHorizontal: 10 }}>
              New to {APP_NAME}?
            </AppText>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
          </View>
          <OutlineButton title="Sign Up" icon="person-add-outline" onPress={goToSignup} testID="login-signup-button" />
        </Card>

        <View style={styles.footer}>
          <AppText muted>Don't have an account? </AppText>
          <LinkText onPress={goToSignup} testID="login-signup-link">
            Sign up
          </LinkText>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', padding: 20, maxWidth: 480, width: '100%', alignSelf: 'center' },
  hero: { alignItems: 'center', marginBottom: 20 },
  logo: { width: 84, height: 84, borderRadius: 20, marginBottom: 10 },
  brand: { letterSpacing: 2, marginBottom: 6 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 16 },
  divider: { flex: 1, height: 1 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 18 },
});

// Sign-up screen: username, email and password, with validation and error feedback.
// A valid registration is saved in local storage (see AuthContext.signUp) and the
// new user is signed in and taken to the home screen.

import React, { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/SettingsContext';
import { AppText, Card, ErrorBanner, LinkText, PrimaryButton, TextField } from '../../components/ui';
import { APP_NAME } from '../../constants/theme';

const logo = require('../../../assets/logo.png');

export default function SignupScreen() {
  const router = useRouter();
  const { signUp } = useAuth();
  const { colors } = useTheme();

  // Form state: the three registration fields plus error feedback
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [busy, setBusy] = useState(false);

  // Validate the form, save the account and open the home screen.
  const handleSignup = async () => {
    setBusy(true);
    const result = await signUp({ username, email, password });
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      setFieldErrors(result.fieldErrors || {});
      return;
    }
    setError(null);
    router.replace('/home');
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Image source={logo} style={styles.logo} accessibilityLabel={`${APP_NAME} logo`} />
          <AppText size={13} weight="700" color={colors.accent} style={styles.brand}>
            {APP_NAME.toUpperCase()}
          </AppText>
          <AppText size={26} weight="800">
            Create your account
          </AppText>
          <AppText muted style={{ marginTop: 6, textAlign: 'center' }}>
            Save favourite sites, track your visits and get daily discoveries.
          </AppText>
        </View>

        <Card>
          <ErrorBanner message={error} testID="signup-error" />
          <TextField
            label="Username"
            icon="person-outline"
            value={username}
            onChangeText={setUsername}
            placeholder="e.g. omar_essam"
            error={fieldErrors.username}
            testID="signup-username"
          />
          <TextField
            label="Email"
            icon="mail-outline"
            value={email}
            onChangeText={setEmail}
            placeholder="name@example.com"
            keyboardType="email-address"
            error={fieldErrors.email}
            testID="signup-email"
          />
          <TextField
            label="Password"
            icon="lock-closed-outline"
            value={password}
            onChangeText={setPassword}
            placeholder="At least 8 characters, with a number"
            secure
            error={fieldErrors.password}
            onSubmitEditing={handleSignup}
            testID="signup-password"
          />
          <PrimaryButton title="Sign Up" icon="person-add-outline" onPress={handleSignup} loading={busy} testID="signup-button" />
        </Card>

        <View style={styles.footer}>
          <AppText muted>Already have an account? </AppText>
          <LinkText onPress={() => router.replace('/login')} testID="signup-login-link">
            Log in
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
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 18 },
});

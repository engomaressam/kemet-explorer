// Profile & account: change the username or email, or the password. Changes are
// validated and saved to the account record in local storage (AuthContext).

import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { AppText, Card, ErrorBanner, PrimaryButton, SuccessBanner, TextField } from '../../components/ui';

export default function AccountScreen() {
  const { user, ready, updateProfile, changePassword } = useAuth();
  const [username, setUsername] = useState(user ? user.username : '');
  const [email, setEmail] = useState(user ? user.email : '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [profileMsg, setProfileMsg] = useState({});
  const [passwordMsg, setPasswordMsg] = useState({});

  // Fill the form once the saved session has been read.
  useEffect(() => {
    if (user) {
      setUsername(user.username);
      setEmail(user.email);
    }
  }, [user]);

  if (ready && !user) return <Redirect href="/login" />;

  const saveProfile = async () => {
    const r = await updateProfile({ username, email });
    setProfileMsg(r.ok ? { ok: 'Profile updated.' } : { error: r.error });
  };

  const savePassword = async () => {
    const r = await changePassword(currentPassword, newPassword);
    setPasswordMsg(r.ok ? { ok: 'Password changed.' } : { error: r.error });
    if (r.ok) {
      setCurrentPassword('');
      setNewPassword('');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <AppText size={13} weight="700" muted style={styles.group}>
        PROFILE
      </AppText>
      <Card>
        <ErrorBanner message={profileMsg.error} />
        <SuccessBanner message={profileMsg.ok} />
        <TextField label="Username" icon="person-outline" value={username} onChangeText={setUsername} />
        <TextField label="Email" icon="mail-outline" value={email} onChangeText={setEmail} keyboardType="email-address" />
        <PrimaryButton title="Save profile" icon="save-outline" onPress={saveProfile} />
      </Card>

      <AppText size={13} weight="700" muted style={styles.group}>
        PASSWORD
      </AppText>
      <Card>
        <ErrorBanner message={passwordMsg.error} />
        <SuccessBanner message={passwordMsg.ok} />
        <TextField label="Current password" icon="lock-closed-outline" value={currentPassword} onChangeText={setCurrentPassword} secure />
        <TextField label="New password" icon="key-outline" value={newPassword} onChangeText={setNewPassword} secure />
        <PrimaryButton title="Change password" icon="shield-checkmark-outline" onPress={savePassword} />
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 40, maxWidth: 720, width: '100%', alignSelf: 'center' },
  group: { marginTop: 16, marginBottom: 8, marginLeft: 4, letterSpacing: 1 },
});

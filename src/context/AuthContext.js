// Authentication for Kemet Explorer: sign-up, login, logout and profile updates.
//
// There is no backend: accounts live in local storage on the device (see
// src/lib/storage.js). Passwords are never stored in clear text; each one is
// hashed with SHA-256 and a random salt using expo-crypto.

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as Crypto from 'expo-crypto';
import {
  clearSession,
  getSession,
  getUsers,
  logActivity,
  saveSession,
  saveUsers,
} from '../lib/storage';
import { validateEmail, validatePassword, validateSignup, validateUsername } from '../lib/validation';

const AuthContext = createContext(null);

async function hashPassword(password, salt) {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, `${salt}:${password}`);
}

// The user object shared with screens never includes the password hash.
function publicUser(user) {
  const { passwordHash, salt, ...rest } = user;
  return rest;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  // Restore the session saved by the last login, so the user stays signed in.
  useEffect(() => {
    (async () => {
      const session = await getSession();
      if (session) {
        const users = await getUsers();
        const found = users.find((u) => u.id === session.userId);
        if (found) setUser(publicUser(found));
      }
      setReady(true);
    })();
  }, []);

  // Sign up: validate, reject duplicates, store the new account, start a session.
  const signUp = useCallback(async ({ username, email, password }) => {
    const { fieldErrors, message } = validateSignup({ username, email, password });
    if (message) return { ok: false, error: message, fieldErrors };

    const users = await getUsers();
    const normalisedEmail = email.trim().toLowerCase();
    if (users.some((u) => u.email === normalisedEmail)) {
      return {
        ok: false,
        error: 'Sign up failed: an account with this email already exists. Log in instead.',
        fieldErrors: { email: true },
      };
    }
    if (users.some((u) => u.username.toLowerCase() === username.trim().toLowerCase())) {
      return { ok: false, error: 'Sign up failed: that username is already taken.', fieldErrors: { username: true } };
    }

    const salt = Crypto.randomUUID();
    const account = {
      id: Crypto.randomUUID(),
      username: username.trim(),
      email: normalisedEmail,
      salt,
      passwordHash: await hashPassword(password, salt),
      createdAt: new Date().toISOString(),
    };
    await saveUsers([...users, account]);
    await saveSession(account);
    await logActivity(account.id, 'signed-up', account.email);
    setUser(publicUser(account));
    return { ok: true };
  }, []);

  // Login: check the email exists and the password hash matches.
  const logIn = useCallback(async ({ email, password }) => {
    if (!email.trim() || !password) {
      return {
        ok: false,
        error: 'Please enter your email and password to log in.',
        fieldErrors: { email: !email.trim(), password: !password },
      };
    }
    const emailError = validateEmail(email);
    if (emailError) return { ok: false, error: emailError, fieldErrors: { email: true } };

    const users = await getUsers();
    const account = users.find((u) => u.email === email.trim().toLowerCase());
    const valid = account && (await hashPassword(password, account.salt)) === account.passwordHash;
    if (!valid) {
      // Same message for an unknown email and a wrong password, so the screen
      // does not reveal which accounts exist.
      return {
        ok: false,
        error: 'Login failed: incorrect email or password. Please try again.',
        fieldErrors: { email: true, password: true },
      };
    }
    await saveSession(account);
    await logActivity(account.id, 'logged-in', account.email);
    setUser(publicUser(account));
    return { ok: true };
  }, []);

  // Logout clears the session so the next launch opens the login screen.
  const logOut = useCallback(async () => {
    if (user) await logActivity(user.id, 'logged-out', user.email);
    await clearSession();
    setUser(null);
  }, [user]);

  // Profile edits from Settings > Profile & account.
  const updateProfile = useCallback(
    async ({ username, email }) => {
      const usernameError = validateUsername(username);
      const emailError = validateEmail(email);
      if (usernameError || emailError) return { ok: false, error: usernameError || emailError };
      const users = await getUsers();
      const normalisedEmail = email.trim().toLowerCase();
      if (users.some((u) => u.id !== user.id && u.email === normalisedEmail)) {
        return { ok: false, error: 'Another account already uses this email.' };
      }
      const next = users.map((u) => (u.id === user.id ? { ...u, username: username.trim(), email: normalisedEmail } : u));
      await saveUsers(next);
      const updated = next.find((u) => u.id === user.id);
      await saveSession(updated);
      await logActivity(user.id, 'profile-updated', normalisedEmail);
      setUser(publicUser(updated));
      return { ok: true };
    },
    [user],
  );

  const changePassword = useCallback(
    async (currentPassword, newPassword) => {
      const users = await getUsers();
      const account = users.find((u) => u.id === user.id);
      if (!account || (await hashPassword(currentPassword, account.salt)) !== account.passwordHash) {
        return { ok: false, error: 'Your current password is not correct.' };
      }
      const passwordError = validatePassword(newPassword);
      if (passwordError) return { ok: false, error: passwordError };
      const salt = Crypto.randomUUID();
      const passwordHash = await hashPassword(newPassword, salt);
      await saveUsers(users.map((u) => (u.id === user.id ? { ...u, salt, passwordHash } : u)));
      await logActivity(user.id, 'password-changed', '');
      return { ok: true };
    },
    [user],
  );

  const value = useMemo(
    () => ({ user, ready, signUp, logIn, logOut, updateProfile, changePassword }),
    [user, ready, signUp, logIn, logOut, updateProfile, changePassword],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

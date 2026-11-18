// Tests for the form validation used by the sign-up, login and account screens.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateEmail, validatePassword, validateSignup, validateUsername } from '../src/lib/validation.js';

test('email', () => {
  assert.equal(validateEmail('name@example.com'), null);
  assert.equal(validateEmail('  name@example.com  '), null);
  assert.equal(validateEmail(''), 'Email is required.');
  assert.match(validateEmail('name@example'), /valid email/);
  assert.match(validateEmail('name example.com'), /valid email/);
});

test('username', () => {
  assert.equal(validateUsername('omar_essam'), null);
  assert.equal(validateUsername(''), 'Username is required.');
  assert.match(validateUsername('ab'), /3-20 characters/);
  assert.match(validateUsername('no spaces'), /3-20 characters/);
  assert.match(validateUsername('x'.repeat(21)), /3-20 characters/);
});

test('password', () => {
  assert.equal(validatePassword('pyramids2026'), null);
  assert.equal(validatePassword(''), 'Password is required.');
  assert.match(validatePassword('short1'), /at least 8/);
  assert.match(validatePassword('onlyletters'), /letter and one number/);
  assert.match(validatePassword('12345678'), /letter and one number/);
});

test('sign-up form', () => {
  const empty = validateSignup({ username: '', email: '', password: '' });
  assert.equal(empty.message, 'Please fill in your username, email and password to sign up.');
  assert.deepEqual(empty.fieldErrors, { username: true, email: true, password: true });

  const partial = validateSignup({ username: 'ok_name', email: 'bad', password: 'short' });
  assert.deepEqual(partial.fieldErrors, { email: true, password: true });
  assert.match(partial.message, /^Sign up failed/);

  assert.deepEqual(validateSignup({ username: 'ok_name', email: 'a@b.co', password: 'pyramids2026' }), {
    fieldErrors: {},
    message: null,
  });
});

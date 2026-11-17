// Form validation shared by the sign-up, login and account screens.
// Each function returns an error message, or null when the input is valid.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const USERNAME_RE = /^[A-Za-z0-9_]{3,20}$/;

export function validateEmail(email) {
  if (!email.trim()) return 'Email is required.';
  if (!EMAIL_RE.test(email.trim())) return 'Enter a valid email address, like name@example.com.';
  return null;
}

export function validateUsername(username) {
  if (!username.trim()) return 'Username is required.';
  if (!USERNAME_RE.test(username.trim())) {
    return 'Username must be 3-20 characters: letters, numbers or underscores.';
  }
  return null;
}

export function validatePassword(password) {
  if (!password) return 'Password is required.';
  if (password.length < 8) return 'Password must be at least 8 characters.';
  if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
    return 'Password must contain at least one letter and one number.';
  }
  return null;
}

// Validates the whole sign-up form and returns { fieldErrors, message }.
export function validateSignup({ username, email, password }) {
  if (!username.trim() && !email.trim() && !password) {
    return {
      fieldErrors: { username: true, email: true, password: true },
      message: 'Please fill in your username, email and password to sign up.',
    };
  }
  const fieldErrors = {};
  const messages = [];
  for (const [field, error] of [
    ['username', validateUsername(username)],
    ['email', validateEmail(email)],
    ['password', validatePassword(password)],
  ]) {
    if (error) {
      fieldErrors[field] = true;
      messages.push(error);
    }
  }
  return {
    fieldErrors,
    message: messages.length ? `Sign up failed. Please fix the following:\n${messages.map((m) => `• ${m}`).join('\n')}` : null,
  };
}

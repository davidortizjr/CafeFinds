// Small input validators shared by the auth, settings and review routes.
// Each returns { value } on success or { error } with a message that is safe
// to show to the person filling in the form.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const USERNAME_RE = /^[a-z0-9_]{3,20}$/

export function parseEmail(raw) {
  const value = typeof raw === 'string' ? raw.trim().toLowerCase() : ''
  if (!value) return { error: 'Enter your email address.' }
  if (value.length > 254 || !EMAIL_RE.test(value)) return { error: 'Enter a valid email address.' }
  return { value }
}

export function parseUsername(raw) {
  const value = typeof raw === 'string' ? raw.trim().toLowerCase().replace(/^@/, '') : ''
  if (!value) return { error: 'Choose a username.' }
  if (!USERNAME_RE.test(value)) {
    return { error: 'Usernames are 3–20 characters: letters, numbers and underscores.' }
  }
  return { value }
}

// bcrypt only reads the first 72 bytes, so reject anything longer instead of
// silently truncating it.
export function parsePassword(raw) {
  if (typeof raw !== 'string' || raw.length < 8) {
    return { error: 'Use at least 8 characters for your password.' }
  }
  if (Buffer.byteLength(raw, 'utf8') > 72) {
    return { error: 'That password is too long. Keep it under 72 bytes.' }
  }
  return { value: raw }
}

export function parseDisplayName(raw, fallback = '') {
  const value = typeof raw === 'string' ? raw.trim().replace(/\s+/g, ' ').slice(0, 40) : ''
  return { value: value || fallback }
}

export function parseBio(raw) {
  const value = typeof raw === 'string' ? raw.trim().slice(0, 160) : ''
  return { value: value || null }
}

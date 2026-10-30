// Before accounts existed, each device got a random id so its visited list
// and reviews could persist. That id is no longer used to sign in; it is only
// sent once, when someone registers, so the server can move their old log into
// their new account.

const KEY = 'caféfinds:deviceId'

export function legacyDeviceId() {
  try {
    return localStorage.getItem(KEY) || undefined
  } catch {
    return undefined
  }
}

export function clearLegacyDeviceId() {
  try {
    localStorage.removeItem(KEY)
  } catch {
    // storage unavailable (private mode); nothing to clear
  }
}

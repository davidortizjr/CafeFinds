const KEY = 'caféfinds:deviceId'

// No sign-up flow yet — each device gets a stable anonymous id so reviews
// and the visited checklist persist across sessions. Swap this out for real
// auth (e.g. Clerk, Auth.js) later without touching the schema much: the
// User model just needs a second lookup field.
export function getDeviceId() {
  let id = localStorage.getItem(KEY)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(KEY, id)
  }
  return id
}

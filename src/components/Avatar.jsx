import { initials, toneFor } from '../lib/format.js'

// No photo uploads yet, so avatars are initials on a color picked from the
// person's username. The same person always gets the same color.
export default function Avatar({ name, username, size = 40 }) {
  return (
    <span
      className={`avatar tone-${toneFor(username || name)}`}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.4) }}
      aria-hidden="true"
    >
      {initials(name)}
    </span>
  )
}

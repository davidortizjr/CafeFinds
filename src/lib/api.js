import { getDeviceId } from './user.js'

async function request(path, options = {}) {
  const res = await fetch(`/api${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'x-device-id': getDeviceId(),
      ...options.headers
    }
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `Request failed (${res.status})`)
  }

  if (res.status === 204) return null
  return res.json()
}

export const api = {
  me: () => request('/me'),
  updateName: (name) => request('/me', { method: 'PATCH', body: JSON.stringify({ name }) }),

  upsertCafe: (cafe) => request('/cafes/upsert', { method: 'POST', body: JSON.stringify(cafe) }),
  getCafe: (placeId) => request(`/cafes/${placeId}`),

  toggleVisit: (cafeId) => request('/visits/toggle', { method: 'POST', body: JSON.stringify({ cafeId }) }),

  upsertReview: (cafeId, rating, text) =>
    request('/reviews', { method: 'POST', body: JSON.stringify({ cafeId, rating, text }) }),
  deleteReview: (cafeId) => request(`/reviews/${cafeId}`, { method: 'DELETE' }),

  getLog: () => request('/log')
}

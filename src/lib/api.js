// Thin fetch wrapper. Sessions live in an httpOnly cookie the browser sends
// automatically, so there is nothing to attach here.

export class ApiError extends Error {
  constructor(message, { status = 0, field, code } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.field = field // which form field the message is about, when the server says
    this.code = code
  }
}

async function request(method, path, data) {
  let res
  try {
    res = await fetch(`/api${path}`, {
      method,
      headers: data !== undefined ? { 'Content-Type': 'application/json' } : undefined,
      body: data !== undefined ? JSON.stringify(data) : undefined
    })
  } catch {
    throw new ApiError('Can’t reach CaféFinds. Check your connection and try again.')
  }

  if (res.status === 204) return null
  const body = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new ApiError(body.error || 'Something went wrong. Try again.', {
      status: res.status,
      field: body.field,
      code: body.code
    })
  }
  return body
}

export const api = {
  // account
  session: () => request('GET', '/auth/me'),
  register: (fields) => request('POST', '/auth/register', fields),
  login: (identifier, password) => request('POST', '/auth/login', { identifier, password }),
  logout: () => request('POST', '/auth/logout'),
  forgotPassword: (email) => request('POST', '/auth/forgot', { email }),
  resetPassword: (token, password) => request('POST', '/auth/reset', { token, password }),

  // settings
  updateProfile: (fields) => request('PATCH', '/me', fields),
  changePassword: (currentPassword, newPassword) => request('POST', '/me/password', { currentPassword, newPassword }),
  deleteAccount: (password) => request('DELETE', '/me', { password }),

  // people
  getProfile: (username) => request('GET', `/users/${encodeURIComponent(username)}`),

  // cafes (reading is public; everything below `getCafe` needs an account)
  getCafe: (placeId) => request('GET', `/cafes/${encodeURIComponent(placeId)}`),
  upsertCafe: (cafe) => request('POST', '/cafes/upsert', cafe),
  toggleVisit: (cafeId) => request('POST', '/visits/toggle', { cafeId }),
  upsertReview: (cafeId, rating, text) => request('POST', '/reviews', { cafeId, rating, text }),
  deleteReview: (cafeId) => request('DELETE', `/reviews/${cafeId}`),
  getLog: () => request('GET', '/log')
}

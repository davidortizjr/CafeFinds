import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { api } from './api.js'
import { clearLegacyDeviceId, legacyDeviceId } from './user.js'

const AuthContext = createContext(null)

// `user` is undefined while we check for a session, null for guests, and the
// user object once signed in. Guests can browse; anything that writes needs a user.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined)

  useEffect(() => {
    let cancelled = false
    api
      .session()
      .then(({ user }) => !cancelled && setUser(user))
      .catch(() => !cancelled && setUser(null))
    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(async (identifier, password) => {
    const { user } = await api.login(identifier, password)
    setUser(user)
    return user
  }, [])

  const register = useCallback(async (fields) => {
    const { user } = await api.register({ ...fields, deviceId: legacyDeviceId() })
    clearLegacyDeviceId()
    setUser(user)
    return user
  }, [])

  const logout = useCallback(async () => {
    await api.logout().catch(() => {})
    setUser(null)
  }, [])

  const value = useMemo(() => ({ user, setUser, login, register, logout }), [user, login, register, logout])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}

import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../lib/auth.jsx'

export function PageLoader() {
  return (
    <div className="page-loader" role="status" aria-label="Loading">
      <span className="spinner" />
    </div>
  )
}

// Pages that only make sense for a signed-in person (your log, settings).
// Guests are sent to sign in and come back to where they were headed.
export function RequireAuth({ children, reason }) {
  const { user } = useAuth()
  const location = useLocation()

  if (user === undefined) return <PageLoader />
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search, reason }} />
  }
  return children
}

// Sign in and create account only make sense for guests. Someone who is
// already signed in goes straight to where they were headed, or the map.
export function GuestOnly({ children }) {
  const { user } = useAuth()
  const location = useLocation()

  if (user === undefined) return <PageLoader />
  if (user) return <Navigate to={location.state?.from ?? '/'} replace />
  return children
}

// The old /profile tab now lives at /u/<username>.
export function ProfileRedirect() {
  const { user } = useAuth()
  if (user === undefined) return <PageLoader />
  return <Navigate to={user ? `/u/${user.username}` : '/login'} replace state={{ from: '/profile' }} />
}

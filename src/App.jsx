import { Link, Route, Routes } from 'react-router-dom'
import Dock from './components/Dock.jsx'
import { GuestOnly, ProfileRedirect, RequireAuth } from './components/RouteGuards.jsx'
import { AuthProvider } from './lib/auth.jsx'
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import LogPage from './pages/LogPage.jsx'
import MapPage from './pages/MapPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import ResetPasswordPage from './pages/ResetPasswordPage.jsx'
import SettingsPage from './pages/SettingsPage.jsx'

function NotFound() {
  return (
    <div className="error-state">
      <h1>Page not found</h1>
      <p>That link doesn’t go anywhere.</p>
      <Link to="/" className="btn btn-secondary">
        Back to the map
      </Link>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <div className="app-shell">
        <Routes>
          {/* Open to everyone: browse the map, read logs, view profiles. */}
          <Route path="/" element={<MapPage />} />
          <Route path="/u/:username" element={<ProfilePage />} />

          {/* Needs an account. */}
          <Route
            path="/log"
            element={
              <RequireAuth reason="Sign in to see your log.">
                <LogPage />
              </RequireAuth>
            }
          />
          <Route
            path="/settings"
            element={
              <RequireAuth reason="Sign in to open your settings.">
                <SettingsPage />
              </RequireAuth>
            }
          />
          <Route path="/profile" element={<ProfileRedirect />} />

          {/* Account screens. */}
          <Route
            path="/login"
            element={
              <GuestOnly>
                <LoginPage />
              </GuestOnly>
            }
          />
          <Route
            path="/register"
            element={
              <GuestOnly>
                <RegisterPage />
              </GuestOnly>
            }
          />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
        <Dock />
      </div>
    </AuthProvider>
  )
}

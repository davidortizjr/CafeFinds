import { NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../lib/auth.jsx'
import { LogIcon, MapIcon, UserIcon } from './icons.jsx'

// Floating tab bar. The highlight slides between tabs; its position comes
// from --slot, so it needs no measuring and no JavaScript animation.
const HIDDEN_ON = ['/login', '/register', '/forgot-password', '/reset-password']

export default function Dock() {
  const { user } = useAuth()
  const { pathname } = useLocation()

  if (HIDDEN_ON.includes(pathname)) return null

  const youPath = user ? `/u/${user.username}` : '/login'
  const slot = pathname === '/' ? 0 : pathname === '/log' ? 1 : pathname === youPath || pathname === '/settings' ? 2 : -1

  const items = [
    { to: '/', label: 'Map', icon: <MapIcon />, end: true },
    { to: '/log', label: 'Log', icon: <LogIcon /> },
    { to: youPath, label: user ? 'You' : 'Sign in', icon: <UserIcon /> }
  ]

  return (
    <nav className="dock" aria-label="Main" style={{ '--slot': Math.max(slot, 0) }}>
      <span className={`dock-pill${slot < 0 ? ' is-hidden' : ''}`} aria-hidden="true" />
      {items.map((item, i) => (
        <NavLink
          key={item.label}
          to={item.to}
          end={item.end}
          className={`dock-item${slot === i ? ' is-active' : ''}`}
          // /settings belongs to the "You" tab, so mark it current there too.
          aria-current={slot === i ? 'page' : undefined}
        >
          {item.icon}
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}

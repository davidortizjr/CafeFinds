import { NavLink } from 'react-router-dom'

const items = [
  {
    to: '/',
    label: 'Map',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Z" strokeLinejoin="round" />
        <path d="M9 4v14M15 6v14" />
      </svg>
    )
  },
  {
    to: '/log',
    label: 'Log',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <rect x="4" y="3" width="16" height="18" rx="2" />
        <path d="M8 8h8M8 12h8M8 16h5" strokeLinecap="round" />
      </svg>
    )
  },
  {
    to: '/profile',
    label: 'You',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <circle cx="12" cy="8" r="3.5" />
        <path d="M5 20c1.4-3.8 4.2-5.7 7-5.7s5.6 1.9 7 5.7" strokeLinecap="round" />
      </svg>
    )
  }
]

export default function BottomNav() {
  return (
    <nav className="bottom-nav">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/'}
          className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
        >
          {item.icon}
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}

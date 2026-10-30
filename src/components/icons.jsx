// Small inline icon set. All use currentColor so they follow the text color.

const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
  focusable: false
}

export const MapIcon = (props) => (
  <svg {...base} {...props}>
    <path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Z" />
    <path d="M9 4v14M15 6v14" />
  </svg>
)

export const LogIcon = (props) => (
  <svg {...base} {...props}>
    <rect x="4.5" y="3" width="15" height="18" rx="3" />
    <path d="M8.5 8h7M8.5 12h7M8.5 16h4" />
  </svg>
)

export const UserIcon = (props) => (
  <svg {...base} {...props}>
    <circle cx="12" cy="8" r="3.6" />
    <path d="M5 20c1.3-3.7 4.1-5.6 7-5.6s5.7 1.9 7 5.6" />
  </svg>
)

export const SearchIcon = (props) => (
  <svg {...base} {...props}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m20 20-3.9-3.9" />
  </svg>
)

export const LocateIcon = (props) => (
  <svg {...base} {...props}>
    <circle cx="12" cy="12" r="3.2" />
    <path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3" />
  </svg>
)

export const CheckIcon = (props) => (
  <svg {...base} strokeWidth={2.2} {...props}>
    <path d="m5 12.5 4.2 4.2L19 7" />
  </svg>
)

export const PlusIcon = (props) => (
  <svg {...base} strokeWidth={2} {...props}>
    <path d="M12 5v14M5 12h14" />
  </svg>
)

export const GearIcon = (props) => (
  <svg {...base} {...props}>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2.8v2.4M12 18.8v2.4M4.3 7.4l2.1 1.2M17.6 15.4l2.1 1.2M4.3 16.6l2.1-1.2M17.6 8.6l2.1-1.2" />
  </svg>
)

export const ChevronIcon = (props) => (
  <svg {...base} {...props}>
    <path d="m9 6 6 6-6 6" />
  </svg>
)

export const BackIcon = (props) => (
  <svg {...base} {...props}>
    <path d="M15 6l-6 6 6 6" />
  </svg>
)

export const LockIcon = (props) => (
  <svg {...base} {...props}>
    <rect x="5" y="10.5" width="14" height="9.5" rx="3" />
    <path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" />
  </svg>
)

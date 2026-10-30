// The "visited" mark: a rubber-stamped ring with a cup in the middle. The
// outline wobbles on purpose so it reads as stamped, not generated. Pass
// `press` right after someone marks a café visited to play the stamp-down.
export default function StampBadge({ size = 52, press = false }) {
  return (
    <div className={`stamp-badge${press ? ' is-pressing' : ''}`} style={{ width: size, height: size }} aria-label="Visited" role="img">
      <svg viewBox="0 0 100 100" fill="none" aria-hidden="true">
        <path
          className="stamp-ring"
          d="M50 6c5 0 6 4 11 5s8-2 12 1 2 8 6 11 6 2 6 8-4 6-5 11 2 8-1 12-8 2-11 6-2 6-8 6-6-4-11-5-8 2-12-1-2-8-6-11-6-2-6-8 4-6 5-11-2-8 1-12 8-2 11-6 2-6 8-6Z"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
        <circle cx="50" cy="50" r="32" stroke="currentColor" strokeWidth="1.2" opacity="0.45" />
        <g stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none">
          <rect x="36" y="42" width="22" height="20" rx="3" />
          <path d="M58 46c5 0 8 2.4 8 6s-3 6-8 6" />
          <path d="M40 34l3-5M47 34l3-5M54 34l3-5" />
        </g>
      </svg>
    </div>
  )
}

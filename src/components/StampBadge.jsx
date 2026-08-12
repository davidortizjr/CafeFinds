// The signature element: a hand-stamped-looking ring, used wherever a cafe
// is marked as visited (sheet header, log entries). Deliberately imperfect —
// a wobble on the ring path — to read as "stamped", not "generated".
export default function StampBadge({ size = 52 }) {
  return (
    <div className="stamp-badge" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" fill="none">
        <path
          d="M50 6c5 0 6 4 11 5s8-2 12 1 2 8 6 11 6 2 6 8-4 6-5 11 2 8-1 12-8 2-11 6-2 6-8 6-6-4-11-5-8 2-12-1-2-8-6-11-6-2-6-8 4-6 5-11-2-8 1-12 8-2 11-6 2-6 8-6Z"
          stroke="var(--gold)"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <circle cx="50" cy="50" r="32" stroke="var(--gold)" strokeWidth="1" opacity="0.6" />
        <g stroke="var(--stamp)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none">
          <rect x="36" y="42" width="22" height="20" rx="2" />
          <path d="M58 46c5 0 8 2.4 8 6s-3 6-8 6" />
          <path d="M40 34l3-5M47 34l3-5M54 34l3-5" />
        </g>
      </svg>
    </div>
  )
}

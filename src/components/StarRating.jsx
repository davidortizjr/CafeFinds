const Star = ({ filled }) => (
  <svg viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5">
    <path
      d="M12 3.5l2.6 5.4 5.9.8-4.3 4.2 1 5.9-5.2-2.8-5.2 2.8 1-5.9L3.5 9.7l5.9-.8L12 3.5Z"
      strokeLinejoin="round"
    />
  </svg>
)

export default function StarRating({ value = 0, onChange, readOnly = false }) {
  if (readOnly) {
    return (
      <span className="star-rating readonly">
        {[1, 2, 3, 4, 5].map((n) => (
          <span key={n} className={n <= value ? 'filled' : ''}>
            <Star filled={n <= value} />
          </span>
        ))}
      </span>
    )
  }

  return (
    <span className="star-rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          className={n <= value ? 'filled' : ''}
          aria-label={`Rate ${n} star${n > 1 ? 's' : ''}`}
          onClick={() => onChange(n)}
        >
          <Star filled={n <= value} />
        </button>
      ))}
    </span>
  )
}

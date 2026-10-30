import { useRef, useState } from 'react'

// Ratings are coffee beans, not stars: five beans, filled left to right.

function Bean() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <g transform="rotate(32 12 12)">
        <ellipse className="bean-body" cx="12" cy="12" rx="6.4" ry="9" />
        <path className="bean-crease" d="M12 3.6c-2.6 3 2.6 5.4 0 8.4s2.6 5.4 0 8.4" />
      </g>
    </svg>
  )
}

const BEANS = [1, 2, 3, 4, 5]

export default function BeanRating({ value = 0, onChange, readOnly = false, size = 'md' }) {
  // Alternates between 'a' and 'b' on every tap so the CSS pop animation
  // restarts without remounting the buttons (which would drop keyboard focus).
  const [pop, setPop] = useState(null)
  const groupRef = useRef(null)

  if (readOnly) {
    return (
      <span className={`beans beans-${size}`} role="img" aria-label={`${value} out of 5`}>
        {BEANS.map((n) => (
          <span key={n} className={`bean${n <= value ? ' is-on' : ''}`}>
            <Bean />
          </span>
        ))}
      </span>
    )
  }

  function choose(n) {
    setPop((p) => (p === 'a' ? 'b' : 'a'))
    onChange(n)
  }

  function onKeyDown(e) {
    const step = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 }[e.key]
    if (!step) return
    e.preventDefault()
    const next = Math.min(5, Math.max(1, (value || 0) + step))
    choose(next)
    groupRef.current?.querySelectorAll('button')[next - 1]?.focus()
  }

  return (
    <div
      ref={groupRef}
      className={`beans beans-${size} is-input`}
      role="radiogroup"
      aria-label="Your rating"
      data-pop={pop ?? undefined}
      onKeyDown={onKeyDown}
    >
      {BEANS.map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={n === value}
          aria-label={`${n} out of 5`}
          tabIndex={n === (value || 1) ? 0 : -1}
          className={`bean${n <= value ? ' is-on' : ''}`}
          style={{ '--i': n - 1 }}
          onClick={() => choose(n)}
        >
          <Bean />
        </button>
      ))}
    </div>
  )
}

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import BeanRating from '../components/BeanRating.jsx'
import StampBadge from '../components/StampBadge.jsx'
import Stats from '../components/Stats.jsx'
import { api } from '../lib/api.js'
import { formatDate } from '../lib/format.js'

// The diary: every café you've marked visited, newest first.
export default function LogPage() {
  const [entries, setEntries] = useState(null)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    setError('')
    api
      .getLog()
      .then((res) => setEntries(res.entries))
      .catch((err) => setError(err.message))
  }, [attempt])

  if (error) {
    return (
      <div className="error-state">
        <h1>Your log didn’t load</h1>
        <p>{error}</p>
        <button className="btn btn-secondary" onClick={() => setAttempt((n) => n + 1)}>
          Try again
        </button>
      </div>
    )
  }

  if (entries === null) {
    return (
      <div className="page">
        <header className="page-head">
          <span className="skeleton" style={{ width: 160, height: 34 }} />
        </header>
        <div className="entry-list">
          {[0, 1, 2].map((i) => (
            <span key={i} className="skeleton entry-skeleton" />
          ))}
        </div>
      </div>
    )
  }

  const reviewed = entries.filter((e) => e.review)
  const avg = reviewed.length
    ? Math.round((reviewed.reduce((a, e) => a + e.review.rating, 0) / reviewed.length) * 10) / 10
    : null

  return (
    <div className="page">
      <header className="page-head">
        <h1>Your log</h1>
      </header>

      <Stats
        items={[
          { label: 'Visited', value: entries.length },
          { label: 'Rated', value: reviewed.length },
          { label: 'Average', value: avg, decimals: 1 }
        ]}
      />

      {entries.length === 0 ? (
        <div className="empty-state">
          <h2>Nothing in your log yet</h2>
          <p>Open a café on the map and mark it visited to start your log.</p>
          <Link to="/" className="btn btn-primary">
            Find a café
          </Link>
        </div>
      ) : (
        <ul className="entry-list">
          {entries.map((e) => (
            <li className="entry" key={e.cafeId}>
              <StampBadge size={44} />
              <div className="entry-main">
                <h2>{e.name}</h2>
                {e.address && <p className="entry-address">{e.address}</p>}
                <div className="entry-meta">
                  {e.review && <BeanRating value={e.review.rating} readOnly size="sm" />}
                  <time dateTime={e.visitedAt}>{formatDate(e.visitedAt)}</time>
                </div>
                {e.review?.text && <p className="entry-note">{e.review.text}</p>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

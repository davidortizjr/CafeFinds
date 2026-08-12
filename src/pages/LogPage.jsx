import { useEffect, useState } from 'react'
import { api } from '../lib/api.js'
import StampBadge from '../components/StampBadge.jsx'
import StarRating from '../components/StarRating.jsx'

function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function LogPage() {
  const [entries, setEntries] = useState(null)

  useEffect(() => {
    api.getLog().then((res) => setEntries(res.entries))
  }, [])

  if (entries === null) {
    return <div className="loading-state">Loading your log…</div>
  }

  const reviewed = entries.filter((e) => e.review)
  const avg = reviewed.length
    ? Math.round((reviewed.reduce((a, e) => a + e.review.rating, 0) / reviewed.length) * 10) / 10
    : '—'

  return (
    <div className="page">
      <div className="top-bar">
        <div>
          <p className="eyebrow">Your log</p>
          <h1>Been there</h1>
        </div>
      </div>

      <div className="stat-row">
        <div className="stat-card">
          <div className="num">{entries.length}</div>
          <div className="label">Visited</div>
        </div>
        <div className="stat-card">
          <div className="num">{reviewed.length}</div>
          <div className="label">Reviewed</div>
        </div>
        <div className="stat-card">
          <div className="num">{avg}</div>
          <div className="label">Avg rating</div>
        </div>
      </div>

      {entries.length === 0 ? (
        <div className="log-empty">
          <h3>Nothing stamped yet</h3>
          <p>Find a coffee shop on the map and mark it as visited to start your log.</p>
        </div>
      ) : (
        <div className="log-list">
          {entries.map((e) => (
            <div className="log-entry" key={e.cafeId}>
              <StampBadge />
              <div className="log-entry-main">
                <h3>{e.name}</h3>
                <div className="log-entry-meta">
                  <span>{formatDate(e.visitedAt)}</span>
                  {e.review && (
                    <>
                      <span>·</span>
                      <StarRating value={e.review.rating} readOnly />
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

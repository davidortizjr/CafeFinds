import { useEffect, useState } from 'react'
import StampBadge from './StampBadge.jsx'
import StarRating from './StarRating.jsx'

export default function CafeSheet({ cafe, onClose, onToggleVisit, onSubmitReview, onDeleteReview }) {
  const [rating, setRating] = useState(cafe.myReview?.rating ?? 0)
  const [text, setText] = useState(cafe.myReview?.text ?? '')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setRating(cafe.myReview?.rating ?? 0)
    setText(cafe.myReview?.text ?? '')
  }, [cafe.id, cafe.myReview])

  async function handleSubmit() {
    if (!rating) return
    setSaving(true)
    try {
      await onSubmitReview(rating, text.trim())
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <div className="sheet-backdrop" onClick={onClose} />
      <div className="sheet" role="dialog" aria-label={cafe.name}>
        <div className="sheet-handle" />
        <div className="sheet-body">
          <div className="sheet-header">
            <div>
              <h2>{cafe.name}</h2>
              {cafe.address && <p className="sheet-address">{cafe.address}</p>}
              <div className="sheet-meta">
                {cafe.avgRating ? (
                  <>
                    <StarRating value={Math.round(cafe.avgRating)} readOnly />
                    <span>
                      {cafe.avgRating} · {cafe.reviewCount} log{cafe.reviewCount === 1 ? '' : 's'}
                    </span>
                  </>
                ) : (
                  <span>No logs yet — be the first</span>
                )}
              </div>
            </div>
            {cafe.visited && <StampBadge size={48} />}
          </div>

          <div className="divider" />

          <button
            type="button"
            className={`visit-toggle${cafe.visited ? ' is-visited' : ''}`}
            onClick={onToggleVisit}
          >
            {cafe.visited ? (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Been here
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="12" cy="12" r="9" />
                </svg>
                Mark as visited
              </>
            )}
          </button>

          <div className="divider" />

          <div className="review-form">
            <label className="eyebrow">Your log</label>
            <div style={{ marginTop: 8 }}>
              <StarRating value={rating} onChange={setRating} />
            </div>
            <textarea
              placeholder="Tasting notes, what you'd order again…"
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={500}
            />
            <button className="btn-primary" disabled={!rating || saving} onClick={handleSubmit}>
              {saving ? 'Saving…' : cafe.myReview ? 'Update log' : 'Save log'}
            </button>
            {cafe.myReview && (
              <button className="btn-text" onClick={onDeleteReview}>
                Delete my log
              </button>
            )}
          </div>

          <div className="divider" />

          <label className="eyebrow">Other logs</label>
          <div style={{ marginTop: 8 }}>
            {cafe.reviews.length === 0 ? (
              <p className="empty-reviews">Nobody else has logged this one yet.</p>
            ) : (
              cafe.reviews.map((r) => (
                <div className="review-item" key={r.id}>
                  <div className="review-item-head">
                    <span className="review-item-name">{r.userName}</span>
                    <StarRating value={r.rating} readOnly />
                  </div>
                  {r.text && <p className="review-item-text">{r.text}</p>}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  )
}

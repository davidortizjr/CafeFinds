import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { prefersReducedMotion } from '../lib/motion.js'
import { plural, timeAgo } from '../lib/format.js'
import Avatar from './Avatar.jsx'
import BeanRating from './BeanRating.jsx'
import { CheckIcon, PlusIcon } from './icons.jsx'
import StampBadge from './StampBadge.jsx'

const CLOSE_MS = 200

export default function CafeSheet({ cafe, user, onClose, onToggleVisit, onSubmitReview, onDeleteReview }) {
  const [rating, setRating] = useState(cafe.myReview?.rating ?? 0)
  const [text, setText] = useState(cafe.myReview?.text ?? '')
  const [busy, setBusy] = useState('') // 'visit' | 'save' | 'delete' | ''
  const [error, setError] = useState('')
  const [stamped, setStamped] = useState(false) // true once this person marks it visited here
  const [closing, setClosing] = useState(false)

  const sheetRef = useRef(null)
  const drag = useRef(null)

  // Start from the person's saved log whenever a different café opens or the saved log changes.
  useEffect(() => {
    setRating(cafe.myReview?.rating ?? 0)
    setText(cafe.myReview?.text ?? '')
    setError('')
  }, [cafe.placeId, cafe.myReview])

  useEffect(() => setStamped(false), [cafe.placeId])

  useEffect(() => {
    sheetRef.current?.focus()
  }, [cafe.placeId])

  function close() {
    if (closing) return
    if (prefersReducedMotion()) return onClose()
    setClosing(true)
    setTimeout(onClose, CLOSE_MS)
  }

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && close()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  // Swipe down on the handle to dismiss; a short pull springs back.
  function onGrabDown(e) {
    if (e.button !== undefined && e.button !== 0) return
    drag.current = { startY: e.clientY, startT: performance.now(), dy: 0 }
    e.currentTarget.setPointerCapture(e.pointerId)
    sheetRef.current.style.transition = 'none'
  }
  function onGrabMove(e) {
    if (!drag.current) return
    drag.current.dy = Math.max(0, e.clientY - drag.current.startY)
    sheetRef.current.style.transform = `translateY(${drag.current.dy}px)`
  }
  function onGrabUp() {
    const d = drag.current
    if (!d) return
    drag.current = null
    const el = sheetRef.current
    el.style.transition = ''
    const velocity = d.dy / Math.max(1, performance.now() - d.startT)
    if (d.dy > 110 || velocity > 0.7) close()
    else el.style.transform = ''
  }

  async function run(kind, action) {
    setBusy(kind)
    setError('')
    try {
      await action()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy('')
    }
  }

  const toggleVisit = () =>
    run('visit', async () => {
      const nowVisited = await onToggleVisit()
      setStamped(nowVisited)
    })
  const saveLog = () => run('save', () => onSubmitReview(rating, text.trim()))
  const deleteLog = () => run('delete', onDeleteReview)

  const loading = Boolean(cafe.loading)
  const disabled = loading || Boolean(busy)

  return (
    <>
      <div className={`sheet-backdrop${closing ? ' is-closing' : ''}`} onClick={close} />
      <div
        ref={sheetRef}
        className={`sheet${closing ? ' is-closing' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={cafe.name}
        tabIndex={-1}
      >
        <div
          className="sheet-grab"
          onPointerDown={onGrabDown}
          onPointerMove={onGrabMove}
          onPointerUp={onGrabUp}
          onPointerCancel={onGrabUp}
        >
          <span className="sheet-handle" />
        </div>

        <div className="sheet-body">
          <header className="sheet-header">
            <div className="sheet-title">
              <h2>{cafe.name}</h2>
              {cafe.address && <p className="sheet-address">{cafe.address}</p>}
            </div>
            {cafe.visited && <StampBadge size={56} press={stamped} />}
          </header>

          <div className="sheet-rating">
            {loading ? (
              <span className="skeleton" style={{ width: 150, height: 20 }} />
            ) : cafe.avgRating ? (
              <>
                <span className="sheet-score">{cafe.avgRating.toFixed(1)}</span>
                <BeanRating value={Math.round(cafe.avgRating)} readOnly />
                <span className="sheet-count">{plural(cafe.reviewCount, 'log')}</span>
              </>
            ) : (
              <span className="sheet-count">No logs yet. Be the first.</span>
            )}
          </div>

          {user ? (
            <>
              <button
                type="button"
                className={`visit-toggle${cafe.visited ? ' is-visited' : ''}`}
                onClick={toggleVisit}
                disabled={disabled}
                aria-pressed={cafe.visited}
              >
                {cafe.visited ? <CheckIcon /> : <PlusIcon />}
                {cafe.visited ? 'Visited' : 'Mark as visited'}
              </button>

              <section className="log-form" aria-labelledby="your-log">
                <h3 id="your-log">Your log</h3>
                <BeanRating value={rating} onChange={setRating} size="lg" />
                <textarea
                  placeholder="What did you order? How was the room?"
                  aria-label="Notes about this café"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  maxLength={500}
                  disabled={disabled}
                />
                {error && (
                  <p className="form-error" role="alert">
                    {error}
                  </p>
                )}
                <div className="log-actions">
                  <button type="button" className="btn btn-primary" disabled={!rating || disabled} onClick={saveLog}>
                    {busy === 'save' ? 'Saving…' : cafe.myReview ? 'Update log' : 'Save log'}
                  </button>
                  {cafe.myReview && (
                    <button type="button" className="btn btn-quiet-danger" disabled={disabled} onClick={deleteLog}>
                      Delete log
                    </button>
                  )}
                </div>
              </section>
            </>
          ) : (
            <section className="guest-cta" aria-labelledby="guest-cta-title">
              <p id="guest-cta-title" className="guest-cta-title">
                Been here?
              </p>
              <p className="guest-cta-text">Sign in to mark it visited and add your rating.</p>
              <div className="guest-cta-actions">
                <Link to="/login" state={{ from: '/' }} className="btn btn-primary">
                  Sign in
                </Link>
                <Link to="/register" state={{ from: '/' }} className="btn btn-secondary">
                  Create account
                </Link>
              </div>
            </section>
          )}

          <section aria-labelledby="recent-logs">
            <h3 id="recent-logs" className="sheet-section-title">
              Recent logs
            </h3>
            {loading ? (
              <div className="log-skeletons">
                <span className="skeleton" style={{ height: 14, width: '60%' }} />
                <span className="skeleton" style={{ height: 14, width: '85%' }} />
              </div>
            ) : cafe.reviews.length === 0 ? (
              <p className="empty-note">
                {cafe.myReview ? 'Yours is the only log so far.' : 'No one else has logged this café yet.'}
              </p>
            ) : (
              <ul className="log-items">
                {cafe.reviews.map((r) => (
                  <li className="log-item" key={r.id}>
                    <Avatar name={r.userName} username={r.username} size={36} />
                    <div className="log-item-main">
                      <div className="log-item-head">
                        {r.username ? (
                          <Link to={`/u/${r.username}`} className="log-item-name">
                            {r.userName}
                          </Link>
                        ) : (
                          <span className="log-item-name">{r.userName}</span>
                        )}
                        <BeanRating value={r.rating} readOnly size="sm" />
                        <time dateTime={r.createdAt}>{timeAgo(r.createdAt)}</time>
                      </div>
                      {r.text && <p className="log-item-text">{r.text}</p>}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </>
  )
}

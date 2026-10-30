import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Avatar from '../components/Avatar.jsx'
import BeanRating from '../components/BeanRating.jsx'
import { GearIcon } from '../components/icons.jsx'
import Stats from '../components/Stats.jsx'
import { api } from '../lib/api.js'
import { useAuth } from '../lib/auth.jsx'
import { formatDate } from '../lib/format.js'

// Anyone can view a profile (/u/<username>): name, bio, stats and ratings.
// Visits without a rating stay private; only the visited count is shown.
export default function ProfilePage() {
  const { username } = useParams()
  const { user: me } = useAuth()
  const [state, setState] = useState({ status: 'loading' })

  useEffect(() => {
    let cancelled = false
    setState({ status: 'loading' })
    api
      .getProfile(username)
      .then((data) => !cancelled && setState({ status: 'ready', data }))
      .catch((err) => !cancelled && setState({ status: err.status === 404 ? 'missing' : 'error', message: err.message }))
    return () => {
      cancelled = true
    }
  }, [username, me?.id])

  if (state.status === 'loading') {
    return (
      <div className="page">
        <div className="profile-head">
          <span className="skeleton" style={{ width: 72, height: 72, borderRadius: '50%' }} />
          <span className="skeleton" style={{ width: 160, height: 30 }} />
        </div>
      </div>
    )
  }

  if (state.status === 'missing') {
    return (
      <div className="error-state">
        <h1>No one here by that name</h1>
        <p>There’s no profile for @{username}. They may have changed their username.</p>
        <Link to="/" className="btn btn-secondary">
          Back to the map
        </Link>
      </div>
    )
  }

  if (state.status === 'error') {
    return (
      <div className="error-state">
        <h1>This profile didn’t load</h1>
        <p>{state.message}</p>
      </div>
    )
  }

  const { user, isMe, stats, reviews } = state.data

  return (
    <div className="page">
      <header className="profile-head">
        <Avatar name={user.name} username={user.username} size={72} />
        <div className="profile-id">
          <h1>{user.name}</h1>
          <p className="profile-handle">@{user.username}</p>
        </div>
      </header>

      {user.bio && <p className="profile-bio">{user.bio}</p>}
      <p className="profile-joined">Joined {new Date(user.joinedAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</p>

      {isMe && (
        <div className="profile-actions">
          <Link to="/settings" className="btn btn-secondary">
            <GearIcon /> Settings
          </Link>
        </div>
      )}

      <Stats
        items={[
          { label: 'Visited', value: stats.visited },
          { label: 'Rated', value: stats.reviewed },
          { label: 'Average', value: stats.avgRating, decimals: 1 }
        ]}
      />

      <section aria-labelledby="profile-logs">
        <h2 id="profile-logs" className="section-title">
          Logs
        </h2>
        {reviews.length === 0 ? (
          <div className="empty-state">
            <h3>{isMe ? 'You haven’t rated a café yet' : `${user.name} hasn’t rated a café yet`}</h3>
            {isMe && (
              <>
                <p>Open a café on the map and add your rating.</p>
                <Link to="/" className="btn btn-primary">
                  Find a café
                </Link>
              </>
            )}
          </div>
        ) : (
          <ul className="entry-list">
            {reviews.map((r) => (
              <li className="entry entry-plain" key={r.id}>
                <div className="entry-main">
                  <h3>{r.cafe.name}</h3>
                  {r.cafe.address && <p className="entry-address">{r.cafe.address}</p>}
                  <div className="entry-meta">
                    <BeanRating value={r.rating} readOnly size="sm" />
                    <time dateTime={r.createdAt}>{formatDate(r.createdAt)}</time>
                  </div>
                  {r.text && <p className="entry-note">{r.text}</p>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

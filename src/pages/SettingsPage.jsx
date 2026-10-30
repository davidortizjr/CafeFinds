import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Field from '../components/Field.jsx'
import { BackIcon, CheckIcon } from '../components/icons.jsx'
import { api } from '../lib/api.js'
import { useAuth } from '../lib/auth.jsx'

function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true
}

// Shows "Saved" for a moment after a successful save.
function useSaved() {
  const [saved, setSaved] = useState(false)
  useEffect(() => {
    if (!saved) return
    const t = setTimeout(() => setSaved(false), 2600)
    return () => clearTimeout(t)
  }, [saved])
  return [saved, setSaved]
}

function Saved({ show }) {
  return (
    <p className={`form-saved${show ? ' is-shown' : ''}`} role="status">
      {show && (
        <>
          <CheckIcon /> Saved
        </>
      )}
    </p>
  )
}

function ProfileForm({ user, setUser }) {
  const [values, setValues] = useState({ name: user.name, username: user.username, bio: user.bio ?? '' })
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [busy, setBusy] = useState(false)
  const [saved, setSaved] = useSaved()

  const dirty = values.name !== user.name || values.username !== user.username || values.bio !== (user.bio ?? '')
  const set = (key) => (e) => {
    setValues((v) => ({ ...v, [key]: e.target.value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    setErrors({})
    setFormError('')
    try {
      const { user: updated } = await api.updateProfile(values)
      setUser(updated)
      setValues({ name: updated.name, username: updated.username, bio: updated.bio ?? '' })
      setSaved(true)
    } catch (err) {
      if (err.field) setErrors({ [err.field]: err.message })
      else setFormError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} noValidate>
      <Field label="Display name" name="name" maxLength={40} autoComplete="name" value={values.name} onChange={set('name')} error={errors.name} />
      <Field
        label="Username"
        name="username"
        maxLength={20}
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        hint={`Your profile is at /u/${values.username.trim().toLowerCase() || 'username'}`}
        value={values.username}
        onChange={set('username')}
        error={errors.username}
      />
      <Field
        label="Bio"
        name="bio"
        multiline
        rows={3}
        maxLength={160}
        placeholder="Your usual order, your favorite roaster…"
        value={values.bio}
        onChange={set('bio')}
        counter={`${values.bio.length}/160`}
      />
      {formError && (
        <p className="form-error" role="alert">
          {formError}
        </p>
      )}
      <div className="form-row">
        <button className="btn btn-primary" disabled={!dirty || busy}>
          {busy ? 'Saving…' : 'Save changes'}
        </button>
        <Saved show={saved} />
      </div>
    </form>
  )
}

function EmailForm({ user, setUser }) {
  const [email, setEmail] = useState(user.email)
  const [currentPassword, setCurrentPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [busy, setBusy] = useState(false)
  const [saved, setSaved] = useSaved()

  const changed = email.trim().toLowerCase() !== user.email

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    setErrors({})
    setFormError('')
    try {
      const { user: updated } = await api.updateProfile({ email, currentPassword })
      setUser(updated)
      setEmail(updated.email)
      setCurrentPassword('')
      setSaved(true)
    } catch (err) {
      if (err.field) setErrors({ [err.field]: err.message })
      else setFormError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} noValidate>
      <Field
        label="Email"
        name="email"
        type="email"
        inputMode="email"
        autoComplete="email"
        autoCapitalize="none"
        spellCheck={false}
        value={email}
        onChange={(e) => {
          setEmail(e.target.value)
          setErrors({})
        }}
        error={errors.email}
      />
      {changed && (
        <Field
          label="Current password"
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          hint="We ask for this when you change your email."
          value={currentPassword}
          onChange={(e) => {
            setCurrentPassword(e.target.value)
            setErrors({})
          }}
          error={errors.currentPassword}
        />
      )}
      {formError && (
        <p className="form-error" role="alert">
          {formError}
        </p>
      )}
      <div className="form-row">
        <button className="btn btn-primary" disabled={!changed || !currentPassword || busy}>
          {busy ? 'Saving…' : 'Update email'}
        </button>
        <Saved show={saved} />
      </div>
    </form>
  )
}

function PasswordForm({ setUser }) {
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [busy, setBusy] = useState(false)
  const [saved, setSaved] = useSaved()

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    setErrors({})
    setFormError('')
    try {
      const { user: updated } = await api.changePassword(current, next)
      setUser(updated)
      setCurrent('')
      setNext('')
      setSaved(true)
    } catch (err) {
      if (err.field) setErrors({ [err.field]: err.message })
      else setFormError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} noValidate>
      <Field
        label="Current password"
        name="currentPassword"
        type="password"
        autoComplete="current-password"
        value={current}
        onChange={(e) => {
          setCurrent(e.target.value)
          setErrors({})
        }}
        error={errors.currentPassword}
      />
      <Field
        label="New password"
        name="newPassword"
        type="password"
        autoComplete="new-password"
        hint="At least 8 characters. Other devices are signed out when you change it."
        value={next}
        onChange={(e) => {
          setNext(e.target.value)
          setErrors({})
        }}
        error={errors.newPassword}
      />
      {formError && (
        <p className="form-error" role="alert">
          {formError}
        </p>
      )}
      <div className="form-row">
        <button className="btn btn-primary" disabled={!current || !next || busy}>
          {busy ? 'Saving…' : 'Update password'}
        </button>
        <Saved show={saved} />
      </div>
    </form>
  )
}

function DeleteAccount({ setUser }) {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await api.deleteAccount(password)
      setUser(null)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  if (!open) {
    return (
      <button type="button" className="btn btn-quiet-danger" onClick={() => setOpen(true)}>
        Delete account
      </button>
    )
  }

  return (
    <form className="danger-form" onSubmit={submit} noValidate>
      <p>This permanently deletes your account, your visited list and every rating you’ve left. It can’t be undone.</p>
      <Field
        label="Confirm with your password"
        name="password"
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={(e) => {
          setPassword(e.target.value)
          setError('')
        }}
        error={error}
      />
      <div className="form-row">
        <button className="btn btn-danger" disabled={!password || busy}>
          {busy ? 'Deleting…' : 'Delete my account'}
        </button>
        <button type="button" className="btn btn-secondary" onClick={() => setOpen(false)}>
          Cancel
        </button>
      </div>
    </form>
  )
}

export default function SettingsPage() {
  const { user, setUser, logout } = useAuth()
  const navigate = useNavigate()

  async function signOut() {
    await logout()
    navigate('/', { replace: true })
  }

  return (
    <div className="page">
      <header className="page-head">
        <Link to={`/u/${user.username}`} className="back-link">
          <BackIcon /> Profile
        </Link>
        <h1>Settings</h1>
      </header>

      <section className="settings-section" aria-labelledby="s-profile">
        <h2 id="s-profile">Profile</h2>
        <ProfileForm user={user} setUser={setUser} />
      </section>

      <section className="settings-section" aria-labelledby="s-email">
        <h2 id="s-email">Email</h2>
        <EmailForm user={user} setUser={setUser} />
      </section>

      <section className="settings-section" aria-labelledby="s-password">
        <h2 id="s-password">Password</h2>
        <PasswordForm setUser={setUser} />
      </section>

      {!isStandalone() && (
        <section className="settings-section" aria-labelledby="s-install">
          <h2 id="s-install">Add to your Home Screen</h2>
          <div className="install-card">
            <p>CaféFinds isn’t in the App Store. Install it from Safari and it opens full-screen like any other app.</p>
            <ol>
              <li>Open this page in Safari on your iPhone.</li>
              <li>Tap the Share button in the toolbar.</li>
              <li>Choose “Add to Home Screen”, then tap Add.</li>
            </ol>
          </div>
        </section>
      )}

      <section className="settings-section" aria-labelledby="s-account">
        <h2 id="s-account">Account</h2>
        <div className="account-actions">
          <button type="button" className="btn btn-secondary" onClick={signOut}>
            Sign out
          </button>
          <DeleteAccount setUser={setUser} />
        </div>
      </section>
    </div>
  )
}

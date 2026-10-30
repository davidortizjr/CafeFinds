import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import AuthShell from '../components/AuthShell.jsx'
import Field from '../components/Field.jsx'
import { api } from '../lib/api.js'
import { useAuth } from '../lib/auth.jsx'

export default function ResetPasswordPage() {
  const [params] = useSearchParams()
  const token = params.get('token') || ''
  const { setUser } = useAuth()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [fieldError, setFieldError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    setFieldError('')
    try {
      const { user } = await api.resetPassword(token, password)
      setUser(user) // the reset signs them in
      navigate('/', { replace: true })
    } catch (err) {
      if (err.field === 'password') setFieldError(err.message)
      else setError(err.message)
      setBusy(false)
    }
  }

  if (!token) {
    return (
      <AuthShell
        title="This link isn’t complete"
        subtitle="Open the link from your reset email again, or request a new one."
        footer={<Link to="/login">Back to sign in</Link>}
      >
        <Link to="/forgot-password" className="btn btn-primary btn-block">
          Request a new link
        </Link>
      </AuthShell>
    )
  }

  return (
    <AuthShell
      title="Choose a new password"
      subtitle="You’ll be signed in as soon as it’s saved."
      footer={<Link to="/login">Back to sign in</Link>}
    >
      <form onSubmit={submit} noValidate>
        <Field
          label="New password"
          name="password"
          type="password"
          autoComplete="new-password"
          hint="At least 8 characters."
          value={password}
          onChange={(e) => {
            setPassword(e.target.value)
            setFieldError('')
          }}
          error={fieldError}
          required
        />
        {error && (
          <p className="form-error" role="alert">
            {error} <Link to="/forgot-password">Request a new link</Link>
          </p>
        )}
        <button className="btn btn-primary btn-block" disabled={busy || !password}>
          {busy ? 'Saving…' : 'Save password'}
        </button>
      </form>
    </AuthShell>
  )
}

import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import AuthShell from '../components/AuthShell.jsx'
import Field from '../components/Field.jsx'
import { useAuth } from '../lib/auth.jsx'

export default function LoginPage() {
  const { login } = useAuth()
  const location = useLocation()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await login(identifier, password) // GuestOnly then sends them on to where they were headed
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  const carry = location.state?.from ? { from: location.state.from } : undefined

  return (
    <AuthShell
      title="Sign in"
      subtitle="Pick up your log where you left it."
      notice={location.state?.reason}
      footer={
        <>
          New here?{' '}
          <Link to="/register" state={carry}>
            Create an account
          </Link>
          <br />
          <Link to="/">Keep browsing as a guest</Link>
        </>
      }
    >
      <form onSubmit={submit} noValidate>
        <Field
          label="Email or username"
          name="identifier"
          autoComplete="username"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="next"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          required
        />
        <Field
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          enterKeyHint="go"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <p className="form-aside">
          <Link to="/forgot-password">Forgot your password?</Link>
        </p>

        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}

        <button className="btn btn-primary btn-block" disabled={busy || !identifier || !password}>
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </AuthShell>
  )
}

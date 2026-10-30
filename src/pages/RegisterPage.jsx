import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import AuthShell from '../components/AuthShell.jsx'
import Field from '../components/Field.jsx'
import { useAuth } from '../lib/auth.jsx'

export default function RegisterPage() {
  const { register } = useAuth()
  const location = useLocation()
  const [values, setValues] = useState({ email: '', username: '', password: '' })
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [busy, setBusy] = useState(false)

  const set = (key) => (e) => {
    setValues((v) => ({ ...v, [key]: e.target.value }))
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    setErrors({})
    setFormError('')
    try {
      await register(values) // GuestOnly then sends them on
    } catch (err) {
      if (err.field) setErrors({ [err.field]: err.message })
      else setFormError(err.message)
      setBusy(false)
    }
  }

  const carry = location.state?.from ? { from: location.state.from } : undefined

  return (
    <AuthShell
      title="Create your account"
      subtitle="Log the cafés you visit and rate what you drank."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" state={carry}>
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={submit} noValidate>
        <Field
          label="Email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          value={values.email}
          onChange={set('email')}
          error={errors.email}
          required
        />
        <Field
          label="Username"
          name="username"
          autoComplete="username"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          maxLength={20}
          hint="3–20 letters, numbers or underscores. This is your profile link."
          value={values.username}
          onChange={set('username')}
          error={errors.username}
          required
        />
        <Field
          label="Password"
          name="password"
          type="password"
          autoComplete="new-password"
          hint="At least 8 characters."
          value={values.password}
          onChange={set('password')}
          error={errors.password}
          required
        />

        {formError && (
          <p className="form-error" role="alert">
            {formError}
          </p>
        )}

        <button className="btn btn-primary btn-block" disabled={busy || !values.email || !values.username || !values.password}>
          {busy ? 'Creating account…' : 'Create account'}
        </button>
      </form>
    </AuthShell>
  )
}

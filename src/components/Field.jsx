import { useId, useState } from 'react'

// One labelled form control: text input, password input with a show/hide
// toggle, or textarea. Errors are announced and tied to the control.
export default function Field({ label, error, hint, multiline = false, type = 'text', className = '', counter, ...props }) {
  const id = useId()
  const [revealed, setRevealed] = useState(false)
  const isPassword = type === 'password'
  const describedBy = [error && `${id}-error`, hint && `${id}-hint`].filter(Boolean).join(' ') || undefined
  const shared = { id, 'aria-invalid': error ? true : undefined, 'aria-describedby': describedBy, ...props }

  return (
    <div className={`field${error ? ' has-error' : ''} ${className}`}>
      <label htmlFor={id}>{label}</label>
      <div className="field-control">
        {multiline ? (
          <textarea {...shared} />
        ) : (
          <input {...shared} type={isPassword && revealed ? 'text' : type} />
        )}
        {isPassword && (
          <button
            type="button"
            className="field-toggle"
            aria-pressed={revealed}
            onClick={() => setRevealed((v) => !v)}
          >
            {revealed ? 'Hide' : 'Show'}
          </button>
        )}
      </div>
      {error && (
        <p className="field-error" id={`${id}-error`} role="alert">
          {error}
        </p>
      )}
      {hint && !error && (
        <p className="field-hint" id={`${id}-hint`}>
          {hint}
        </p>
      )}
      {counter && <p className="field-counter">{counter}</p>}
    </div>
  )
}

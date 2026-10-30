// Shared frame for sign in, create account, forgot and reset password.
// The steaming cup is the one looping animation in the app; it only plays
// here, where nothing else is competing for attention.

function SteamCup() {
  return (
    <svg className="steam-cup" viewBox="0 0 120 110" fill="none" aria-hidden="true">
      <g className="steam" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round">
        <path className="steam-1" d="M44 30c-5-6 5-10 0-17" />
        <path className="steam-2" d="M60 30c-5-6 5-10 0-17" />
        <path className="steam-3" d="M76 30c-5-6 5-10 0-17" />
      </g>
      <g className="cup">
        <path d="M30 42h60v22c0 14-11 25-25 25h-10c-14 0-25-11-25-25V42Z" fill="currentColor" />
        <path d="M90 49h5c6 0 10 4 10 9s-4 9-10 9h-6" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
        <path d="M24 98h72" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
      </g>
    </svg>
  )
}

export default function AuthShell({ title, subtitle, notice, children, footer }) {
  return (
    <main className="auth">
      <div className="auth-hero">
        <SteamCup />
        <p className="wordmark">CaféFinds</p>
      </div>

      <div className="auth-card">
        <h1>{title}</h1>
        {subtitle && <p className="auth-sub">{subtitle}</p>}
        {notice && <p className="auth-notice">{notice}</p>}
        {children}
      </div>

      {footer && <p className="auth-foot">{footer}</p>}
    </main>
  )
}

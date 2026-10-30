// Password-reset email. Uses Resend's REST API when RESEND_API_KEY is set.
// Without a key, local development prints the link to the server console so
// the flow can still be tested; production never logs the link.

const isProd = process.env.NODE_ENV === 'production'

export function appUrl() {
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/$/, '')
  // Vercel exposes the production domain (no protocol) as a system variable.
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  return 'http://localhost:5173'
}

export async function sendPasswordResetEmail(to, link) {
  const key = process.env.RESEND_API_KEY

  if (!key) {
    if (isProd) {
      console.error('[mail] RESEND_API_KEY is not set, so the password reset email was not sent.')
    } else {
      console.log(`[mail] Password reset link for ${to}:\n${link}`)
    }
    return
  }

  const from = process.env.EMAIL_FROM || 'CaféFinds <onboarding@resend.dev>'
  const text = `Someone asked to reset the password for your CaféFinds account.\n\nChoose a new password (the link works for one hour):\n${link}\n\nIf this wasn't you, you can ignore this email and your password stays the same.`
  const html = `<div style="font-family:system-ui,sans-serif;max-width:420px;margin:0 auto;padding:24px;color:#1c1410">
  <h1 style="font-size:22px;margin:0 0 12px">Reset your password</h1>
  <p style="line-height:1.5;margin:0 0 20px">Someone asked to reset the password for your CaféFinds account. The link works for one hour.</p>
  <p style="margin:0 0 20px"><a href="${link}" style="display:inline-block;background:#d2303f;color:#fff;text-decoration:none;padding:12px 20px;border-radius:999px;font-weight:600">Choose a new password</a></p>
  <p style="line-height:1.5;color:#5e655f;font-size:13px;margin:0">If this wasn't you, ignore this email and your password stays the same.</p>
</div>`

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to, subject: 'Reset your CaféFinds password', html, text })
    })
    if (!res.ok) console.error('[mail] Resend rejected the email:', res.status, await res.text())
  } catch (err) {
    // Swallow: the caller always answers the same way so we never reveal which emails have accounts.
    console.error('[mail] Could not reach Resend:', err.message)
  }
}

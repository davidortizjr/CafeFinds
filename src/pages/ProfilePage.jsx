import { useEffect, useState } from 'react'
import { api } from '../lib/api.js'

function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true
}

export default function ProfilePage() {
  const [name, setName] = useState('')
  const [saved, setSaved] = useState(true)
  const installed = isStandalone()

  useEffect(() => {
    api.me().then(({ user }) => setName(user.name))
  }, [])

  useEffect(() => {
    if (saved) return
    const t = setTimeout(() => {
      api.updateName(name).then(() => setSaved(true))
    }, 500)
    return () => clearTimeout(t)
  }, [name, saved])

  return (
    <div className="page">
      <div className="top-bar">
        <div>
          <p className="eyebrow">Profile</p>
          <h1>You</h1>
        </div>
      </div>

      <div className="profile-field">
        <label htmlFor="name">Display name</label>
        <input
          id="name"
          value={name}
          onChange={(e) => {
            setName(e.target.value)
            setSaved(false)
          }}
          maxLength={40}
          placeholder="Your name"
        />
      </div>

      {!installed && (
        <div className="install-card">
          <h3>Add CaféFinds to your Home Screen</h3>
          <p>The app isn't in the App Store yet — install it straight from Safari instead. It'll open full-screen, just like a native app.</p>
          <div className="steps">
            <div><span className="k">1</span>Open this page in Safari on your iPhone.</div>
            <div><span className="k">2</span>Tap the Share icon in the toolbar.</div>
            <div><span className="k">3</span>Scroll down and tap "Add to Home Screen".</div>
            <div><span className="k">4</span>Tap "Add" — CaféFinds now lives on your Home Screen.</div>
          </div>
        </div>
      )}
    </div>
  )
}

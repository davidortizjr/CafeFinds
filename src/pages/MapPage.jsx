import { useCallback, useEffect, useRef, useState } from 'react'
import { useGoogleMaps } from '../hooks/useGoogleMaps.js'
import { api } from '../lib/api.js'
import { useAuth } from '../lib/auth.jsx'
import CafeSheet from '../components/CafeSheet.jsx'
import { LocateIcon } from '../components/icons.jsx'
import MapView from '../components/MapView.jsx'
import { PageLoader } from '../components/RouteGuards.jsx'
import SearchBar from '../components/SearchBar.jsx'

// What a café looks like before anyone has logged it: just the Google place.
const emptyCafe = (place) => ({
  id: null,
  placeId: place.placeId,
  name: place.name,
  address: place.address ?? null,
  lat: place.lat,
  lng: place.lng,
  avgRating: null,
  reviewCount: 0,
  visited: false,
  myReview: null,
  reviews: []
})

// Anyone can open a café and read its logs. Marking visited and rating are
// for signed-in people; the sheet shows a sign-in prompt to everyone else.
export default function MapPage() {
  const { google, isLoaded, error } = useGoogleMaps()
  const { user } = useAuth()
  const mapViewRef = useRef(null)
  const openToken = useRef(0)
  const [visitedIds, setVisitedIds] = useState(new Set())
  const [selectedCafe, setSelectedCafe] = useState(null)

  useEffect(() => {
    if (!user) {
      setVisitedIds(new Set())
      return
    }
    let cancelled = false
    api
      .getLog()
      .then(({ entries }) => !cancelled && setVisitedIds(new Set(entries.map((e) => e.placeId))))
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [user?.id])

  const openCafe = useCallback(async (place) => {
    const token = ++openToken.current
    // Open at once with what Google gave us; the logs fill in when they arrive.
    setSelectedCafe({ ...emptyCafe(place), loading: true })
    try {
      const cafe = await api.getCafe(place.placeId)
      if (token === openToken.current) setSelectedCafe(cafe)
    } catch (err) {
      if (token !== openToken.current) return
      setSelectedCafe(emptyCafe(place)) // 404 just means nobody has logged it yet
      if (err.status !== 404) console.error(err)
    }
  }, [])

  // Cafés are only saved to our database once a signed-in person acts on them.
  async function ensureCafe() {
    if (selectedCafe.id) return selectedCafe
    const { placeId, name, address, lat, lng } = selectedCafe
    return api.upsertCafe({ placeId, name, address, lat, lng })
  }

  const patchSelected = (placeId, patch) =>
    setSelectedCafe((c) => (c && c.placeId === placeId ? (typeof patch === 'function' ? patch(c) : { ...c, ...patch }) : c))

  async function handleToggleVisit() {
    const cafe = await ensureCafe()
    const { visited } = await api.toggleVisit(cafe.id)
    patchSelected(cafe.placeId, { id: cafe.id, visited })
    setVisitedIds((prev) => {
      const next = new Set(prev)
      visited ? next.add(cafe.placeId) : next.delete(cafe.placeId)
      return next
    })
    return visited
  }

  async function handleSubmitReview(rating, text) {
    const cafe = await ensureCafe()
    await api.upsertReview(cafe.id, rating, text)
    const refreshed = await api.getCafe(cafe.placeId)
    patchSelected(cafe.placeId, () => refreshed)
    setVisitedIds((prev) => new Set(prev).add(cafe.placeId))
  }

  async function handleDeleteReview() {
    if (!selectedCafe?.id) return
    const { id, placeId } = selectedCafe
    await api.deleteReview(id)
    const refreshed = await api.getCafe(placeId)
    patchSelected(placeId, () => refreshed)
  }

  if (error) {
    return (
      <div className="error-state">
        <h1>The map didn’t load</h1>
        <p>
          Check that <code>VITE_GOOGLE_MAPS_API_KEY</code> is set and that the Maps JavaScript API and Places API are
          turned on for it.
        </p>
      </div>
    )
  }

  if (!isLoaded) return <PageLoader />

  return (
    <div className="app-main">
      <SearchBar google={google} map={mapViewRef.current} onPlaceSelected={openCafe} />
      <MapView ref={mapViewRef} google={google} visitedIds={visitedIds} onCafeClick={openCafe} />

      <button className="locate-btn" onClick={() => mapViewRef.current?.panToUser()} aria-label="Go to my location">
        <LocateIcon />
      </button>

      {selectedCafe && (
        <CafeSheet
          cafe={selectedCafe}
          user={user || null}
          onClose={() => setSelectedCafe(null)}
          onToggleVisit={handleToggleVisit}
          onSubmitReview={handleSubmitReview}
          onDeleteReview={handleDeleteReview}
        />
      )}
    </div>
  )
}

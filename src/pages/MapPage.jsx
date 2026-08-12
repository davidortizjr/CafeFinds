import { useCallback, useEffect, useRef, useState } from 'react'
import { useGoogleMaps } from '../hooks/useGoogleMaps.js'
import { api } from '../lib/api.js'
import MapView from '../components/MapView.jsx'
import SearchBar from '../components/SearchBar.jsx'
import CafeSheet from '../components/CafeSheet.jsx'

export default function MapPage() {
  const { google, isLoaded, error } = useGoogleMaps()
  const mapViewRef = useRef(null)
  const [visitedIds, setVisitedIds] = useState(new Set())
  const [selectedCafe, setSelectedCafe] = useState(null)
  const [sheetLoading, setSheetLoading] = useState(false)

  useEffect(() => {
    api
      .getLog()
      .then(({ entries }) => setVisitedIds(new Set(entries.map((e) => e.placeId))))
      .catch(() => {})
  }, [])

  const openCafe = useCallback(async (placeSummary) => {
    setSheetLoading(true)
    try {
      const cafe = await api.upsertCafe(placeSummary)
      setSelectedCafe(cafe)
    } catch (err) {
      console.error(err)
    } finally {
      setSheetLoading(false)
    }
  }, [])

  async function handleToggleVisit() {
    if (!selectedCafe) return
    const { visited } = await api.toggleVisit(selectedCafe.id)
    setSelectedCafe((c) => ({ ...c, visited }))
    setVisitedIds((prev) => {
      const next = new Set(prev)
      visited ? next.add(selectedCafe.placeId) : next.delete(selectedCafe.placeId)
      return next
    })
  }

  async function handleSubmitReview(rating, text) {
    if (!selectedCafe) return
    await api.upsertReview(selectedCafe.id, rating, text)
    const refreshed = await api.getCafe(selectedCafe.placeId)
    setSelectedCafe(refreshed)
    setVisitedIds((prev) => new Set(prev).add(selectedCafe.placeId))
  }

  async function handleDeleteReview() {
    if (!selectedCafe) return
    await api.deleteReview(selectedCafe.id)
    const refreshed = await api.getCafe(selectedCafe.placeId)
    setSelectedCafe(refreshed)
  }

  if (error) {
    return (
      <div className="error-state">
        Couldn't load Google Maps. Check that VITE_GOOGLE_MAPS_API_KEY is set and the Maps
        JavaScript API + Places API are enabled for it.
      </div>
    )
  }

  if (!isLoaded) {
    return <div className="loading-state">Loading map…</div>
  }

  return (
    <div className="app-main">
      <SearchBar google={google} map={mapViewRef.current} onPlaceSelected={openCafe} />
      <MapView ref={mapViewRef} google={google} visitedIds={visitedIds} onCafeClick={openCafe} />

      <button className="locate-btn" onClick={() => mapViewRef.current?.panToUser()} aria-label="Find my location">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2v3M12 19v3M2 12h3M19 12h3" strokeLinecap="round" />
        </svg>
      </button>

      {selectedCafe && !sheetLoading && (
        <CafeSheet
          cafe={selectedCafe}
          onClose={() => setSelectedCafe(null)}
          onToggleVisit={handleToggleVisit}
          onSubmitReview={handleSubmitReview}
          onDeleteReview={handleDeleteReview}
        />
      )}
    </div>
  )
}

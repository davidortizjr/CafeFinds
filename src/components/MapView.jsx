import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'

const FALLBACK_CENTER = { lat: 40.7128, lng: -74.006 } // used only if geolocation is denied

const MapView = forwardRef(function MapView({ google, visitedIds, onCafeClick }, ref) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const markersRef = useRef(new Map()) // placeId -> marker
  const searchTimeout = useRef(null)
  const visitedIdsRef = useRef(visitedIds)

  visitedIdsRef.current = visitedIds

  useImperativeHandle(ref, () => ({
    panToUser() {
      if (!mapRef.current || !navigator.geolocation) return
      navigator.geolocation.getCurrentPosition((pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        mapRef.current.panTo(loc)
        mapRef.current.setZoom(15)
      })
    }
  }))

  function markerIcon(visited) {
    const fill = visited ? '#2f5d50' : '#1f1b16'
    return {
      path: 'M0,-9 C5,-9 8,-5.5 8,-1.5 C8,3.5 0,10 0,10 C0,10 -8,3.5 -8,-1.5 C-8,-5.5 -5,-9 0,-9 Z',
      fillColor: fill,
      fillOpacity: 1,
      strokeColor: visited ? '#c08a3e' : '#f7f3ec',
      strokeWeight: visited ? 1.5 : 1,
      scale: 1.6,
      anchor: new google.maps.Point(0, 10)
    }
  }

  function runNearbySearch() {
    if (!mapRef.current) return
    const service = new google.maps.places.PlacesService(mapRef.current)
    service.nearbySearch(
      { bounds: mapRef.current.getBounds(), type: 'cafe' },
      (results, status) => {
        if (status !== google.maps.places.PlacesServiceStatus.OK || !results) return

        const seen = new Set()
        results.forEach((place) => {
          if (!place.place_id || !place.geometry) return
          seen.add(place.place_id)

          const visited = visitedIdsRef.current.has(place.place_id)
          const existing = markersRef.current.get(place.place_id)

          if (existing) {
            existing.setIcon(markerIcon(visited))
            return
          }

          const marker = new google.maps.Marker({
            position: place.geometry.location,
            map: mapRef.current,
            title: place.name,
            icon: markerIcon(visited)
          })
          marker.addListener('click', () => {
            onCafeClick({
              placeId: place.place_id,
              name: place.name,
              address: place.vicinity,
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng()
            })
          })
          markersRef.current.set(place.place_id, marker)
        })

        // Drop markers for places that scrolled out of the result set.
        markersRef.current.forEach((marker, placeId) => {
          if (!seen.has(placeId)) {
            marker.setMap(null)
            markersRef.current.delete(placeId)
          }
        })
      }
    )
  }

  // Recolor existing markers immediately when the visited set changes
  // (e.g. right after the user taps "Mark as visited").
  useEffect(() => {
    markersRef.current.forEach((marker, placeId) => {
      marker.setIcon(markerIcon(visitedIds.has(placeId)))
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visitedIds])

  useEffect(() => {
    if (!google || !containerRef.current || mapRef.current) return

    const map = new google.maps.Map(containerRef.current, {
      center: FALLBACK_CENTER,
      zoom: 14,
      disableDefaultUI: true,
      gestureHandling: 'greedy',
      styles: MAP_STYLE
    })
    mapRef.current = map

    map.addListener('idle', () => {
      clearTimeout(searchTimeout.current)
      searchTimeout.current = setTimeout(runNearbySearch, 350)
    })

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => map.setCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {} // silently keep the fallback center if permission is denied
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [google])

  return <div ref={containerRef} className="map-canvas" />
})

export default MapView

// A quiet, low-contrast map theme so the paper/ink UI stays the focal point
// rather than default Google Maps blues and greens.
const MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#f7f3ec' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#6b6154' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#f7f3ec' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#e1d8c4' }] },
  { featureType: 'road', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#dfe3df' }] },
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#d8cdb4' }] }
]

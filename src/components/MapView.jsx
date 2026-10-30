import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import { prefersReducedMotion } from '../lib/motion.js'

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

  // Roast-brown pins for places you haven't been, leaf green for ones you have.
  function markerIcon(visited) {
    return {
      path: 'M0,-9 C5,-9 8,-5.5 8,-1.5 C8,3.5 0,10 0,10 C0,10 -8,3.5 -8,-1.5 C-8,-5.5 -5,-9 0,-9 Z',
      fillColor: visited ? '#2f7a55' : '#1c1410',
      fillOpacity: 1,
      strokeColor: '#fafbf8',
      strokeWeight: 1.6,
      scale: 1.7,
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
        // Pins drop in one after another the first time the map fills up;
        // after that they simply appear, so panning stays calm.
        const dropIn = markersRef.current.size === 0 && !prefersReducedMotion()
        let dropIndex = 0

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
            map: dropIn ? null : mapRef.current,
            title: place.name,
            icon: markerIcon(visited),
            animation: dropIn ? google.maps.Animation.DROP : null
          })
          if (dropIn) {
            setTimeout(() => {
              if (markersRef.current.get(place.place_id) === marker) marker.setMap(mapRef.current)
            }, dropIndex++ * 45)
          }
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

// A quiet, cool map theme so the pins and the sheet are what you notice.
// Parks stay faintly visible; businesses and transit are hidden.
const MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#e8ebe5' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#5e655f' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#eef0ea' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ visibility: 'on' }, { color: '#d9e4d5' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#fafbf8' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#d9ded7' }] },
  { featureType: 'road', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#cddad8' }] },
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#d3d9d0' }] }
]

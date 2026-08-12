import { useEffect, useRef } from 'react'

export default function SearchBar({ google, map, onPlaceSelected }) {
  const inputRef = useRef(null)
  const autocompleteRef = useRef(null)

  useEffect(() => {
    if (!google || !inputRef.current || autocompleteRef.current) return

    const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
      types: ['cafe'],
      fields: ['place_id', 'name', 'geometry', 'formatted_address']
    })

    if (map) autocomplete.bindTo('bounds', map)

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace()
      if (!place.geometry) return
      onPlaceSelected({
        placeId: place.place_id,
        name: place.name,
        address: place.formatted_address,
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng()
      })
      inputRef.current.value = ''
      inputRef.current.blur()
    })

    autocompleteRef.current = autocomplete
  }, [google, map, onPlaceSelected])

  return (
    <div className="search-bar">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" strokeLinecap="round" />
      </svg>
      <input ref={inputRef} type="text" placeholder="Search coffee shops" autoComplete="off" />
    </div>
  )
}

import { useEffect, useRef } from 'react'
import { SearchIcon } from './icons.jsx'

export default function SearchBar({ google, map, onPlaceSelected }) {
  const inputRef = useRef(null)
  const autocompleteRef = useRef(null)
  const onPlaceSelectedRef = useRef(onPlaceSelected)
  onPlaceSelectedRef.current = onPlaceSelected

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
      onPlaceSelectedRef.current({
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
  }, [google, map])

  return (
    <div className="search-bar">
      <SearchIcon />
      <input
        ref={inputRef}
        type="text"
        placeholder="Search coffee shops"
        aria-label="Search coffee shops"
        autoComplete="off"
      />
    </div>
  )
}

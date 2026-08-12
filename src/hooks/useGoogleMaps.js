import { useEffect, useState } from 'react'
import { Loader } from '@googlemaps/js-api-loader'

let loaderPromise = null

function loadGoogleMaps() {
  if (!loaderPromise) {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
    const loader = new Loader({
      apiKey,
      version: 'weekly',
      libraries: ['places', 'marker']
    })
    loaderPromise = loader.load()
  }
  return loaderPromise
}

// Loads the Maps JS API exactly once for the app's lifetime and exposes
// {google, isLoaded, error} so components can wait for it.
export function useGoogleMaps() {
  const [state, setState] = useState({ google: null, isLoaded: false, error: null })

  useEffect(() => {
    let cancelled = false

    if (!import.meta.env.VITE_GOOGLE_MAPS_API_KEY) {
      setState({ google: null, isLoaded: false, error: 'Missing VITE_GOOGLE_MAPS_API_KEY' })
      return
    }

    loadGoogleMaps()
      .then((google) => {
        if (!cancelled) setState({ google, isLoaded: true, error: null })
      })
      .catch((err) => {
        if (!cancelled) setState({ google: null, isLoaded: false, error: err.message })
      })

    return () => {
      cancelled = true
    }
  }, [])

  return state
}

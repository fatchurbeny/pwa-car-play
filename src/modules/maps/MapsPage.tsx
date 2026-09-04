import { useCallback, useEffect, useRef, useState } from 'react'
import { Map as MapLibreMap, Marker, setWorkerUrl } from 'maplibre-gl'
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'
import 'maplibre-gl/dist/maplibre-gl.css'

setWorkerUrl(workerUrl)

type LocationState = 'requesting' | 'granted' | 'denied' | 'unsupported'
const mapStyle = `https://api.maptiler.com/maps/streets-v2-dark/style.json?key=${import.meta.env.VITE_MAPTILER_API_KEY}`

export function MapsPage() {
  const container = useRef<HTMLDivElement>(null)
  const map = useRef<MapLibreMap>()
  const marker = useRef<Marker>()
  const position = useRef<[number, number]>()
  const [locationState, setLocationState] = useState<LocationState>(() => navigator.geolocation ? 'requesting' : 'unsupported')
  const [hasPosition, setHasPosition] = useState(false)
  const [mapError, setMapError] = useState(false)

  const recenter = useCallback(() => {
    if (position.current) map.current?.flyTo({ center: position.current, zoom: 15, essential: true })
  }, [])

  useEffect(() => {
    if (!container.current) return
    const instance = new MapLibreMap({ container: container.current, style: mapStyle, center: [0, 0], zoom: 2 })
    map.current = instance
    instance.once('error', () => setMapError(true))

    if (!navigator.geolocation) {
      return () => instance.remove()
    }

    const watchId = navigator.geolocation.watchPosition(
      ({ coords }) => {
        const next: [number, number] = [coords.longitude, coords.latitude]
        position.current = next
        setHasPosition(true)
        if (!marker.current) marker.current = new Marker({ color: '#4285f4' }).setLngLat(next).addTo(instance)
        else marker.current.setLngLat(next)
        instance.flyTo({ center: next, zoom: 15, essential: true })
        setLocationState('granted')
      },
      ({ code }) => setLocationState(code === GeolocationPositionError.PERMISSION_DENIED ? 'denied' : 'requesting'),
      { enableHighAccuracy: true, maximumAge: 10_000, timeout: 15_000 },
    )

    return () => {
      navigator.geolocation.clearWatch(watchId)
      instance.remove()
    }
  }, [])

  if (!import.meta.env.VITE_MAPTILER_API_KEY) return <section className="map-message"><h1>Peta belum dikonfigurasi</h1><p>Tambahkan API key MapTiler untuk memulai.</p></section>

  const locationMessage = locationState === 'denied' ? 'Izin lokasi ditolak. Aktifkan di pengaturan Safari untuk melihat posisi Anda.' : locationState === 'unsupported' ? 'Perangkat ini tidak mendukung lokasi.' : null

  return <section className="map-page">
    <div aria-label="Peta" className="map-canvas" ref={container} />
    {mapError && <div className="map-banner" role="alert">Peta sementara tidak tersedia.</div>}
    {locationMessage && <div className="map-banner" role="alert">{locationMessage}</div>}
    <button className="map-recenter" type="button" onClick={recenter} disabled={!hasPosition} aria-label="Tengah ke lokasi saya">⌖</button>
  </section>
}

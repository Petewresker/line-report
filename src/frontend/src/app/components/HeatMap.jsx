'use client'

import { useEffect, useRef } from 'react'

// Mock heatmap points: [lat, lng, intensity]
const heatPoints = [
  [14.0707, 100.6056, 0.9],
  [14.0715, 100.6070, 0.7],
  [14.0698, 100.6040, 0.8],
  [14.0720, 100.6045, 0.5],
  [14.0690, 100.6065, 0.6],
  [14.0730, 100.6080, 0.4],
  [14.0680, 100.6030, 0.7],
  [14.0710, 100.6090, 0.3],
  [14.0725, 100.6020, 0.5],
  [14.0695, 100.6075, 0.8],
  [14.0740, 100.6060, 0.6],
  [14.0705, 100.6035, 0.9],
  [14.0685, 100.6085, 0.4],
  [14.0715, 100.6050, 0.7],
  [14.0700, 100.6010, 0.5],
]

export default function HeatMap() {
  const mapRef = useRef(null)
  const instanceRef = useRef(null)

  useEffect(() => {
    let map = null

    const init = async () => {
      const L = (await import('leaflet')).default
      await import('leaflet/dist/leaflet.css')
      await import('leaflet.heat')

      // Fix default marker icons
      delete L.Icon.Default.prototype._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      if (!mapRef.current || mapRef.current._leaflet_id) return

      map = L.map(mapRef.current, {
        center: [14.0707, 100.6056],
        zoom: 15,
        zoomControl: true,
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(map)

      L.heatLayer(heatPoints, {
        radius: 35,
        blur: 25,
        maxZoom: 17,
        gradient: { 0.2: '#3B82F6', 0.5: '#F59E0B', 0.8: '#EF4444' },
      }).addTo(map)

      instanceRef.current = map
    }

    init()

    return () => {
      map?.remove()
      instanceRef.current = null
    }
  }, [])

  return <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
}

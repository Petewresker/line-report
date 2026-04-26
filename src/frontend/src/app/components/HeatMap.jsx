'use client'

import { useEffect, useRef } from 'react'

export default function HeatMap({ points = [] }) {
  const mapRef = useRef(null)
  const instanceRef = useRef(null)
  const heatLayerRef = useRef(null)

  useEffect(() => {
    let map = null

    const init = async () => {
      const L = (await import('leaflet')).default
      await import('leaflet/dist/leaflet.css')
      await import('leaflet.heat')

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

      const maxCount = Math.max(...points.map((p) => p.count), 1)
      const heatPoints = points.map((p) => [p.lat, p.lon, p.count / maxCount])

      heatLayerRef.current = L.heatLayer(heatPoints, {
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
      heatLayerRef.current = null
    }
  }, [])

  // อัปเดต heatmap เมื่อ points เปลี่ยน
  useEffect(() => {
    if (!instanceRef.current || !heatLayerRef.current || points.length === 0) return
    const maxCount = Math.max(...points.map((p) => p.count), 1)
    const heatPoints = points.map((p) => [p.lat, p.lon, p.count / maxCount])
    heatLayerRef.current.setLatLngs(heatPoints)
  }, [points])

  return <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
}

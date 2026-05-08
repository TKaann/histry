import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import './EventMap.css'

// Fix default marker icons
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

export default function EventMap({ lat, lng, locationName }) {
  const mapRef = useRef(null)
  const instanceRef = useRef(null)

  useEffect(() => {
    if (!lat || !lng || instanceRef.current) return

    instanceRef.current = L.map(mapRef.current, {
      center: [lat, lng],
      zoom: 5,
      zoomControl: true,
      attributionControl: false,
      scrollWheelZoom: false,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(instanceRef.current)

    L.marker([lat, lng])
      .addTo(instanceRef.current)
      .bindPopup(`<b>${locationName || ''}</b>`)
      .openPopup()

    return () => {
      instanceRef.current?.remove()
      instanceRef.current = null
    }
  }, [lat, lng, locationName])

  if (!lat || !lng) return null

  return (
    <div className="event-map">
      <div ref={mapRef} className="event-map__container" />
    </div>
  )
}

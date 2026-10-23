import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import { Link } from 'react-router-dom'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import MapPlaceholder from '../MapPlaceholder'
import { getCommunityImage } from '../../data/locationLoader'
import styles from './LocationMap.module.css'

/* ── Icono DivIcon para evitar el problema de rutas de Leaflet en Vite ── */
function createIcon(isHighlighted) {
  return L.divIcon({
    className: '',
    html: `<div style="
      width:18px;height:18px;
      background:${isHighlighted ? 'var(--color-red,#D10000)' : '#00205B'};
      border:2px solid #fff;
      border-radius:50%;
      box-shadow:0 2px 4px rgba(0,0,0,.4);
      transition:transform .15s ease,background .15s ease;
      transform:${isHighlighted ? 'scale(1.5)' : 'scale(1)'};
    "></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
    popupAnchor: [0, -12],
  })
}

/* ── Ajuste automático de vista a los pines ─────────────── */
function BoundsController({ communities }) {
  const map = useMap()
  useEffect(() => {
    const valid = communities.filter(c => c.location)
    if (!valid.length) return
    const bounds = L.latLngBounds(valid.map(c => [c.location.lat, c.location.lng]))
    map.fitBounds(bounds, { padding: [24, 24], maxZoom: 13 })
  }, [communities, map])
  return null
}

function formatPrice(priceFrom) {
  if (!priceFrom) return null
  return `From the $${Math.floor(priceFrom / 1000)}s`
}

function LocationMapInner({
  communities,
  center,
  hoveredSlug,
  onPinEnter,
  onPinLeave,
  onPinClick,
}) {
  const withCoords = communities.filter(c => c.location)

  if (!withCoords.length) {
    return <MapPlaceholder />
  }

  /* Centro de fallback si no hay bounds todavía */
  const defaultCenter = center
    ? [center.lat, center.lng]
    : [withCoords[0].location.lat, withCoords[0].location.lng]

  return (
    <MapContainer
      center={defaultCenter}
      zoom={9}
      className={styles.mapContainer}
      aria-label="Map of communities"
      zoomControl
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors'
        maxZoom={19}
      />

      <BoundsController communities={communities} />

      {withCoords.map(comm => {
        const isHighlighted = comm.slug === hoveredSlug
        const href = `/${comm.stateSlug}/${comm.areaSlug}/${comm.citySlug}/${comm.slug}`

        return (
          <Marker
            key={comm.slug}
            position={[comm.location.lat, comm.location.lng]}
            icon={createIcon(isHighlighted)}
            eventHandlers={{
              mouseover: () => onPinEnter?.(comm.slug),
              mouseout:  () => onPinLeave?.(),
              click:     () => onPinClick?.(comm.slug),
            }}
          >
            <Popup>
              {getCommunityImage(comm) && (
                <img
                  src={getCommunityImage(comm)}
                  alt=""
                  className={styles.popupImg}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  onError={e => { e.currentTarget.style.display = 'none' }}
                />
              )}
              <strong className={styles.popupName}>{comm.name}</strong>
              {comm.priceFrom && (
                <span className={styles.popupPrice}>{formatPrice(comm.priceFrom)}</span>
              )}
              {comm.location?.locationPrecision === 'city' && (
                <span className={styles.popupApprox}>Approximate location</span>
              )}
              <Link to={href} className={styles.popupLink}>
                View community
              </Link>
            </Popup>
          </Marker>
        )
      })}
    </MapContainer>
  )
}

export default LocationMapInner

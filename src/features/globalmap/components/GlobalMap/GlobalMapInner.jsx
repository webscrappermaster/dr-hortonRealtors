import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import { Link } from 'react-router-dom'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'react-leaflet-cluster/dist/assets/MarkerCluster.css'
import 'react-leaflet-cluster/dist/assets/MarkerCluster.Default.css'
import { statesIndex } from '../../../locations/data/statesIndex'
import { stateCentroids } from '../../data/stateCentroids'
import georgiaData from '../../../locations/data/states/georgia.json'
import styles from './GlobalMap.module.css'

/* Centro geográfico aproximado de los 48 estados contiguos */
const US_CENTER = [39.9, -98.6]
const US_ZOOM = 4

function createStateIcon() {
  return L.divIcon({
    className: '',
    html: `<div style="
      width:14px;height:14px;
      background:var(--color-navy,#00205B);
      border:2px solid #fff;
      border-radius:50%;
      box-shadow:0 1px 3px rgba(0,0,0,.5);
    "></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
    popupAnchor: [0, -10],
  })
}

function createCommunityIcon() {
  return L.divIcon({
    className: '',
    html: `<div style="
      width:10px;height:10px;
      background:var(--color-red,#D10000);
      border:2px solid #fff;
      border-radius:50%;
      box-shadow:0 1px 3px rgba(0,0,0,.5);
    "></div>`,
    iconSize: [10, 10],
    iconAnchor: [5, 5],
    popupAnchor: [0, -8],
  })
}

/* Comunidades con coordenadas extraídas de estados con JSON real */
const communityPins = georgiaData.markets.flatMap(market =>
  (market.communities || [])
    .filter(c => c.location)
    .map(c => ({
      key:       c.slug,
      lat:       c.location.lat,
      lng:       c.location.lng,
      name:      c.name,
      href:      `/georgia/${market.slug}/${c.citySlug}/${c.slug}`,
      isExact:   c.location.locationPrecision === 'exact',
    }))
)

function GlobalMapInner() {
  return (
    <MapContainer
      center={US_CENTER}
      zoom={US_ZOOM}
      className={styles.map}
      aria-label="Map of D.R. Horton communities nationwide"
      zoomControl
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors'
        maxZoom={19}
      />

      {/* Pins de estado — uno por estado, no agrupados entre sí */}
      {statesIndex.map(state => {
        const centroid = stateCentroids[state.slug]
        if (!centroid) return null
        return (
          <Marker
            key={state.slug}
            position={[centroid.lat, centroid.lng]}
            icon={createStateIcon()}
          >
            <Popup>
              <div className={styles.popup}>
                <strong className={styles.popupName}>{state.name}</strong>
                <Link to={`/${state.slug}`} className={styles.popupLink}>
                  See homes
                </Link>
              </div>
            </Popup>
          </Marker>
        )
      })}

      {/* Pins de comunidades con coordenadas — agrupados con clustering */}
      <MarkerClusterGroup chunkedLoading>
        {communityPins.map(pin => (
          <Marker
            key={pin.key}
            position={[pin.lat, pin.lng]}
            icon={createCommunityIcon()}
          >
            <Popup>
              <div className={styles.popup}>
                <strong className={styles.popupName}>{pin.name}</strong>
                {!pin.isExact && <span className={styles.popupApprox}>Approximate location</span>}
                <Link to={pin.href} className={styles.popupLink}>
                  View community
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MarkerClusterGroup>
    </MapContainer>
  )
}

export default GlobalMapInner

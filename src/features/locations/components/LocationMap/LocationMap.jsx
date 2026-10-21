import { lazy, Suspense } from 'react'
import MapPlaceholder from '../MapPlaceholder'
import styles from './LocationMap.module.css'

const LocationMapInner = lazy(() => import('./LocationMapInner'))

function LocationMap(props) {
  return (
    <div className={styles.mapWrapper}>
      <Suspense fallback={<MapPlaceholder label="Cargando mapa…" />}>
        <LocationMapInner {...props} />
      </Suspense>
    </div>
  )
}

export default LocationMap

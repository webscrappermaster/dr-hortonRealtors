import { useState } from 'react'
import { Link } from 'react-router-dom'
import Breadcrumbs from '../../../components/ui/Breadcrumbs'
import LocationMap from '../components/LocationMap'
import { stateCentroids } from '../../globalmap/data/stateCentroids'
import { US_STATES } from '../../../utils/usStates'
import styles from './LocationPageTemplate.module.css'
import emptyStyles from './AreaPageEmpty.module.css'

function AreaPageEmpty({ stateData, areaData }) {
  const [mapVisible, setMapVisible] = useState(false)
  const center = stateCentroids[stateData.slug] ?? null
  const stateCode = US_STATES.find(s => s.label === stateData.name)?.value ?? ''

  const breadcrumbs = [
    { label: 'Home',         to: '/' },
    { label: stateData.name, to: `/${stateData.slug}` },
    { label: areaData.name },
  ]

  return (
    <main className={styles.page}>
      <div className={`${styles.splitWrapper}${mapVisible ? ` ${styles.mapActive}` : ''}`}>

        <div className={styles.mapColumn}>
          <LocationMap communities={[]} center={center} />
        </div>

        <div className={styles.resultsColumn}>
          <div className={styles.inner}>
            <Breadcrumbs items={breadcrumbs} />

            <h1 className={styles.h1}>
              Find Your New Home in {areaData.name}{stateCode ? `, ${stateCode}` : ''}
            </h1>

            <button
              className={emptyStyles.mapToggle}
              onClick={() => setMapVisible(v => !v)}
              aria-pressed={mapVisible}
            >
              {mapVisible ? 'Hide map' : 'Map view'}
            </button>

            <p className={emptyStyles.notice}>
              Communities in this area are coming soon.
            </p>

            <Link to={`/${stateData.slug}`} className={emptyStyles.backLink}>
              ← Back to {stateData.name}
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}

export default AreaPageEmpty

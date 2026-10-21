import { useState } from 'react'
import { Link } from 'react-router-dom'
import Breadcrumbs from '../../../components/ui/Breadcrumbs'
import LocationMap from '../components/LocationMap'
import { stateCentroids } from '../../globalmap/data/stateCentroids'
import styles from './LocationPageTemplate.module.css'
import emptyStyles from './StatePageEmpty.module.css'

function StatePageEmpty({ stateData }) {
  const [mapVisible, setMapVisible] = useState(false)
  const center = stateCentroids[stateData.slug] ?? null
  const marketCount = stateData.markets?.length ?? 0
  const marketLabel = `${marketCount} ${marketCount === 1 ? 'market' : 'markets'}`

  const breadcrumbs = [
    { label: 'Home', to: '/' },
    { label: stateData.name },
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

            <h1 className={styles.h1}>New homes in {stateData.name}</h1>

            <div className={emptyStyles.meta}>
              <span className={emptyStyles.marketCount}>{marketLabel}</span>
              <button
                className={emptyStyles.mapToggle}
                onClick={() => setMapVisible(v => !v)}
                aria-pressed={mapVisible}
              >
                {mapVisible ? 'Hide map' : 'Map view'}
              </button>
            </div>

            <p className={emptyStyles.notice}>
              Community listings for this state are coming soon.
            </p>

            <ul className={emptyStyles.areaGrid} aria-label="Areas">
              {stateData.markets?.map(area => (
                <li key={area.slug}>
                  <Link
                    to={`/${stateData.slug}/${area.slug}`}
                    className={emptyStyles.areaCard}
                  >
                    {area.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </main>
  )
}

export default StatePageEmpty

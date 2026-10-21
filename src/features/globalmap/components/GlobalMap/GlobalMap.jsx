import { lazy, Suspense } from 'react'
import styles from './GlobalMap.module.css'

const GlobalMapInner = lazy(() => import('./GlobalMapInner'))

function GlobalMap() {
  return (
    <div className={styles.mapWrapper}>
      <Suspense
        fallback={
          <div className={styles.loading}>
            <p className={styles.loadingText}>Loading map…</p>
          </div>
        }
      >
        <GlobalMapInner />
      </Suspense>
    </div>
  )
}

export default GlobalMap

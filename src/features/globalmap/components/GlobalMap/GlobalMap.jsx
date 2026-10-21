import { lazy, Suspense } from 'react'
import styles from './GlobalMap.module.css'

const GlobalMapInner = lazy(() => import('./GlobalMapInner'))

function GlobalMap() {
  return (
    <div className={styles.mapWrapper}>
      <Suspense
        fallback={
          <div className={styles.mapWrapper} style={{ background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ color: '#6b7280' }}>Loading map…</p>
          </div>
        }
      >
        <GlobalMapInner />
      </Suspense>
    </div>
  )
}

export default GlobalMap

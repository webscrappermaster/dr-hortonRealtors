import { Link, useLocation } from 'react-router-dom'
import styles from './CareTabs.module.css'

const TABS = [
  { label: 'Warranty request',      to: '/warranty' },
  { label: 'Maintenance resources', to: '/documents-and-guides' },
  { label: 'Property submittal',    to: '/contact-us---property-submittals' },
  { label: 'Contact us',            to: '/contact-us-page' },
]

function CareTabs() {
  const { pathname } = useLocation()
  return (
    <div className={styles.wrapper}>
      <h1 className={styles.heading}>Customer care</h1>
      <nav
        className={styles.tabs}
        role="tablist"
        aria-label="Customer care tabs"
      >
        {TABS.map((tab, i) => {
          const active = pathname === tab.to
          return (
            <Link
              key={tab.to}
              to={tab.to}
              role="tab"
              aria-selected={active}
              aria-setsize={TABS.length}
              aria-posinset={i + 1}
              className={`${styles.tab} ${active ? styles.active : ''}`}
            >
              {tab.label}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

export default CareTabs

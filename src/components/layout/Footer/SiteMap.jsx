import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { statesIndex } from '../../../features/locations/data/statesIndex'
import { siteMapHeading } from '../data/footer'
import styles from './SiteMap.module.css'

const ChevronDown = () => (
  <svg
    aria-hidden="true"
    focusable="false"
    width="12"
    height="15"
    viewBox="0 0 16 12"
    className={styles.chevron}
  >
    <g transform="translate(4 2)" stroke="currentColor" strokeWidth="2" fill="none" fillRule="evenodd" strokeLinecap="square">
      <path d="M10.95 1L6 5.95M1 1l4.95 4.95" />
    </g>
  </svg>
)

function SiteMap() {
  const [openSlug, setOpenSlug] = useState(null)
  const marketsRef = useRef(null)

  const toggleState = (slug) => {
    setOpenSlug((prev) => {
      const next = prev === slug ? null : slug
      if (next && marketsRef.current) {
        requestAnimationFrame(() => {
          marketsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        })
      }
      return next
    })
  }

  const activeState = statesIndex.find(s => s.slug === openSlug)

  return (
    <div className={styles.siteMap}>
      <div className={styles.header}>
        <h3 className={styles.heading}>{siteMapHeading}</h3>
      </div>

      <div className={styles.frame}>
        <ul className={styles.statesList}>
          {statesIndex.map((state) => {
            const isActive = state.slug === openSlug
            const isHiddenByActive = openSlug && !isActive
            return (
              <li
                key={state.slug}
                className={`${styles.stateItem} ${isHiddenByActive ? styles.hiddenState : ''}`}
              >
                <Link
                  to={`/${state.slug}`}
                  className={styles.stateLink}
                  aria-label={state.name}
                  tabIndex={isHiddenByActive ? -1 : 0}
                >
                  {state.name}
                </Link>
                <button
                  type="button"
                  className={`${styles.stateToggle} ${isActive ? styles.stateToggleOpen : ''}`}
                  aria-expanded={isActive}
                  aria-controls={`markets-${state.slug}`}
                  aria-label={`${isActive ? 'Close' : 'Open'} submenu with markets in ${state.name}`}
                  onClick={() => toggleState(state.slug)}
                  tabIndex={isHiddenByActive ? -1 : 0}
                >
                  <ChevronDown />
                </button>
              </li>
            )
          })}
        </ul>
      </div>

      {activeState && (
        <div
          id={`markets-${activeState.slug}`}
          ref={marketsRef}
          className={styles.marketsPanel}
        >
          <h4 className={styles.marketsHeading}>
            Areas in <span>{activeState.name}</span>
          </h4>
          <ul className={styles.marketsList}>
            {activeState.markets.map((market) => (
              <li key={market.slug}>
                <Link
                  to={`/${activeState.slug}/${market.slug}`}
                  className={styles.marketLink}
                  aria-label={market.aria}
                >
                  {market.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default SiteMap

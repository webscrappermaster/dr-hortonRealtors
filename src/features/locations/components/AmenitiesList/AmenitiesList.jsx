import { useState } from 'react'
import styles from './AmenitiesList.module.css'

const INITIAL_COUNT = 6

function AmenitiesList({ items = [] }) {
  const [expanded, setExpanded] = useState(false)

  if (!items.length) return null

  const shown = expanded ? items : items.slice(0, INITIAL_COUNT)
  const hasMore = items.length > INITIAL_COUNT

  return (
    <section className={styles.section}>
      <h2 className={styles.heading}>Community Amenities</h2>
      <ul className={styles.list}>
        {shown.map(item => (
          <li key={item} className={styles.item}>
            <span className={styles.dot} aria-hidden="true" />
            {item}
          </li>
        ))}
      </ul>
      {hasMore && (
        <button
          type="button"
          className={styles.toggle}
          onClick={() => setExpanded(v => !v)}
          aria-expanded={expanded}
        >
          {expanded
            ? 'See fewer amenities'
            : `See all ${items.length} amenities`}
        </button>
      )}
    </section>
  )
}

export default AmenitiesList

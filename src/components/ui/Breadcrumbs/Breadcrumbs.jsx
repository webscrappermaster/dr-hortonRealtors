import { Link } from 'react-router-dom'
import styles from './Breadcrumbs.module.css'

function Breadcrumbs({ items = [], ariaLabel = 'Breadcrumb' }) {
  if (!items.length) return null

  return (
    <nav className={styles.breadcrumbs} aria-label={ariaLabel}>
      <ul>
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          return (
            <li key={`${item.label}-${index}`} aria-current={isLast ? 'page' : undefined}>
              {!isLast && item.to ? (
                <Link to={item.to}>{item.label}</Link>
              ) : (
                <span>{item.label}</span>
              )}
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

export default Breadcrumbs

import styles from './Pagination.module.css'

function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

  return (
    <nav className={styles.pagination} aria-label="Results pagination">
      <button
        type="button"
        className={styles.btn}
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
        aria-label="Previous page"
      >
        <svg aria-hidden="true" width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
          <path d="M6.3.3c.3.3.3.8 0 1.1L2.6 5.1h8.6c.4.1.8.4.8.9 0 .4-.4.8-.8.8H2.6l3.7 3.7c.3.3.3.8 0 1.1-.3.4-.8.4-1.1.1L.3 6.8c-.4-.4-.4-1.1 0-1.6L5.2.3C5.5 0 6 0 6.3.3z"/>
        </svg>
        Prev
      </button>

      {pages.map(p => (
        <button
          key={p}
          type="button"
          className={`${styles.btn} ${p === page ? styles.active : ''}`}
          onClick={() => onPageChange(p)}
          aria-label={`Page ${p}`}
          aria-current={p === page ? 'page' : undefined}
        >
          {p}
        </button>
      ))}

      <button
        type="button"
        className={styles.btn}
        disabled={page === totalPages}
        onClick={() => onPageChange(page + 1)}
        aria-label="Next page"
      >
        Next
        <svg aria-hidden="true" width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
          <path d="M5.7.3c-.3.3-.3.8 0 1.1l3.7 3.7H.8c-.4.1-.8.4-.8.9 0 .4.4.8.8.8h8.6l-3.7 3.7c-.3.3-.3.8 0 1.1.3.4.8.4 1.1.1l4.9-4.9c.4-.4.4-1.1 0-1.6L6.8.3C6.5 0 6 0 5.7.3z"/>
        </svg>
      </button>
    </nav>
  )
}

export default Pagination

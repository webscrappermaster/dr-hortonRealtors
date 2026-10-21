import styles from './LocationResultsHeader.module.css'

const SORT_OPTIONS = [
  { value: 'price-asc',  label: 'Price (low to high)' },
  { value: 'price-desc', label: 'Price (high to low)' },
  { value: 'name-asc',   label: 'Name (A–Z)' },
]

const BED_OPTIONS = [
  { value: '',  label: 'Any beds' },
  { value: '2', label: '2+ beds'  },
  { value: '3', label: '3+ beds'  },
  { value: '4', label: '4+ beds'  },
]

const PRICE_OPTIONS = [
  { value: '',       label: 'Any price'         },
  { value: '300000', label: 'Up to $300s'        },
  { value: '400000', label: 'Up to $400s'        },
  { value: '500000', label: 'Up to $500s'        },
]

function LocationResultsHeader({
  total,
  filters,
  onFilterChange,
  sort,
  onSortChange,
  onRequestInfo,
  mapVisible,
  onToggleMap,
}) {
  return (
    <div className={styles.header}>
      <div className={styles.topRow}>
        <p className={styles.count}>
          {total != null ? (
            <><strong>{total}</strong> new homes</>
          ) : (
            'New homes'
          )}
        </p>

        <div className={styles.actions}>
          <button
            type="button"
            className={`${styles.mapBtn}${mapVisible ? ` ${styles.mapBtnActive}` : ''}`}
            onClick={onToggleMap}
            aria-pressed={!!mapVisible}
          >
            <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            {mapVisible ? 'List view' : 'Map view'}
          </button>

          <button
            type="button"
            className={styles.rfiBtn}
            onClick={onRequestInfo}
          >
            Request info
          </button>
        </div>
      </div>

      <div className={styles.filtersRow}>
        <select
          className={styles.select}
          value={filters.maxPrice ?? ''}
          onChange={e => onFilterChange({ ...filters, maxPrice: e.target.value || null })}
          aria-label="Filter by price"
        >
          {PRICE_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        <select
          className={styles.select}
          value={filters.minBeds ?? ''}
          onChange={e => onFilterChange({ ...filters, minBeds: e.target.value || null })}
          aria-label="Filter by bedrooms"
        >
          {BED_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        <select
          className={styles.select}
          value={sort}
          onChange={e => onSortChange(e.target.value)}
          aria-label="Sort results"
        >
          {SORT_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
    </div>
  )
}

export default LocationResultsHeader

import { useState, useRef } from 'react'
import Breadcrumbs from '../../../components/ui/Breadcrumbs'
import LocationResultsHeader from '../components/LocationResultsHeader'
import CommunityCard from '../components/CommunityCard'
import LocationBlurb from '../components/LocationBlurb'
import Pagination from '../../../components/ui/Pagination'
import RFIModal from '../components/RFIModal'
import styles from './LocationPageTemplate.module.css'

const PAGE_SIZE = 10

function applyFilters(communities, { maxPrice, minBeds }) {
  return communities.filter(c => {
    if (maxPrice && c.priceFrom != null && c.priceFrom > Number(maxPrice)) return false
    if (minBeds && c.beds?.min != null && c.beds.min < Number(minBeds)) return false
    return true
  })
}

function applySort(communities, sort) {
  const sorted = [...communities]
  if (sort === 'price-asc')  sorted.sort((a, b) => (a.priceFrom ?? Infinity) - (b.priceFrom ?? Infinity))
  if (sort === 'price-desc') sorted.sort((a, b) => (b.priceFrom ?? 0) - (a.priceFrom ?? 0))
  if (sort === 'name-asc')   sorted.sort((a, b) => a.name.localeCompare(b.name))
  return sorted
}

function AreaPage({ stateData, areaData }) {
  const allCommunities = areaData.communities ?? []

  const [filters, setFilters]   = useState({ maxPrice: null, minBeds: null })
  const [sort, setSort]         = useState('price-asc')
  const [page, setPage]         = useState(1)
  const [rfiOpen, setRfiOpen]   = useState(false)
  const rfiTriggerRef = useRef(null)

  const filtered   = applyFilters(allCommunities, filters)
  const sorted     = applySort(filtered, sort)
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE))
  const paged      = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function handleFilterChange(next) {
    setFilters(next)
    setPage(1)
  }

  function handleSortChange(next) {
    setSort(next)
    setPage(1)
  }

  const breadcrumbs = [
    { label: 'Home',         to: '/' },
    { label: stateData.name, to: `/${stateData.slug}` },
    { label: areaData.name },
  ]

  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <Breadcrumbs items={breadcrumbs} />

        <h1 className={styles.h1}>
          {areaData.heroTitle ?? `Find Your New Home in ${areaData.name}`}
        </h1>

        {areaData.totalResults != null && (
          <p className={styles.subtitle}>
            {areaData.totalResults.toLocaleString()} new homes
            {areaData.resultsRadiusMiles && (
              <> within {areaData.resultsRadiusMiles} miles</>
            )}
          </p>
        )}

        <LocationResultsHeader
          total={filtered.length}
          filters={filters}
          onFilterChange={handleFilterChange}
          sort={sort}
          onSortChange={handleSortChange}
          onRequestInfo={() => setRfiOpen(true)}
        />

        {paged.length > 0 ? (
          <ul className={styles.grid} aria-label="Communities">
            {paged.map(comm => (
              <li key={comm.slug}>
                <CommunityCard community={comm} />
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.empty}>No communities match the selected filters.</p>
        )}

        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>

      {areaData.blurb && <LocationBlurb html={areaData.blurb} />}

      {rfiOpen && (
        <RFIModal
          communityName={`${areaData.name}, ${stateData.name}`}
          onClose={() => setRfiOpen(false)}
          returnFocusTo={rfiTriggerRef}
        />
      )}
    </main>
  )
}

export default AreaPage

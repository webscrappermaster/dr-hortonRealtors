import { useState, useRef } from 'react'
import Breadcrumbs from '../../../components/ui/Breadcrumbs'
import LocationResultsHeader from '../components/LocationResultsHeader'
import CommunityCard from '../components/CommunityCard'
import LocationBlurb from '../components/LocationBlurb'
import LocationMap from '../components/LocationMap'
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

function StatePage({ stateData }) {
  const allCommunities = stateData.markets?.flatMap(m => m.communities ?? []) ?? []
  const mapCenter = stateData.markets?.find(m => m.center)?.center ?? null

  const [filters, setFilters]       = useState({ maxPrice: null, minBeds: null })
  const [sort, setSort]             = useState('price-asc')
  const [page, setPage]             = useState(1)
  const [rfiOpen, setRfiOpen]       = useState(false)
  const [hoveredSlug, setHoveredSlug] = useState(null)
  const [mapVisible, setMapVisible] = useState(false)
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
    { label: 'Home', to: '/' },
    { label: stateData.name },
  ]

  return (
    <main className={styles.page}>
      <div className={`${styles.splitWrapper}${mapVisible ? ` ${styles.mapActive}` : ''}`}>

        {/* Columna mapa */}
        <div className={styles.mapColumn}>
          <LocationMap
            communities={allCommunities}
            center={mapCenter}
            hoveredSlug={hoveredSlug}
            onPinEnter={setHoveredSlug}
            onPinLeave={() => setHoveredSlug(null)}
          />
        </div>

        {/* Columna de resultados */}
        <div className={styles.resultsColumn}>
          <div className={styles.inner}>
            <Breadcrumbs items={breadcrumbs} />

            <h1 className={styles.h1}>
              {stateData.totalResults != null ? (
                <>{stateData.totalResults.toLocaleString()} new homes for sale
                  {stateData.resultsRadiusMiles && (
                    <> within {stateData.resultsRadiusMiles} miles of {stateData.name}</>
                  )}
                </>
              ) : (
                <>New homes in {stateData.name}</>
              )}
            </h1>

            <LocationResultsHeader
              total={filtered.length}
              filters={filters}
              onFilterChange={handleFilterChange}
              sort={sort}
              onSortChange={handleSortChange}
              onRequestInfo={() => setRfiOpen(true)}
              mapVisible={mapVisible}
              onToggleMap={() => setMapVisible(v => !v)}
            />

            {paged.length > 0 ? (
              <ul className={styles.grid} aria-label="Communities">
                {paged.map(comm => (
                  <li key={`${comm.areaSlug}-${comm.slug}`}>
                    <CommunityCard
                      community={comm}
                      highlighted={comm.slug === hoveredSlug}
                      onHover={() => setHoveredSlug(comm.slug)}
                      onHoverEnd={() => setHoveredSlug(null)}
                    />
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
        </div>
      </div>

      {stateData.blurb && <LocationBlurb html={stateData.blurb} />}

      {rfiOpen && (
        <RFIModal
          communityName={stateData.name}
          onClose={() => setRfiOpen(false)}
          returnFocusTo={rfiTriggerRef}
        />
      )}
    </main>
  )
}

export default StatePage

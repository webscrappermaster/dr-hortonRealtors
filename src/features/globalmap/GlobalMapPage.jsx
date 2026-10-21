import { useNavigate } from 'react-router-dom'
import SearchBar from '../../components/ui/SearchBar'
import { useLocationSearch } from '../locations/hooks/useLocationSearch'
import GlobalMap from './components/GlobalMap'
import styles from './GlobalMapPage.module.css'

function GlobalMapPage() {
  const navigate = useNavigate()
  const { suggestions, search } = useLocationSearch()

  return (
    <main className={styles.page}>
      <div className={styles.hero}>
        <h1 className={styles.title}>
          Start your home search with America's home builder.
        </h1>
        <p className={styles.subtitle}>
          Explore where we build nationwide, and find the right community for you.
        </p>
        <SearchBar
          placeholder="Search by zip, city, state, or community"
          ariaLabel="Search by zip, city, state, or community"
          suggestions={suggestions}
          onQueryChange={search}
          onSelect={item => navigate(item.to)}
          className={styles.search}
        />
      </div>

      <GlobalMap />
    </main>
  )
}

export default GlobalMapPage

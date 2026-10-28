import { Link, useNavigate } from 'react-router-dom'
import SearchBar from '../../../../components/ui/SearchBar'
import { useLocationSearch } from '../../../locations/hooks/useLocationSearch'
import { heroData } from '../../data/hero'
import { useSiteSettings } from '../../../../hooks/useSiteSettings'
import styles from './Hero.module.css'

const dateFormatter = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric' })

// Parsea como fecha local para evitar desfase de zona horaria con fechas ISO
function parseLocalDate(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function Hero() {
  const navigate = useNavigate()
  const { suggestions, search } = useLocationSearch()
  const { promoDeadline } = useSiteSettings()
  const { image, heading, subheadingPrefix, search: searchCfg, mapButton } = heroData

  const formattedDate = dateFormatter.format(parseLocalDate(promoDeadline))
  const subheading = `${subheadingPrefix}${formattedDate}.`

  return (
    <section className={styles.hero} aria-labelledby="hero-heading">
      <div className={styles.frame}>
        <picture className={styles.imageWrap}>
          <source media="(max-width: 639px)" srcSet={image.mobile} />
          <img
            src={image.desktop}
            alt={image.alt}
            className={styles.image}
            loading="eager"
            fetchPriority="high"
          />
        </picture>

        <div className={styles.content}>
          <h1 id="hero-heading" className={styles.heading}>
            {heading}
          </h1>
          <h2 className={styles.subheading}>{subheading}</h2>

          <div className={styles.searchWrap}>
            <SearchBar
              placeholder={searchCfg.placeholder}
              ariaLabel={searchCfg.ariaLabel}
              suggestions={suggestions}
              onQueryChange={search}
              onSelect={(item) => navigate(item.to)}
              minChars={2}
            />
          </div>

          <Link
            to={mapButton.to}
            className={styles.mapButton}
            aria-label={mapButton.ariaLabel}
          >
            {mapButton.label}
          </Link>
        </div>
      </div>
    </section>
  )
}

export default Hero

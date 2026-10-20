import { Link, useNavigate } from 'react-router-dom'
import SearchBar from '../../../../components/ui/SearchBar'
import { useLocationSearch } from '../../../locations/hooks/useLocationSearch'
import { heroData } from '../../data/hero'
import styles from './Hero.module.css'

function Hero() {
  const navigate = useNavigate()
  const { suggestions, search } = useLocationSearch()
  const { image, heading, subheading, search: searchCfg, mapButton } = heroData

  return (
    <section className={styles.hero} aria-labelledby="hero-heading">
      <div className={styles.imageWrap}>
        <picture>
          <source media="(max-width: 639px)" srcSet={image.mobile} />
          <img
            src={image.desktop}
            alt={image.alt}
            className={styles.image}
            loading="eager"
            fetchPriority="high"
          />
        </picture>
      </div>

      <div className={styles.frame}>
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

        <div className={styles.mapViewWrap}>
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

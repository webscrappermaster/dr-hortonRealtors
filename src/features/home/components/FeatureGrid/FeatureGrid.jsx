import { Link } from 'react-router-dom'
import VimeoTile from '../VimeoTile'
import { redTagTile, secondaryTiles } from '../../data/featureTiles'
import heartIcon from '../../../../assets/icons/heart.svg'
import styles from './FeatureGrid.module.css'

/* Renderiza un CTA interno o externo según `cta.external`. */
function CtaLink({ cta, className }) {
  if (cta.external) {
    return (
      <a
        href={cta.to}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        aria-label={cta.ariaLabel}
        title={cta.title}
      >
        {cta.label}
      </a>
    )
  }
  return (
    <Link
      to={cta.to}
      className={className}
      aria-label={cta.ariaLabel}
    >
      {cta.label}
    </Link>
  )
}

/* Renderiza "We ❤ real estate agents" reemplazando el símbolo por el SVG oficial. */
function Heading({ text, hasHeart, className }) {
  if (!hasHeart) return <h2 className={className}>{text}</h2>
  const [before, after] = text.split('❤')
  return (
    <h2 className={className}>
      {before}
      <img src={heartIcon} alt="love" className={styles.heart} />
      {after}
    </h2>
  )
}

function FeatureGrid() {
  return (
    <section className={styles.wrapper} aria-label="Explore featured programs">
      <div className={styles.grid}>
        {/* Tarjeta grande — Red Tag con video Vimeo */}
        <article className={`${styles.tile} ${styles.tileLarge}`}>
          <VimeoTile
            vimeoId={redTagTile.vimeoId}
            vimeoTitle={redTagTile.vimeoTitle}
            fallbackSlides={redTagTile.fallbackSlides}
          />
          <div className={styles.content}>
            <h2 className={styles.heading}>{redTagTile.heading}</h2>
            <p className={styles.description}>{redTagTile.description}</p>
            <CtaLink cta={redTagTile.cta} className={styles.cta} />
          </div>
        </article>

        {/* 4 tarjetas secundarias en 2x2 */}
        <div className={styles.secondaryGrid}>
          {secondaryTiles.map(tile => (
            <article
              key={tile.id}
              className={`${styles.tile} ${tile.hasTopSquares ? styles.tileTopSquares : ''}`}
            >
              <div className={styles.content}>
                <Heading
                  text={tile.heading}
                  hasHeart={tile.hasHeart}
                  className={styles.heading}
                />
                <p className={styles.description}>{tile.description}</p>
                <CtaLink cta={tile.cta} className={styles.cta} />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default FeatureGrid

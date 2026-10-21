import { useState } from 'react'
import { Link } from 'react-router-dom'
import heartIcon from '../../../../assets/icons/heart.svg'
import { videoTile, secondaryTiles } from '../../data/globalMapTiles'
import styles from './HomeTilesGrid.module.css'

/* Patrón facade — muestra poster coloreado + botón play;
   el iframe de Vimeo (con ?dnt=1) solo se inyecta al hacer clic. */
function VideoTile({ vimeoId, vimeoTitle, heading, description, cta }) {
  const [playing, setPlaying] = useState(false)

  return (
    <article className={`${styles.tile} ${styles.tileLarge}`}>
      <div className={styles.videoArea}>
        {playing ? (
          <iframe
            src={`https://player.vimeo.com/video/${vimeoId}?dnt=1&autoplay=1`}
            title={vimeoTitle}
            className={styles.iframe}
            frameBorder="0"
            allow="autoplay; fullscreen; picture-in-picture"
            referrerPolicy="strict-origin-when-cross-origin"
          />
        ) : (
          <button
            type="button"
            className={styles.poster}
            onClick={() => setPlaying(true)}
            aria-label={`Play video: ${vimeoTitle}`}
          >
            <svg className={styles.playIcon} viewBox="0 0 64 64" aria-hidden="true">
              <circle cx="32" cy="32" r="30" fill="rgba(0,0,0,.45)" />
              <polygon points="26,20 48,32 26,44" fill="#fff" />
            </svg>
          </button>
        )}
      </div>
      <div className={styles.content}>
        <h2 className={styles.heading}>{heading}</h2>
        <p className={styles.description}>{description}</p>
        <a
          href={cta.to}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.cta}
        >
          {cta.label}
        </a>
      </div>
    </article>
  )
}

function CtaLink({ cta, className }) {
  if (cta.external) {
    return (
      <a
        href={cta.to}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {cta.label}
      </a>
    )
  }
  return (
    <Link to={cta.to} className={className}>
      {cta.label}
    </Link>
  )
}

function TileHeading({ text, hasHeart, className }) {
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

function HomeTilesGrid() {
  return (
    <section className={styles.wrapper} aria-label="Explore featured programs">
      <div className={styles.grid}>
        <VideoTile {...videoTile} />

        <div className={styles.secondaryGrid}>
          {secondaryTiles.map(tile => (
            <article
              key={tile.id}
              className={`${styles.tile} ${tile.hasTopSquares ? styles.tileTopSquares : ''}`}
            >
              <div className={styles.content}>
                <TileHeading
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

export default HomeTilesGrid

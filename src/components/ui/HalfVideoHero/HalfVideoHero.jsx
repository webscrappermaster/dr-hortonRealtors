import { useState } from 'react'
import styles from './HalfVideoHero.module.css'

/* Patrón facade: muestra poster + botón play; el iframe de Vimeo (con ?dnt=1)
   solo se inyecta al hacer clic, sin cookies hasta ese momento. */

function HalfVideoHero({ children, posterSrc, posterAlt = '', vimeoId }) {
  const [playing, setPlaying] = useState(false)

  return (
    <section className={styles.hero}>
      <div className={styles.text}>{children}</div>

      <div className={styles.videoWrapper}>
        {playing ? (
          <iframe
            className={styles.iframe}
            src={`https://player.vimeo.com/video/${vimeoId}?dnt=1&autoplay=1`}
            title="Video"
            allow="autoplay; fullscreen"
            allowFullScreen
          />
        ) : (
          <div className={styles.poster}>
            {posterSrc && (
              <img src={posterSrc} alt={posterAlt} className={styles.posterImg} />
            )}
            {vimeoId && (
              <button
                className={styles.playBtn}
                onClick={() => setPlaying(true)}
                type="button"
                aria-label="Reproducir video"
              >
                <svg
                  viewBox="0 0 60 60"
                  aria-hidden="true"
                  focusable="false"
                  className={styles.playIcon}
                >
                  <circle cx="30" cy="30" r="29" fill="rgba(0,0,0,0.55)" stroke="white" strokeWidth="2" />
                  <polygon points="24,18 46,30 24,42" fill="white" />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  )
}

export default HalfVideoHero

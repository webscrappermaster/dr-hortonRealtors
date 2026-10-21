import { useState, useEffect, useRef, useCallback } from 'react'
import styles from './SliderCards.module.css'

/* Carousel accesible de tarjetas (imagen + título + subtítulo + descripción).
   - Flechas prev/next con teclado
   - Auto-avance pausable (respeta prefers-reduced-motion)
   - Indicadores de posición (dots) */

const AUTOPLAY_MS = 5000

function SliderCards({ cards = [], autoPlay = true, visibleCount = 3 }) {
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)
  const intervalRef = useRef(null)
  const listRef = useRef(null)
  const total = cards.length

  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const advance = useCallback(
    dir => {
      setCurrent(prev => (prev + dir + total) % total)
    },
    [total],
  )

  useEffect(() => {
    if (!autoPlay || paused || prefersReduced || total <= 1) return
    intervalRef.current = setInterval(() => advance(1), AUTOPLAY_MS)
    return () => clearInterval(intervalRef.current)
  }, [autoPlay, paused, advance, prefersReduced, total])

  function handleKeyDown(e) {
    if (e.key === 'ArrowLeft') advance(-1)
    if (e.key === 'ArrowRight') advance(1)
  }

  return (
    <section
      className={styles.slider}
      aria-label="Carrusel de dispositivos del hogar inteligente"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className={styles.track} ref={listRef}>
        {cards.map((card, i) => {
          const offset = (i - current + total) % total
          const visible = offset < visibleCount
          return (
            <article
              key={card.title}
              className={`${styles.card} ${i === current ? styles.active : ''}`}
              aria-hidden={!visible}
              tabIndex={visible ? 0 : -1}
              onKeyDown={handleKeyDown}
              style={{ '--offset': offset }}
            >
              <div className={styles.image}>
                <img src={card.image} alt={card.imageAlt ?? ''} loading="lazy" />
              </div>
              <div className={styles.content}>
                {card.title && (
                  <h3
                    className={styles.title}
                    dangerouslySetInnerHTML={{ __html: card.title }}
                  />
                )}
                {card.description && <p className={styles.description}>{card.description}</p>}
                {card.subtitle && <p className={styles.subtitle}>{card.subtitle}</p>}
              </div>
            </article>
          )
        })}
      </div>

      <div className={styles.controls} aria-label="Controles del carrusel">
        <button
          className={styles.arrow}
          onClick={() => advance(-1)}
          aria-label="Anterior"
          type="button"
        >
          ‹
        </button>

        <div className={styles.dots} role="tablist" aria-label="Posición en el carrusel">
          {cards.map((card, i) => (
            <button
              key={card.title}
              role="tab"
              aria-selected={i === current}
              aria-label={`Ir a diapositiva ${i + 1} de ${total}: ${card.title}`}
              className={`${styles.dot} ${i === current ? styles.dotActive : ''}`}
              onClick={() => setCurrent(i)}
              type="button"
            />
          ))}
        </div>

        <button
          className={styles.arrow}
          onClick={() => advance(1)}
          aria-label="Siguiente"
          type="button"
        >
          ›
        </button>
      </div>
    </section>
  )
}

export default SliderCards

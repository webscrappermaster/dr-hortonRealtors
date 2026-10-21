import { useState, useEffect, useRef } from 'react'
import styles from './PropertyGallery.module.css'

function PlayIcon() {
  return (
    <svg className={styles.playIcon} viewBox="0 0 64 64" aria-hidden="true">
      <circle cx="32" cy="32" r="32" fill="rgba(0,0,0,0.55)" />
      <polygon points="26,18 50,32 26,46" fill="#fff" />
    </svg>
  )
}

function PropertyGallery({ items = [], communityName = '' }) {
  const [index, setIndex] = useState(0)
  const containerRef = useRef(null)

  const total = items.length
  if (!total) return null

  const prev = () => setIndex(i => (i - 1 + total) % total)
  const next = () => setIndex(i => (i + 1) % total)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const onKey = (e) => {
      if (e.key === 'ArrowLeft')  { e.preventDefault(); prev() }
      if (e.key === 'ArrowRight') { e.preventDefault(); next() }
    }
    el.addEventListener('keydown', onKey)
    return () => el.removeEventListener('keydown', onKey)
  })

  const current = items[index]
  const isVideo = current?.type === 'video'

  return (
    <div
      ref={containerRef}
      className={styles.gallery}
      role="region"
      aria-label={`${communityName} gallery`}
      tabIndex={0}
    >
      <div className={styles.mainSlide}>
        {current?.imageUrl ? (
          <img
            src={current.imageUrl}
            alt={current.alt || communityName}
            className={styles.mainImage}
          />
        ) : (
          <div className={styles.placeholder} aria-hidden="true" />
        )}
        {isVideo && <PlayIcon />}
      </div>

      <button
        type="button"
        className={`${styles.arrow} ${styles.arrowPrev}`}
        onClick={prev}
        aria-label="Previous photo"
        disabled={total <= 1}
      >
        <svg viewBox="0 0 10 18" aria-hidden="true"><path d="M9 1 1 9l8 8" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>

      <button
        type="button"
        className={`${styles.arrow} ${styles.arrowNext}`}
        onClick={next}
        aria-label="Next photo"
        disabled={total <= 1}
      >
        <svg viewBox="0 0 10 18" aria-hidden="true"><path d="M1 1l8 8-8 8" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>

      <div className={styles.counter} aria-live="polite" aria-atomic="true">
        {index + 1} / {total}
      </div>
    </div>
  )
}

export default PropertyGallery

import { useState, useEffect } from 'react'
import styles from './ImageSlider.module.css'

const PauseIcon = () => (
  <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true" focusable="false">
    <rect x="1" y="1" width="3" height="8" fill="currentColor" />
    <rect x="6" y="1" width="3" height="8" fill="currentColor" />
  </svg>
)

const PlayIcon = () => (
  <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true" focusable="false">
    <polygon points="2,1 9,5 2,9" fill="currentColor" />
  </svg>
)

function ImageSlider({
  images = [],
  interval = 5000,
  transition = 'fade',
  aspectRatio = '16/9',
  showDots = false,
  'aria-label': ariaLabel = 'Galería de imágenes',
  className = '',
}) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [isHidden, setIsHidden] = useState(false)
  const [isManuallyPaused, setIsManuallyPaused] = useState(false)

  const isPaused = isHovered || isFocused || isHidden || isManuallyPaused
  const total = images.length

  // Precarga la siguiente imagen para evitar parpadeo
  useEffect(() => {
    if (total <= 1) return
    const next = (activeIndex + 1) % total
    const img = new window.Image()
    img.src = images[next].src
  }, [activeIndex, images, total])

  // Autoplay: se detiene si isPaused o hay una sola imagen
  useEffect(() => {
    if (isPaused || total <= 1) return
    const timer = setInterval(
      () => setActiveIndex(i => (i + 1) % total),
      interval,
    )
    return () => clearInterval(timer)
  }, [isPaused, interval, total])

  // Pausa cuando la pestaña queda en segundo plano (Page Visibility API)
  useEffect(() => {
    const onVisibility = () => setIsHidden(document.hidden)
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [])

  // Guard después de todos los hooks
  if (!total) return null

  // Solo despausa al salir del foco cuando ningún hijo sigue enfocado
  const handleBlur = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) setIsFocused(false)
  }

  // En modo slide, el track se desplaza con transform inline
  const trackStyle =
    transition === 'slide'
      ? { transform: `translateX(-${activeIndex * 100}%)` }
      : undefined

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label={ariaLabel}
      className={`${styles.slider} ${className}`}
      style={{ aspectRatio }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsFocused(true)}
      onBlur={handleBlur}
    >
      <div
        className={styles.track}
        data-transition={transition}
        style={trackStyle}
      >
        {images.map((image, index) => (
          <div
            key={image.src}
            role="group"
            aria-roledescription="slide"
            aria-label={`${index + 1} de ${total}: ${image.alt}`}
            aria-hidden={index !== activeIndex}
            className={`${styles.slide} ${index === activeIndex ? styles.active : ''}`}
          >
            <img
              src={image.src}
              alt={image.alt}
              className={styles.image}
              loading={index === 0 ? 'eager' : 'lazy'}
              draggable={false}
            />
          </div>
        ))}
      </div>

      {/* Botón pausa/play — WCAG requiere control para contenido que se mueve solo */}
      {total > 1 && (
        <div className={styles.controls}>
          <button
            type="button"
            className={styles.playPause}
            onClick={() => setIsManuallyPaused(p => !p)}
            aria-label={isManuallyPaused ? 'Reproducir carrusel' : 'Pausar carrusel'}
          >
            {isManuallyPaused ? <PlayIcon /> : <PauseIcon />}
          </button>
        </div>
      )}

      {showDots && total > 1 && (
        <div className={styles.dots} role="tablist" aria-label="Navegación de diapositivas">
          {images.map((_, index) => (
            <button
              key={index}
              role="tab"
              type="button"
              aria-selected={index === activeIndex}
              aria-label={`Ir a diapositiva ${index + 1}`}
              className={`${styles.dot} ${index === activeIndex ? styles.dotActive : ''}`}
              onClick={() => setActiveIndex(index)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default ImageSlider

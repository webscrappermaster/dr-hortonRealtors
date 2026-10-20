import { useEffect, useRef, useState } from 'react'
import ImageSlider from '../../../../components/ui/ImageSlider'
import { usePrefersReducedMotion } from '../../../../hooks/usePrefersReducedMotion'
import styles from './VimeoTile.module.css'

/* Si no hay IntersectionObserver (navegador muy viejo) cargamos de inmediato;
   la decisión no cambia después del montaje, así que vive en el useState inicial. */
const supportsIO = typeof window !== 'undefined' && 'IntersectionObserver' in window

/* Iframe de Vimeo con background=1 (autoplay, sin controles, muted, loop)
   y dnt=1 (do-not-track). Carga diferida: no se monta el <iframe> hasta
   que el tile entra en el viewport. Si el usuario tiene prefers-reduced-motion,
   se muestra en su lugar un ImageSlider pausable con las slides de respaldo. */
function VimeoTile({ vimeoId, vimeoTitle, fallbackSlides }) {
  const prefersReduced = usePrefersReducedMotion()
  const containerRef = useRef(null)
  const [shouldLoad, setShouldLoad] = useState(!supportsIO)

  useEffect(() => {
    if (prefersReduced || shouldLoad) return
    const el = containerRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some(e => e.isIntersecting)) {
          setShouldLoad(true)
          observer.disconnect()
        }
      },
      { rootMargin: '200px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [prefersReduced, shouldLoad])

  if (prefersReduced) {
    return (
      <div className={styles.frame16x9}>
        <ImageSlider
          images={fallbackSlides}
          aspectRatio="16/9"
          aria-label={`${vimeoTitle} — image presentation`}
          interval={5000}
          showDots
        />
      </div>
    )
  }

  const vimeoUrl = `https://player.vimeo.com/video/${vimeoId}?background=1&dnt=1&autoplay=1&muted=1&loop=1&title=0&byline=0&portrait=0`

  return (
    <div ref={containerRef} className={styles.frame16x9}>
      {shouldLoad && (
        <iframe
          src={vimeoUrl}
          title={vimeoTitle}
          className={styles.iframe}
          frameBorder="0"
          loading="lazy"
          allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
        />
      )}
    </div>
  )
}

export default VimeoTile

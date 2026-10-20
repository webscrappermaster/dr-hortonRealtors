import { useEffect } from 'react'

/* Bloquea el scroll del body cuando se abre un overlay (menú mobile, modal...).
   Guarda el overflow previo para restaurarlo y no romper otros overlays simultáneos. */
export function useBodyScrollLock(locked) {
  useEffect(() => {
    if (!locked) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [locked])
}

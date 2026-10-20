import { useEffect } from 'react'

/* Dispara `handler` cuando se hace click/touch fuera del ref o cuando el usuario
   presiona Escape. `enabled` evita suscribirse cuando el overlay está cerrado. */
export function useOnClickOutside(ref, handler, enabled = true) {
  useEffect(() => {
    if (!enabled) return
    const onDown = (event) => {
      if (!ref.current) return
      if (ref.current.contains(event.target)) return
      handler(event)
    }
    const onKey = (event) => {
      if (event.key === 'Escape') handler(event)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('touchstart', onDown, { passive: true })
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('touchstart', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [ref, handler, enabled])
}

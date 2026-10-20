import { useState, useEffect } from 'react'

export function useStickyHeader(threshold = 0) {
  /* Inicializamos leyendo scrollY ya existente para que un refresh
     con la página desplazada muestre el estado correcto desde el primer render. */
  const [isSticky, setIsSticky] = useState(() =>
    typeof window !== 'undefined' && window.scrollY > threshold,
  )

  useEffect(() => {
    const onScroll = () => setIsSticky(window.scrollY > threshold)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [threshold])

  return isSticky
}

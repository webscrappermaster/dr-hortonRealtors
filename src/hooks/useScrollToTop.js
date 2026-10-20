import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/* Reinicia el scroll a (0,0) cada vez que cambia el pathname.
   El hash (#algo) se respeta: si hay hash, no interferimos. */
export function useScrollToTop() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) return
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pathname, hash])
}

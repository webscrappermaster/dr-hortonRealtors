import { useState, useEffect } from 'react'

export function useStickyHeader(threshold = 0) {
  const [isSticky, setIsSticky] = useState(false)

  useEffect(() => {
    const onScroll = () => setIsSticky(window.scrollY > threshold)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [threshold])

  return isSticky
}

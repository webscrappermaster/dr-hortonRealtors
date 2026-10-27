import { useEffect, useState } from 'react'

function hasOpenDialog() {
  return document.querySelectorAll('dialog[open]').length > 0
}

// Devuelve true mientras haya algún <dialog open> en el documento.
export function useModalOpen() {
  const [open, setOpen] = useState(() => hasOpenDialog())

  useEffect(() => {
    const observer = new MutationObserver(() => setOpen(hasOpenDialog()))
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['open'],
    })
    return () => observer.disconnect()
  }, [])

  return open
}

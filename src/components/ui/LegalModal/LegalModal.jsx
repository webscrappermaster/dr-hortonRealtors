import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useBodyScrollLock } from '../../../hooks/useBodyScrollLock'
import styles from './LegalModal.module.css'

/* Modal legal con <dialog> nativo.
   - Renderiza en document.body (portal) para evitar conflictos con stacking contexts del footer.
   - showModal() en un efecto sin deps: se llama una vez al montar y cierra al desmontar.
   - Los listeners de cierre van en un efecto separado para no re-ejecutar showModal() cuando
     el padre recrea closeModal (función nueva en cada render). */
function LegalModal({ title, src, children, returnFocusTo, onClose }) {
  const dialogRef = useRef(null)

  useBodyScrollLock(true)

  /* Apertura ligada al mount. Sin cleanup de dialog.close(): el portal retira el
     <dialog> del DOM al desmontarse sin disparar 'close', evitando que el listener
     de Effect 2 llame a onClose() durante el desmontaje simulado de StrictMode,
     lo que causaría setModal(null) antes del remount y el modal nunca volvería a abrirse. */
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    dialog.showModal()
  }, [])

  /* Listeners actualizados cuando cambian los callbacks del padre. */
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    const handleClose = () => {
      onClose?.()
      returnFocusTo?.current?.focus()
    }
    const handleClickOutside = (e) => {
      if (e.target === dialog) dialog.close()
    }

    dialog.addEventListener('close', handleClose)
    dialog.addEventListener('click', handleClickOutside)
    return () => {
      dialog.removeEventListener('close', handleClose)
      dialog.removeEventListener('click', handleClickOutside)
    }
  }, [onClose, returnFocusTo])

  const close = () => dialogRef.current?.close()

  return createPortal(
    <dialog ref={dialogRef} className={styles.dialog} aria-labelledby="legal-modal-title">
      <div className={styles.content}>
        <div className={styles.header}>
          <h2 id="legal-modal-title" className={styles.title}>{title}</h2>
          <button
            type="button"
            onClick={close}
            className={styles.closeButton}
            aria-label="Cerrar documento legal"
          >
            ✕
          </button>
        </div>

        <div className={styles.body}>
          {children || (
            <>
              <iframe
                src={src}
                title={title}
                className={styles.iframe}
                referrerPolicy="no-referrer"
              />
              <div className={styles.iframeFallback}>
                <span>Document not loading?</span>
                <a
                  href={src}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.iframeFallbackLink}
                >
                  Open in a new tab ↗
                </a>
              </div>
            </>
          )}
        </div>
      </div>
    </dialog>,
    document.body,
  )
}

export default LegalModal

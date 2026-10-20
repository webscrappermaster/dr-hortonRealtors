import { useEffect, useRef } from 'react'
import { useBodyScrollLock } from '../../../hooks/useBodyScrollLock'
import styles from './LegalModal.module.css'

/* Modal legal con <dialog> nativo:
   - Carga el notice en un iframe (misma URL de privacy-central.securiti.ai que
     usa el original para su legal lightbox).
   - Devuelve el foco al elemento que lo abrió al cerrarse.
   - Escape y clic en el backdrop lo cierran (comportamiento nativo del <dialog>).
   - Bloquea el scroll del body mientras está abierto. */
function LegalModal({ title, src, children, returnFocusTo, onClose }) {
  const dialogRef = useRef(null)

  useBodyScrollLock(true)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (!dialog.open) dialog.showModal()

    const handleClose = () => {
      onClose?.()
      if (returnFocusTo?.current) returnFocusTo.current.focus()
    }

    /* Clic fuera del contenido = sobre el backdrop. */
    const handleClickOutside = (event) => {
      if (event.target === dialog) dialog.close()
    }

    dialog.addEventListener('close', handleClose)
    dialog.addEventListener('click', handleClickOutside)

    return () => {
      dialog.removeEventListener('close', handleClose)
      dialog.removeEventListener('click', handleClickOutside)
      if (dialog.open) dialog.close()
    }
  }, [onClose, returnFocusTo])

  const close = () => dialogRef.current?.close()

  return (
    <dialog ref={dialogRef} className={styles.dialog} aria-labelledby="legal-modal-title">
      <div className={styles.content}>
        <div className={styles.header}>
          <h2 id="legal-modal-title" className={styles.title}>{title}</h2>
          <button
            type="button"
            onClick={close}
            className={styles.closeButton}
            aria-label="Close legal document"
          >
            ✕
          </button>
        </div>

        <div className={styles.body}>
          {children || (
            <iframe
              src={src}
              title={title}
              className={styles.iframe}
              /* El original usa este mismo endpoint; se carga sin cookies de terceros. */
              referrerPolicy="no-referrer"
            />
          )}
        </div>
      </div>
    </dialog>
  )
}

export default LegalModal

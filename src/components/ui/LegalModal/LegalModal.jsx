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

  /* Apertura/cierre ligados solo al ciclo de vida del componente. */
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    dialog.showModal()
    return () => {
      if (dialog.open) dialog.close()
    }
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
                <span>¿No se carga el documento?</span>
                <a
                  href={src}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.iframeFallbackLink}
                >
                  Abrir en una pestaña nueva ↗
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

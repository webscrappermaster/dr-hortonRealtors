import { useState } from 'react'
import whatsappIcon from '../../../assets/icons/whatsapp.svg'
import styles from './WhatsAppButton.module.css'

// variant="floating" | variant="inline"
function WhatsAppButton({ url, label = 'Contact via WhatsApp', variant = 'inline' }) {
  const [showNotice, setShowNotice] = useState(false)

  const isFloating = variant === 'floating'
  const ariaLabel = isFloating ? 'Contact us on WhatsApp' : label

  function handleNoNumber(e) {
    e.preventDefault()
    setShowNotice(v => !v)
  }

  const commonProps = {
    className: isFloating ? styles.floating : styles.inline,
    'aria-label': ariaLabel,
  }

  return (
    <div className={isFloating ? styles.floatingWrap : styles.inlineWrap}>
      {url ? (
        <a
          {...commonProps}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            src={whatsappIcon}
            alt=""
            className={styles.icon}
            width="24"
            height="24"
          />
          {!isFloating && <span className={styles.text}>{label}</span>}
          {isFloating && <span className={styles.tooltip} aria-hidden="true">Contact us on WhatsApp</span>}
        </a>
      ) : (
        <>
          <button
            {...commonProps}
            type="button"
            onClick={handleNoNumber}
            aria-expanded={showNotice}
          >
            <img
              src={whatsappIcon}
              alt=""
              className={styles.icon}
              width="24"
              height="24"
            />
            {!isFloating && <span className={styles.text}>{label}</span>}
            {isFloating && <span className={styles.tooltip} aria-hidden="true">Contact us on WhatsApp</span>}
          </button>
          {showNotice && (
            <p className={styles.notice} role="status">
              WhatsApp contact will be available soon.
            </p>
          )}
        </>
      )}
    </div>
  )
}

export default WhatsAppButton

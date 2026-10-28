import { useState, useRef } from 'react'
import RFIModal from '../RFIModal'
import WhatsAppButton from '../../../../components/ui/WhatsAppButton'
import { buildWhatsAppUrl, buildCommunityMessage } from '../../../../utils/whatsapp'
import { useSiteSettings } from '../../../../hooks/useSiteSettings'
import styles from './CommunityAside.module.css'

function CommunityAside({ communityName, hours, phone, community }) {
  const [showRFI, setShowRFI] = useState(false)
  const [showTWU, setShowTWU] = useState(false)
  const tourBtnRef = useRef(null)
  const twuBtnRef = useRef(null)
  const { whatsappNumber } = useSiteSettings()

  return (
    <aside className={styles.aside}>
      <h2 className={styles.heading}>Community information</h2>

      {hours && (
        <p className={styles.hours}>{hours}</p>
      )}

      <button
        ref={tourBtnRef}
        type="button"
        className={styles.tourBtn}
        onClick={() => setShowRFI(true)}
      >
        Request a tour
      </button>

      <div className={styles.contactRow}>
        {phone && (
          <a href={`tel:${phone.replace(/\D/g, '')}`} className={styles.phone}>
            {phone}
          </a>
        )}

        <button
          ref={twuBtnRef}
          type="button"
          className={styles.twuBtn}
          onClick={() => setShowTWU(v => !v)}
        >
          Text With Us
        </button>
      </div>

      {showTWU && (
        <p className={styles.twuNotice} role="status">
          Text messaging is not available in this version.
        </p>
      )}

      <div className={styles.whatsappWrap}>
        <WhatsAppButton
          variant="inline"
          url={buildWhatsAppUrl(whatsappNumber, buildCommunityMessage(community ?? { name: communityName }))}
        />
      </div>

      {showRFI && (
        <RFIModal
          communityName={communityName}
          community={community}
          variant="tour"
          onClose={() => setShowRFI(false)}
          returnFocusTo={tourBtnRef}
        />
      )}
    </aside>
  )
}

export default CommunityAside

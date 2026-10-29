import { useState, useRef } from 'react'
import RFIModal from '../RFIModal'
import WhatsAppButton from '../../../../components/ui/WhatsAppButton'
import { buildWhatsAppUrl, buildCommunityMessage, buildTextWithUsMessage } from '../../../../utils/whatsapp'
import { useSiteSettings } from '../../../../hooks/useSiteSettings'
import styles from './CommunityAside.module.css'

function CommunityAside({ communityName, hours, community }) {
  const [showRFI, setShowRFI] = useState(false)
  const tourBtnRef = useRef(null)
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

      <WhatsAppButton
        variant="inline"
        label="Text With Us"
        url={buildWhatsAppUrl(whatsappNumber, buildTextWithUsMessage(community ?? { name: communityName }))}
      />

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

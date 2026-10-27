import { Outlet } from 'react-router-dom'
import PromoBar from '../PromoBar'
import Header from '../Header'
import Footer from '../Footer'
import WhatsAppButton from '../../ui/WhatsAppButton'
import { useScrollToTop } from '../../../hooks/useScrollToTop'
import { useModalOpen } from '../../../hooks/useModalOpen'
import { buildWhatsAppUrl, buildGeneralMessage } from '../../../utils/whatsapp'
import styles from './MainLayout.module.css'

function MainLayout() {
  useScrollToTop()
  const modalOpen = useModalOpen()
  const floatingUrl = buildWhatsAppUrl(buildGeneralMessage())

  return (
    <>
      <PromoBar />
      <Header />
      <main id="main-content" className={styles.main} tabIndex={-1}>
        <Outlet />
      </main>
      <Footer />
      {!modalOpen && (
        <WhatsAppButton variant="floating" url={floatingUrl} />
      )}
    </>
  )
}

export default MainLayout

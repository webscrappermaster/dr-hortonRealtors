import { Outlet } from 'react-router-dom'
import PromoBar from '../PromoBar'
import Header from '../Header'
import Footer from '../Footer'
import WhatsAppButton from '../../ui/WhatsAppButton'
import { SiteSettingsProvider } from '../../../app/providers/SiteSettingsProvider'
import { useSiteSettings } from '../../../hooks/useSiteSettings'
import { useScrollToTop } from '../../../hooks/useScrollToTop'
import { useModalOpen } from '../../../hooks/useModalOpen'
import { buildWhatsAppUrl, buildGeneralMessage } from '../../../utils/whatsapp'
import styles from './MainLayout.module.css'

function MainLayoutInner() {
  useScrollToTop()
  const modalOpen = useModalOpen()
  const { whatsappNumber } = useSiteSettings()
  const floatingUrl = buildWhatsAppUrl(whatsappNumber, buildGeneralMessage())

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

function MainLayout() {
  return (
    <SiteSettingsProvider>
      <MainLayoutInner />
    </SiteSettingsProvider>
  )
}

export default MainLayout

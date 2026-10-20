import { Outlet } from 'react-router-dom'
import PromoBar from '../PromoBar'
import Header from '../Header'
import Footer from '../Footer'
import { useScrollToTop } from '../../../hooks/useScrollToTop'
import styles from './MainLayout.module.css'

function MainLayout() {
  useScrollToTop()
  return (
    <>
      <PromoBar />
      <Header />
      <main id="main-content" className={styles.main} tabIndex={-1}>
        <Outlet />
      </main>
      <Footer />
    </>
  )
}

export default MainLayout

import { Outlet } from 'react-router-dom'
import PromoBar from '../PromoBar'
import Header from '../Header'
import Footer from '../Footer'
import styles from './MainLayout.module.css'

function MainLayout() {
  return (
    <>
      <PromoBar />
      <Header />
      <main className={styles.main}>
        <Outlet />
      </main>
      <Footer />
    </>
  )
}

export default MainLayout

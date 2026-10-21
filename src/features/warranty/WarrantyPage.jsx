import CareTabs from '../../components/ui/CareTabs'
import WarrantyForm from './components/WarrantyForm'
import styles from './WarrantyPage.module.css'

function WarrantyPage() {
  return (
    <div className={styles.page}>
      <CareTabs />
      <div className={styles.content}>
        <div className={styles.narrow}>
          <div className={styles.lead}>
            <p>
              Maintenance tips, warranty guides and FAQs can be found in the Maintenance resources
              tab. You may be able to quickly resolve some of the more common concerns that can arise.
            </p>
            <p>
              If you still need assistance, please submit a warranty request by entering your zip
              code and selecting your address from the drop-down that will appear.
            </p>
          </div>
          <WarrantyForm />
        </div>
      </div>
    </div>
  )
}

export default WarrantyPage

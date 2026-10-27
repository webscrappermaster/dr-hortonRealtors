import CareTabs from '../../components/ui/CareTabs'
import ContactForm from './components/ContactForm'
import OfficeAccordion from './components/OfficeAccordion'
import WhatsAppButton from '../../components/ui/WhatsAppButton'
import { buildWhatsAppUrl, buildGeneralMessage } from '../../utils/whatsapp'
import styles from './ContactPage.module.css'

function ContactPage() {
  return (
    <div className={styles.page}>
      <CareTabs />
      <div className={styles.content}>
        <div className={styles.narrow}>
          <div className={styles.lead}>
            <p>
              Our frequently asked questions may have the answer you need. If you are unable
              to find what you need, please complete the contact us form.
            </p>
            <p>
              If you need to contact your local division office, you can find your local office{' '}
              <a href="#find-an-office" className={styles.blueLink}>here</a>.
            </p>
          </div>

          <div className={styles.whatsappOption}>
            <p className={styles.whatsappLabel}>Or reach us instantly on WhatsApp:</p>
            <WhatsAppButton
              variant="inline"
              url={buildWhatsAppUrl(buildGeneralMessage())}
            />
          </div>

          <ContactForm />
        </div>
      </div>
      <OfficeAccordion />
    </div>
  )
}

export default ContactPage

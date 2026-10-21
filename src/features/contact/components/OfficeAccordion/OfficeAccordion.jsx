import { useState, useId } from 'react'
import { localOffices, nationalOffices } from '../../data/offices'
import styles from './OfficeAccordion.module.css'

function OfficeCard({ office }) {
  return (
    <div className={styles.officeCard}>
      <h4 className={styles.officeName}>{office.name}</h4>
      <address className={styles.officeAddress}>
        {office.address && <span>{office.address}</span>}
        {office.city && <span>{office.city}</span>}
        {office.phone && (
          <span>
            <a href={`tel:${office.phone.replace(/\D/g, '')}`}>{office.phone}</a>
          </span>
        )}
        {office.phoneAlt && (
          <span>
            {office.phoneAltLabel && `${office.phoneAltLabel}: `}
            <a href={`tel:${office.phoneAlt.replace(/\D/g, '')}`}>{office.phoneAlt}</a>
          </span>
        )}
        {office.email && (
          <span>
            <a href={`mailto:${office.email}`}>{office.email}</a>
          </span>
        )}
      </address>
    </div>
  )
}

function StateAccordionItem({ stateEntry, defaultExpanded = false }) {
  const [open, setOpen] = useState(defaultExpanded)
  const panelId = useId()

  return (
    <div className={styles.item}>
      <button
        type="button"
        className={`${styles.trigger} ${open ? styles.triggerOpen : ''}`}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen(prev => !prev)}
      >
        {stateEntry.state}
        <span className={styles.chevron} aria-hidden="true" />
      </button>
      <section
        id={panelId}
        className={`${styles.panel} ${open ? styles.panelOpen : ''}`}
        aria-hidden={!open}
      >
        <div className={styles.officesGrid}>
          {stateEntry.offices.map(office => (
            <OfficeCard key={`${stateEntry.state}-${office.name}`} office={office} />
          ))}
        </div>
      </section>
    </div>
  )
}

function OfficeAccordion() {
  const [tab, setTab] = useState('local')

  return (
    <section className={styles.section} id="find-an-office">
      <div className={styles.header}>
        <h2 className={styles.heading}>Find an Office</h2>
        <p className={styles.lead}>
          For the address and telephone number of the division or region office in your area,
          please select from the options below.
        </p>
      </div>

      <div className={styles.tabBar} role="tablist" aria-label="Office type tabs">
        <button
          role="tab"
          aria-selected={tab === 'local'}
          className={`${styles.tabBtn} ${tab === 'local' ? styles.tabBtnActive : ''}`}
          onClick={() => setTab('local')}
        >
          Local offices
        </button>
        <button
          role="tab"
          aria-selected={tab === 'national'}
          className={`${styles.tabBtn} ${tab === 'national' ? styles.tabBtnActive : ''}`}
          onClick={() => setTab('national')}
        >
          National offices
        </button>
      </div>

      {tab === 'local' && (
        <div className={styles.accordion} role="list">
          {localOffices.map(entry => (
            <StateAccordionItem key={entry.state} stateEntry={entry} />
          ))}
        </div>
      )}

      {tab === 'national' && (
        <div className={styles.nationalGrid}>
          {nationalOffices.map(office => (
            <OfficeCard key={office.name} office={office} />
          ))}
        </div>
      )}
    </section>
  )
}

export default OfficeAccordion

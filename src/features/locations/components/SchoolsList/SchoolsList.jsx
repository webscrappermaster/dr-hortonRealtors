import styles from './SchoolsList.module.css'

function SchoolsList({ schools = [] }) {
  if (!schools.length) return null

  return (
    <section className={styles.section}>
      <h2 className={styles.heading}>Nearby Schools</h2>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th scope="col" className={styles.th}>School</th>
              <th scope="col" className={styles.th}>Type</th>
              <th scope="col" className={styles.th}>Grades</th>
              <th scope="col" className={styles.th}>Distance</th>
            </tr>
          </thead>
          <tbody>
            {schools.map(school => (
              <tr key={school.name} className={styles.row}>
                <td className={styles.tdName}>{school.name}</td>
                <td className={styles.td}>{school.type}</td>
                <td className={styles.td}>{school.grades}</td>
                <td className={styles.td}>
                  {school.distanceMi != null ? `${school.distanceMi} mi` : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default SchoolsList

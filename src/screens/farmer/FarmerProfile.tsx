import FarmerLayout from './FarmerLayout'
import Card from '../../components/Card/Card'
import StatusBadge from '../../components/StatusBadge/StatusBadge'
import styles from './FarmerProfile.module.css'

export default function FarmerProfile() {
  return (
    <FarmerLayout>
      <div className={styles.page}>

        <section className={styles.section}>
          <h1 className={styles.pageTitle}>Rajan Patil</h1>
          <p className={styles.location}>Nashik, Maharashtra</p>
          <div className={styles.trustRow}>
            <StatusBadge variant="success" label="Verified Farmer" />
            <StatusBadge variant="info" label="FPO Backed" />
          </div>
          <p className={styles.memberSince}>Member since 2022</p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionHeading}>Account details</h2>
          <Card>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Registration no.</span>
              <span className={styles.detailValue}>MH-NAS-2022-04817</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Bank account</span>
              <span className={styles.detailValue}>•••• •••• 4821</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Linked FPO</span>
              <span className={styles.detailValue}>Nashik Farmers Collective</span>
            </div>
          </Card>
        </section>

      </div>
    </FarmerLayout>
  )
}

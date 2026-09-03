import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PlusCircle } from 'lucide-react'
import FarmerLayout from './FarmerLayout'
import Button from '../../components/Button/Button'
import Tabs from '../../components/Tabs/Tabs'
import ListingCard from '../../components/ListingCard/ListingCard'
import StateView from '../../components/StateView/StateView'
import { useLots } from '../../context/LotsContext'
import styles from './FarmerActivity.module.css'

type ActivityTab = 'lots' | 'deals' | 'payments'

const TABS = [
  { value: 'lots', label: 'Lots' },
  { value: 'deals', label: 'Deals' },
  { value: 'payments', label: 'Payments' },
]

export default function FarmerActivity() {
  const navigate = useNavigate()
  const { lots } = useLots()
  const [activeTab, setActiveTab] = useState<ActivityTab>('lots')

  return (
    <FarmerLayout title="My activity">
      <div className={styles.page}>
        <div className={styles.header}>
          <h1 className={styles.pageTitle}>My activity</h1>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/farmer/lots/create')}
          >
            <PlusCircle size={16} />
            List a lot
          </Button>
        </div>

        <Tabs
          tabs={TABS}
          active={activeTab}
          onChange={v => setActiveTab(v as ActivityTab)}
        />

        <div className={styles.tabContent}>
          {activeTab === 'lots' && (
            lots.length === 0 ? (
              <StateView
                kind="empty-lots"
                title="No lots yet"
                description="List your first crop to start selling on Krishi Mitra."
                action={{ label: 'List your first crop', onClick: () => navigate('/farmer/lots/create') }}
              />
            ) : (
              <div className={styles.lotsGrid}>
                {lots.map(lot => (
                  <ListingCard key={lot.id} lot={lot} />
                ))}
              </div>
            )
          )}

          {activeTab === 'deals' && (
            <StateView
              kind="empty-deals"
              title="No deals yet"
              description="Deals appear here after a buyer accepts your lot. List a lot to get started."
              action={{ label: 'View market', onClick: () => navigate('/farmer/market') }}
            />
          )}

          {activeTab === 'payments' && (
            <StateView
              kind="empty-payments"
              title="No payments yet"
              description="Payment records will appear here once your deals are completed."
            />
          )}
        </div>
      </div>
    </FarmerLayout>
  )
}

import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { CheckCircle, X } from 'lucide-react'
import FarmerLayout from './FarmerLayout'
import Card from '../../components/Card/Card'
import StatusBadge from '../../components/StatusBadge/StatusBadge'
import TrustBadge from '../../components/TrustBadge/TrustBadge'
import Timeline from '../../components/Timeline/Timeline'
import StateView from '../../components/StateView/StateView'
import type { TimelineItem } from '../../components/Timeline/Timeline'
import type { StatusVariant } from '../../components/StatusBadge/StatusBadge'
import { useLots } from '../../context/LotsContext'
import type { LotStatus } from '../../types/lot'
import { cx } from '../../lib/cx'
import styles from './FarmerLotDetail.module.css'

const STATUS_CONFIG: Record<LotStatus, { variant: StatusVariant; label: string; explanation: string }> = {
  draft: {
    variant: 'offline',
    label: 'Draft',
    explanation: 'This lot has not been submitted yet.',
  },
  pending: {
    variant: 'warning',
    label: 'Pending verification',
    explanation: 'Your lot is being reviewed. You will be notified once it goes live on the market.',
  },
  active: {
    variant: 'info',
    label: 'Active on market',
    explanation: 'Your lot is live and visible to buyers. You will be notified when an offer arrives.',
  },
  sold: {
    variant: 'success',
    label: 'Sold',
    explanation: 'Your lot has been sold. Check the Deals tab for delivery details.',
  },
  completed: {
    variant: 'success',
    label: 'Completed',
    explanation: 'This lot has been fully settled. Check Payments for your receipt.',
  },
}

function buildTimeline(status: LotStatus, createdAt: string): TimelineItem[] {
  const createdDate = new Date(createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return [
    {
      title: 'Lot submitted',
      description: 'Your lot details have been received.',
      time: createdDate,
      state: 'done',
    },
    {
      title: 'Under verification',
      description: 'Our team reviews crop details and validates your listing.',
      state:
        status === 'pending'
          ? 'current'
          : ['active', 'sold', 'completed'].includes(status)
            ? 'done'
            : 'pending',
    },
    {
      title: 'Live on market',
      description: 'Lot is visible to verified buyers on the platform.',
      state:
        status === 'active'
          ? 'current'
          : ['sold', 'completed'].includes(status)
            ? 'done'
            : 'pending',
    },
    {
      title: 'Offer received',
      description: 'A buyer has placed an offer on your lot.',
      state: ['sold', 'completed'].includes(status) ? 'done' : 'pending',
    },
  ]
}

export default function FarmerLotDetail() {
  const { lotId } = useParams<{ lotId: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { getLot } = useLots()

  const [showSuccess, setShowSuccess] = useState(!!location.state?.fromCreate)

  // Clear the navigation state so the banner doesn't persist on refresh
  useEffect(() => {
    if (location.state?.fromCreate) {
      navigate(location.pathname, { replace: true, state: {} })
    }
  }, [])

  const lot = getLot(lotId ?? '')

  if (!lot) {
    return (
      <FarmerLayout title="Lot detail" onBack={() => navigate('/farmer/activity')}>
        <StateView
          kind="error"
          title="Lot not found"
          description="We could not find this lot. It may have been removed."
          action={{ label: 'View all lots', onClick: () => navigate('/farmer/activity') }}
        />
      </FarmerLayout>
    )
  }

  const { variant, label, explanation } = STATUS_CONFIG[lot.status]
  const timeline = buildTimeline(lot.status, lot.createdAt)
  const estimatedValue = lot.quantity * lot.expectedPrice

  return (
    <FarmerLayout
      title={lot.id}
      onBack={() => navigate('/farmer/activity')}
    >
      <div className={styles.page}>
        {/* Success banner */}
        {showSuccess && (
          <div className={styles.successBanner} role="alert">
            <CheckCircle size={20} className={styles.successIcon} />
            <div className={styles.successContent}>
              <p className={styles.successTitle}>Your lot has been submitted successfully</p>
              <p className={styles.successId}>
                Lot ID: <span className={styles.lotIdMono}>{lot.id}</span>
              </p>
              <p className={styles.successNote}>
                Pending verification — our team will review your lot within 24 hours.
              </p>
            </div>
            <button
              type="button"
              className={styles.dismissBtn}
              onClick={() => setShowSuccess(false)}
              aria-label="Dismiss"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Status section */}
        <Card>
          <div className={styles.statusRow}>
            <StatusBadge variant={variant} label={label} />
          </div>
          <p className={styles.statusExplanation}>{explanation}</p>
        </Card>

        {/* Lot details */}
        <Card>
          <h2 className={styles.sectionHeading}>Lot details</h2>
          <div className={styles.detailRows}>
            <div className={styles.detailRow}>
              <span className={styles.detailKey}>Crop</span>
              <span className={styles.detailVal}>{lot.crop}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailKey}>Variety</span>
              <span className={styles.detailVal}>{lot.variety}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailKey}>Grade</span>
              <span className={styles.detailVal}>Grade {lot.grade}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailKey}>Mandi</span>
              <span className={styles.detailVal}>{lot.mandi}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailKey}>Quantity</span>
              <span className={styles.detailVal} data-numeric="">{lot.quantity} quintal</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailKey}>Expected price</span>
              <span className={styles.detailVal} data-numeric="">
                ₹{lot.expectedPrice.toLocaleString('en-IN')}/qtl
              </span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailKey}>Est. total value</span>
              <span className={cx(styles.detailVal, styles.detailValAccent)} data-numeric="">
                ₹{estimatedValue.toLocaleString('en-IN')}
              </span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailKey}>Payment mode</span>
              <span className={styles.detailVal}>
                {lot.paymentMode === 'escrow' ? 'Escrow' : 'Direct bank transfer'}
                <span className={styles.paymentNote}> · informational</span>
              </span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailKey}>Lab assaying</span>
              <span className={styles.detailVal}>{lot.assaying ? 'Yes' : 'No'}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailKey}>Submitted</span>
              <span className={styles.detailVal}>
                {new Date(lot.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>

          {lot.imagePreviews.length > 0 && (
            <div className={styles.imageRow}>
              <p className={styles.imageLabel}>Produce photos</p>
              <div className={styles.imageThumbs}>
                {lot.imagePreviews.map((src, i) => (
                  <img key={i} src={src} alt={`Produce photo ${i + 1}`} className={styles.imageThumb} />
                ))}
              </div>
            </div>
          )}

          <div className={styles.trustRow}>
            <TrustBadge type="escrow" />
            {lot.assaying && <TrustBadge type="assayed" />}
            <TrustBadge type="verified-farmer" />
          </div>
        </Card>

        {/* Timeline */}
        <Card>
          <h2 className={styles.sectionHeading}>Status timeline</h2>
          <Timeline items={timeline} />
        </Card>

        {/* Actions */}
        <div className={styles.actionsRow}>
          <button type="button" disabled className={styles.disabledAction}>
            Edit lot
          </button>
          <span className={styles.disabledNote}>Available after verification</span>
          <button type="button" disabled className={cx(styles.disabledAction, styles.dangerAction)}>
            Withdraw lot
          </button>
        </div>
      </div>
    </FarmerLayout>
  )
}

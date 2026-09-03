import { Check, X } from 'lucide-react'
import { cx } from '../../lib/cx'
import styles from './Timeline.module.css'

export type TimelineItemState = 'done' | 'current' | 'pending' | 'failed'

export interface TimelineItem {
  title: string
  description?: string
  time?: string
  state: TimelineItemState
}

interface TimelineProps {
  items: TimelineItem[]
}

export default function Timeline({ items }: TimelineProps) {
  return (
    <div className={styles.timeline}>
      {items.map((item, i) => (
        <div key={i} className={cx(styles.item, styles[item.state])}>
          <div className={styles.track}>
            <div className={styles.dot}>
              {item.state === 'done' && <Check size={12} strokeWidth={2.5} />}
              {item.state === 'failed' && <X size={12} strokeWidth={2.5} />}
              {item.state === 'current' && <span className={styles.pulse} />}
            </div>
            {i < items.length - 1 && <div className={styles.line} />}
          </div>
          <div className={styles.content}>
            <p className={styles.title}>{item.title}</p>
            {item.description && <p className={styles.description}>{item.description}</p>}
            {item.time && <p className={styles.time}>{item.time}</p>}
          </div>
        </div>
      ))}
    </div>
  )
}

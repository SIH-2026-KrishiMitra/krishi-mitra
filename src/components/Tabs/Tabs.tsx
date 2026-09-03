import { cx } from '../../lib/cx'
import styles from './Tabs.module.css'

interface Tab {
  value: string
  label: string
}

interface TabsProps {
  tabs: Tab[]
  active: string
  onChange: (value: string) => void
}

export default function Tabs({ tabs, active, onChange }: TabsProps) {
  return (
    <div className={styles.tablist} role="tablist">
      {tabs.map(tab => (
        <button
          key={tab.value}
          role="tab"
          type="button"
          aria-selected={active === tab.value}
          className={cx(styles.tab, active === tab.value ? styles.active : undefined)}
          onClick={() => onChange(tab.value)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

import type { ReactNode, MouseEventHandler, KeyboardEvent as RKeyboardEvent } from 'react'
import { cx } from '../../lib/cx'
import styles from './Card.module.css'

interface CardProps {
  children: ReactNode
  interactive?: boolean
  className?: string
  onClick?: MouseEventHandler<HTMLDivElement>
}

export default function Card({ children, interactive, className, onClick }: CardProps) {
  const handleKeyDown = (e: RKeyboardEvent<HTMLDivElement>) => {
    if ((e.key === 'Enter' || e.key === ' ') && onClick) {
      e.preventDefault()
      e.currentTarget.click()
    }
  }

  return (
    <div
      className={cx(styles.card, interactive ? styles.interactive : undefined, className)}
      onClick={onClick}
      onKeyDown={interactive ? handleKeyDown : undefined}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
    >
      {children}
    </div>
  )
}

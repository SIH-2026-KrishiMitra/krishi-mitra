import { cx } from '../../lib/cx'
import styles from './Skeleton.module.css'

interface SkeletonProps {
  height?: number | string
  width?: string
  className?: string
  rounded?: boolean
}

export default function Skeleton({
  height = 20,
  width = '100%',
  className,
  rounded,
}: SkeletonProps) {
  return (
    <div
      className={cx(styles.skeleton, rounded ? styles.rounded : undefined, className)}
      style={{
        height: typeof height === 'number' ? `${height}px` : height,
        width,
      }}
      aria-hidden="true"
    />
  )
}

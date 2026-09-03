import type { SelectHTMLAttributes } from 'react'
import { cx } from '../../lib/cx'
import styles from './Select.module.css'

interface SelectOption {
  value: string
  label: string
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'id'> {
  label: string
  id: string
  options: SelectOption[]
  placeholder?: string
  error?: string
  helperText?: string
}

export default function Select({
  label,
  id,
  options,
  placeholder,
  error,
  helperText,
  className,
  ...rest
}: SelectProps) {
  const helperId = `${id}-helper`
  const hasHelper = Boolean(helperText ?? error)

  return (
    <div className={styles.wrapper}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <div className={styles.selectWrap}>
        <select
          id={id}
          className={cx(styles.select, error ? styles.hasError : undefined, className)}
          aria-describedby={hasHelper ? helperId : undefined}
          aria-invalid={error ? true : undefined}
          {...rest}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <span className={styles.chevron} aria-hidden="true">▾</span>
      </div>
      {hasHelper && (
        <p id={helperId} className={error ? styles.errorText : styles.helperText}>
          {error ?? helperText}
        </p>
      )}
    </div>
  )
}

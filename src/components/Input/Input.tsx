import type { InputHTMLAttributes } from 'react'
import { cx } from '../../lib/cx'
import styles from './Input.module.css'

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  label: string
  id: string
  helperText?: string
  error?: string
}

export default function Input({ label, id, helperText, error, className, ...rest }: InputProps) {
  const helperId = `${id}-helper`
  const hasHelper = Boolean(helperText ?? error)

  return (
    <div className={styles.wrapper}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <input
        id={id}
        className={cx(styles.input, error ? styles.hasError : undefined, className)}
        aria-describedby={hasHelper ? helperId : undefined}
        aria-invalid={error ? true : undefined}
        {...rest}
      />
      {hasHelper && (
        <p id={helperId} className={error ? styles.errorText : styles.helperText}>
          {error ?? helperText}
        </p>
      )}
    </div>
  )
}

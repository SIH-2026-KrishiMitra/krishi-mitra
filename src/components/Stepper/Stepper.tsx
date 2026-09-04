import { Check } from 'lucide-react'
import { cx } from '../../lib/cx'
import styles from './Stepper.module.css'

interface StepperProps {
  steps: string[]
  currentStep: number
}

export default function Stepper({ steps, currentStep }: StepperProps) {
  return (
    <div
      className={styles.stepper}
      role="progressbar"
      aria-valuenow={currentStep + 1}
      aria-valuemin={1}
      aria-valuemax={steps.length}
      aria-label={`Step ${currentStep + 1} of ${steps.length}: ${steps[currentStep]}`}
    >
      {steps.map((label, i) => {
        const state = i < currentStep ? 'done' : i === currentStep ? 'current' : 'pending'
        return (
          <div key={i} className={styles.stepWrapper}>
            <div className={cx(styles.step, styles[state])}>
              <div className={styles.circle}>
                {i < currentStep ? <Check size={14} strokeWidth={2.5} /> : <span>{i + 1}</span>}
              </div>
              <span className={styles.label}>{label}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={cx(styles.connector, i < currentStep ? styles.connectorDone : undefined)} />
            )}
          </div>
        )
      })}
    </div>
  )
}

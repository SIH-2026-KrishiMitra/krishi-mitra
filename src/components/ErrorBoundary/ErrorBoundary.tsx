import { Component, type ReactNode, type ErrorInfo } from 'react'
import styles from './ErrorBoundary.module.css'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback
      return (
        <div className={styles.wrap}>
          <div className={styles.card}>
            <div className={styles.icon}>⚠</div>
            <h2 className={styles.title}>Something went wrong</h2>
            <p className={styles.message}>{this.state.error?.message ?? 'An unexpected error occurred.'}</p>
            <button type="button" className={styles.retryBtn}
              onClick={() => this.setState({ hasError: false, error: null })}>
              Try again
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

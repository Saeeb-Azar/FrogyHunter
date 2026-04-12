import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  err: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { err: null }

  static getDerivedStateFromError(err: Error): State {
    return { err }
  }

  componentDidCatch(err: Error, info: ErrorInfo) {
    console.error('ErrorBoundary:', err, info.componentStack)
  }

  render() {
    if (this.state.err) {
      return (
        <div
          style={{
            minHeight: '100dvh',
            padding: '1.5rem',
            fontFamily: 'system-ui, sans-serif',
            background: '#0f172a',
            color: '#e2e8f0',
          }}
        >
          <h1 style={{ fontSize: '1.25rem', margin: '0 0 0.75rem' }}>Etwas ist schiefgelaufen</h1>
          <pre
            style={{
              whiteSpace: 'pre-wrap',
              fontSize: '0.85rem',
              background: '#1e293b',
              padding: '1rem',
              borderRadius: 8,
              color: '#fda4af',
            }}
          >
            {this.state.err.message}
          </pre>
          <button
            type="button"
            style={{
              marginTop: '1rem',
              padding: '0.5rem 1rem',
              cursor: 'pointer',
              borderRadius: 8,
              border: 'none',
              fontWeight: 600,
              background: '#22c55e',
              color: '#052e16',
            }}
            onClick={() => window.location.reload()}
          >
            Seite neu laden
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

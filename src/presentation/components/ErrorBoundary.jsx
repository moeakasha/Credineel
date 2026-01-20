import React from 'react'
import PropTypes from 'prop-types'

/**
 * Error Boundary Component
 * Catches React errors and displays a fallback UI
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    this.setState({
      error,
      errorInfo,
    })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '2rem',
          fontFamily: 'Poppins, sans-serif',
          backgroundColor: '#000000',
          color: '#ffffff',
        }}>
          <h1 style={{ fontSize: '24px', marginBottom: '1rem' }}>Something went wrong</h1>
          <p style={{ marginBottom: '1rem', color: '#9CA3AF' }}>
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <details style={{ marginTop: '1rem', color: '#9CA3AF', maxWidth: '600px' }}>
            <summary style={{ cursor: 'pointer', marginBottom: '0.5rem' }}>Error Details</summary>
            <pre style={{
              backgroundColor: '#1F2937',
              padding: '1rem',
              borderRadius: '8px',
              overflow: 'auto',
              fontSize: '12px',
            }}>
              {this.state.error?.toString()}
              {this.state.errorInfo?.componentStack}
            </pre>
          </details>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '1rem',
              padding: '0.75rem 1.5rem',
              backgroundColor: '#4C13F8',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontFamily: 'Poppins, sans-serif',
              fontSize: '14px',
              fontWeight: '600',
            }}
          >
            Reload Page
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
}

export default ErrorBoundary

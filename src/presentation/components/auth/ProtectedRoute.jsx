import { Navigate, useLocation } from 'react-router-dom'
import PropTypes from 'prop-types'
import { useAuth } from '../../context/AuthContext.jsx'

/**
 * Protected Route Component
 * Redirects to login if user is not authenticated
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="auth-loading">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    // Save the attempted URL for redirecting after login
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Render protected content
  return children
}

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
}

export default ProtectedRoute

import { createContext, useContext, useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { AuthService } from '../../infrastructure/services/AuthService.js'

/**
 * Auth Context
 * Provides authentication state and methods throughout the app
 */
const AuthContext = createContext(null)

/**
 * Auth Provider Component
 * Wraps the app and provides auth state management
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const authService = new AuthService()

  // Check for existing session on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const currentUser = await authService.getCurrentUser()
        setUser(currentUser)
      } catch (err) {
        // Don't set error on initialization - just log it
        // This allows the app to load even if Supabase isn't configured
        console.warn('Auth initialization warning:', err.message)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    initAuth()

    // Subscribe to auth state changes
    let subscription
    try {
      subscription = authService.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email,
            name: session.user.user_metadata?.name || session.user.email.split('@')[0],
            createdAt: session.user.created_at,
          })
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
        }
      })
    } catch (err) {
      console.warn('Auth state change subscription warning:', err.message)
    }

    // Cleanup subscription on unmount
    return () => {
      if (subscription?.unsubscribe) {
        subscription.unsubscribe()
      }
    }
  }, [])

  /**
   * Login with email and password
   */
  const login = async (email, password) => {
    setError(null)
    try {
      const userData = await authService.authenticate(email, password)
      setUser(userData)
      return { success: true, user: userData }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    }
  }

  /**
   * Sign up with email and password
   */
  const signUp = async (email, password, metadata = {}) => {
    setError(null)
    try {
      const userData = await authService.signUp(email, password, metadata)
      setUser(userData)
      return { success: true, user: userData }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    }
  }

  /**
   * Logout current user
   */
  const logout = async () => {
    setError(null)
    try {
      await authService.logout()
      setUser(null)
      return { success: true }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    }
  }

  /**
   * Clear any auth errors
   */
  const clearError = () => {
    setError(null)
  }

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    signUp,
    logout,
    clearError,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
}

/**
 * Custom hook to use auth context
 * @returns {Object} Auth context value
 */
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext

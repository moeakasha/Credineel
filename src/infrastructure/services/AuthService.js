import { supabase, isConfigured } from '../supabase/supabaseClient.js'

/**
 * Authentication Service
 * Handles authentication via Supabase
 */
export class AuthService {
  /**
   * Authenticate user with email and password
   * @param {string} email - User's email
   * @param {string} password - User's password
   * @returns {Promise<Object>} User data on success
   */
  async authenticate(email, password) {
    if (!isConfigured) {
      throw new Error('Supabase is not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.')
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw new Error(error.message || 'Invalid email or password')
      }

      if (!data || !data.user) {
        throw new Error('Authentication failed: No user data returned')
      }

      return {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.name || data.user.email.split('@')[0],
        createdAt: data.user.created_at,
      }
    } catch (error) {
      // Re-throw with a more user-friendly message
      if (error.message) {
        throw error
      }
      throw new Error('Authentication failed. Please check your credentials and try again.')
    }
  }

  /**
   * Sign up a new user
   * @param {string} email - User's email
   * @param {string} password - User's password
   * @param {Object} metadata - Additional user metadata
   * @returns {Promise<Object>} User data on success
   */
  async signUp(email, password, metadata = {}) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    })

    if (error) {
      throw new Error(error.message || 'Sign up failed')
    }

    return {
      id: data.user.id,
      email: data.user.email,
      name: metadata.name || data.user.email.split('@')[0],
      createdAt: data.user.created_at,
    }
  }

  /**
   * Sign out the current user
   * @returns {Promise<boolean>} True on success
   */
  async logout() {
    const { error } = await supabase.auth.signOut()

    if (error) {
      throw new Error(error.message || 'Logout failed')
    }

    return true
  }

  /**
   * Get the current authenticated user
   * @returns {Promise<Object|null>} User data or null if not authenticated
   */
  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()

      if (error || !user) {
        return null
      }

      return {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name || user.email.split('@')[0],
        createdAt: user.created_at,
      }
    } catch (error) {
      // Return null instead of throwing - allows app to continue loading
      console.warn('Error getting current user:', error)
      return null
    }
  }

  /**
   * Get the current session
   * @returns {Promise<Object|null>} Session data or null
   */
  async getSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()

      if (error || !session) {
        return null
      }

      return session
    } catch (error) {
      console.warn('Error getting session:', error)
      return null
    }
  }

  /**
   * Subscribe to auth state changes
   * @param {Function} callback - Callback function (event, session) => void
   * @returns {Object} Subscription object with unsubscribe method
   */
  onAuthStateChange(callback) {
    try {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(callback)
      return subscription
    } catch (error) {
      console.warn('Error setting up auth state change listener:', error)
      // Return a mock subscription object to prevent crashes
      return {
        unsubscribe: () => {}
      }
    }
  }
}

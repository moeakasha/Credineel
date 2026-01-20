/**
 * Authentication Repository Interface
 * Defines the contract for authentication operations
 */
export class IAuthRepository {
  /**
   * Authenticates a user with credentials
   * @param {LoginCredentials} credentials - User login credentials
   * @returns {Promise<User>} - Authenticated user
   * @throws {Error} - If authentication fails
   */
  async login(credentials) {
    throw new Error('login method must be implemented')
  }

  /**
   * Logs out the current user
   * @returns {Promise<void>}
   */
  async logout() {
    throw new Error('logout method must be implemented')
  }

  /**
   * Gets the current authenticated user
   * @returns {Promise<User|null>}
   */
  async getCurrentUser() {
    throw new Error('getCurrentUser method must be implemented')
  }
}

/**
 * Login Use Case
 * Application-level business logic for user authentication
 */
export class LoginUseCase {
  constructor(authRepository) {
    if (!authRepository) {
      throw new Error('AuthRepository is required')
    }
    this.authRepository = authRepository
  }

  /**
   * Executes the login use case
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<User>} - Authenticated user
   * @throws {Error} - If login fails
   */
  async execute(email, password) {
    try {
      const { LoginCredentials } = await import(
        '../../../domain/value-objects/LoginCredentials.js'
      )
      const credentials = new LoginCredentials(email, password)
      const user = await this.authRepository.login(credentials)
      return user
    } catch (error) {
      throw new Error(`Login failed: ${error.message}`)
    }
  }
}

import { IAuthRepository } from '../../domain/repositories/IAuthRepository.js'
import { User } from '../../domain/entities/User.js'

/**
 * Authentication Repository Implementation
 * Infrastructure layer implementation of the auth repository
 */
export class AuthRepository extends IAuthRepository {
  constructor(authService) {
    super()
    if (!authService) {
      throw new Error('AuthService is required')
    }
    this.authService = authService
  }

  async login(credentials) {
    try {
      const response = await this.authService.authenticate(
        credentials.email,
        credentials.password
      )
      return User.fromJSON(response)
    } catch (error) {
      throw new Error(error.message || 'Authentication failed')
    }
  }

  async logout() {
    try {
      await this.authService.logout()
    } catch (error) {
      throw new Error(error.message || 'Logout failed')
    }
  }

  async getCurrentUser() {
    try {
      const userData = await this.authService.getCurrentUser()
      return userData ? User.fromJSON(userData) : null
    } catch (error) {
      return null
    }
  }
}

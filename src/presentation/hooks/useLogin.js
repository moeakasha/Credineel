import { useState } from 'react'
import { LoginUseCase } from '../../application/use-cases/auth/LoginUseCase.js'
import { AuthRepository } from '../../infrastructure/repositories/AuthRepository.js'
import { AuthService } from '../../infrastructure/services/AuthService.js'

/**
 * Custom hook for login functionality
 * Connects the presentation layer with the application layer
 */
export const useLogin = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  // Initialize dependencies (in a real app, this would come from a dependency injection container)
  const authService = new AuthService()
  const authRepository = new AuthRepository(authService)
  const loginUseCase = new LoginUseCase(authRepository)

  const login = async (email, password) => {
    setIsLoading(true)
    setError(null)

    try {
      const user = await loginUseCase.execute(email, password)
      setIsLoading(false)
      return { success: true, user }
    } catch (err) {
      setError(err.message)
      setIsLoading(false)
      return { success: false, error: err.message }
    }
  }

  return {
    login,
    isLoading,
    error,
  }
}

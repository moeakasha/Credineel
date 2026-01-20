/**
 * Login Credentials Value Object
 * Immutable value object representing login credentials
 */
export class LoginCredentials {
  constructor(email, password) {
    if (!email || !password) {
      throw new Error('Email and password are required')
    }

    if (!this.isValidEmail(email)) {
      throw new Error('Invalid email format')
    }

    this._email = email.toLowerCase().trim()
    this._password = password
  }

  get email() {
    return this._email
  }

  get password() {
    return this._password
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  equals(other) {
    return (
      other instanceof LoginCredentials &&
      this.email === other.email &&
      this.password === other.password
    )
  }

  toJSON() {
    return {
      email: this.email,
      password: this.password,
    }
  }
}

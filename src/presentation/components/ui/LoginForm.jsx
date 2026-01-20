import PropTypes from 'prop-types'

/**
 * Login Form Component
 * Presentational component for the login form
 */
const LoginForm = ({
  email,
  password,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  isLoading,
}) => {
  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(email, password)
  }

  return (
    <form onSubmit={handleSubmit} className="login-form">
      <div className="form-group">
        <label htmlFor="email" className="form-label">
          Email*
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          className="form-input"
          required
          disabled={isLoading}
        />
      </div>

      <div className="form-group">
        <label htmlFor="password" className="form-label">
          Password*
        </label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
          className="form-input"
          required
          disabled={isLoading}
        />
      </div>

      <button type="submit" className="login-button" disabled={isLoading}>
        {isLoading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  )
}

LoginForm.propTypes = {
  email: PropTypes.string.isRequired,
  password: PropTypes.string.isRequired,
  onEmailChange: PropTypes.func.isRequired,
  onPasswordChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
}

LoginForm.defaultProps = {
  isLoading: false,
}

export default LoginForm

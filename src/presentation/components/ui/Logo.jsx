import PropTypes from 'prop-types'
import logoImage from '../../../assets/images/logo.svg'

/**
 * Logo Component
 * Presentational component for the application logo
 */
const Logo = () => {
  return (
    <div className="logo-container">
      <img src={logoImage} alt="Credyneel Logo" className="logo-image" />
    </div>
  )
}

Logo.propTypes = {}

export default Logo

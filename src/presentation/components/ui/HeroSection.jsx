import PropTypes from 'prop-types'
import coverImage from '../../../assets/images/cover.png'

/**
 * Hero Section Component
 * Presentational component for the left hero section
 */
const HeroSection = ({ heading, subheading }) => {
  return (
    <div className="login-left" style={{ backgroundImage: `url(${coverImage})` }}>
      <div className="login-left-content">
        <p className="login-left-text">{heading}</p>
        <p className="login-left-subtext">{subheading}</p>
      </div>
      <div className="landscape-overlay"></div>
    </div>
  )
}

HeroSection.propTypes = {
  heading: PropTypes.string.isRequired,
  subheading: PropTypes.string.isRequired,
}

export default HeroSection

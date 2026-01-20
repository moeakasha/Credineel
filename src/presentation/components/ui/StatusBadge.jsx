import PropTypes from 'prop-types'
import './StatusBadge.css'

/**
 * Status Badge Component
 * Displays customer status with color-coded styling
 */
const StatusBadge = ({ status }) => {
  const getStatusLabel = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1)
  }

  return (
    <span className={`status-badge status-${status.toLowerCase()}`}>
      {getStatusLabel(status)}
    </span>
  )
}

StatusBadge.propTypes = {
  status: PropTypes.oneOf(['amber', 'green', 'yellow', 'Amber', 'Green', 'Yellow']).isRequired,
}

export default StatusBadge

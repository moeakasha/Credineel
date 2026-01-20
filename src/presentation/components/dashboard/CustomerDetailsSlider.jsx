import { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import './CustomerDetailsSlider.css'

/**
 * Customer Details Slider Component
 * Displays detailed customer information in a slide-in panel
 */
const CustomerDetailsSlider = ({ isOpen, onClose, customer }) => {
  const [shouldRender, setShouldRender] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  // Handle opening animation
  useEffect(() => {
    if (isOpen && customer) {
      setShouldRender(true)
      // Force a reflow to ensure initial state is painted
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsAnimating(true)
        })
      })
    } else if (!isOpen) {
      setIsAnimating(false)
      // Wait for close animation to complete before unmounting
      const timer = setTimeout(() => {
        setShouldRender(false)
      }, 400) // Match transition duration
      return () => clearTimeout(timer)
    }
  }, [isOpen, customer])

  // Close on ESC key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  // Prevent body scroll when slider is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!shouldRender || !customer) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className={`slider-backdrop ${isAnimating ? 'visible' : ''}`}
        onClick={onClose}
      />

      {/* Slider Panel */}
      <div className={`customer-details-slider ${isAnimating ? 'open' : ''}`}>
        {/* Header */}
        <div className="slider-header">
          <h2 className="slider-title">Customer Details</h2>
          <button
            className="slider-close-btn"
            onClick={onClose}
            aria-label="Close customer details"
          >
            <span className="material-icons-outlined">close</span>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="slider-content">
          {/* Customer Header */}
          <div className="customer-header">
            <div className="customer-header-left">
              <div className="customer-avatar-large">
                <span className="avatar-text">{customer.initials}</span>
                <span className="avatar-status-badge">
                  <span className="material-icons">check</span>
                </span>
              </div>
              <div className="customer-header-info">
                <h3 className="customer-full-name">{customer.fullName}</h3>
                <p className="customer-arabic-name">{customer.arabicName}</p>
                <div className="customer-quick-info">
                  <span>{customer.branch}</span>
                  <span className="separator">•</span>
                  <span>{customer.accountNumber}</span>
                  <span className="separator">•</span>
                  <span>{customer.mobileNumber}</span>
                  <span className="separator">•</span>
                  <span>{customer.email || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="slider-body">
            {/* Left Column - Details */}
            <div className="details-column">
              {/* Personal Details */}
              <section className="details-section">
                <h4 className="section-title">Personal Details</h4>
                <div className="details-list">
                  <div className="detail-item">
                    <span className="detail-label">National ID :</span>
                    <span className="detail-value">{customer.nationalId}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Date of Birth :</span>
                    <span className="detail-value">{customer.dateOfBirth}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Joining date :</span>
                    <span className="detail-value">{customer.joiningDate}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Years with Bank :</span>
                    <span className="detail-value">{customer.yearsWithBank}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Home Address :</span>
                    <span className="detail-value">{customer.homeAddress}</span>
                  </div>
                </div>
              </section>

              {/* Family Details */}
              <section className="details-section">
                <h4 className="section-title">Family Details</h4>
                <div className="details-list">
                  <div className="detail-item">
                    <span className="detail-label">Number of Children :</span>
                    <span className="detail-value">{customer.numberOfChildren}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Marital Status :</span>
                    <span className="detail-value">{customer.maritalStatus}</span>
                  </div>
                </div>
              </section>

              {/* Employment Details */}
              <section className="details-section">
                <h4 className="section-title">Employment Details</h4>
                <div className="details-list">
                  <div className="detail-item">
                    <span className="detail-label">Job Tittle :</span>
                    <span className="detail-value">{customer.jobTitle}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Job Address :</span>
                    <span className="detail-value">{customer.jobAddress}</span>
                  </div>
                </div>
              </section>
            </div>

            {/* Right Column - Financial Overview */}
            <div className="financial-column">
              <div className="financial-overview">
                <div className="financial-header">
                  <h4 className="financial-title">Financial Overview</h4>
                  <button className={`score-button status-${customer.status}`}>
                    {customer.score || 0}
                  </button>
                </div>

                {/* Financial Metrics */}
                <div className="financial-metrics">
                  <div className="metric-item">
                    <div className="metric-icon green">
                      <span>SDG</span>
                    </div>
                    <div className="metric-info">
                      <span className="metric-label">Last Balance</span>
                      <span className="metric-value">{customer.lastBalance.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="metric-item">
                    <div className="metric-icon orange">
                      <span className="material-icons-outlined">account_balance_wallet</span>
                    </div>
                    <div className="metric-info">
                      <span className="metric-label">Avarage Balance</span>
                      <span className="metric-value">{customer.averageBalance.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="metric-item">
                    <div className="metric-icon blue">
                      <span className="material-icons-outlined">receipt_long</span>
                    </div>
                    <div className="metric-info">
                      <span className="metric-label">TXs Succes Rate</span>
                      <span className="metric-value">{customer.txSuccessRate}%</span>
                    </div>
                  </div>
                </div>

                {/* Score Gauge */}
                <div className="gauge-chart-container">
                  <div className="gauge-chart">
                    <ResponsiveContainer width={200} height={140}>
                      <PieChart>
                        <Pie
                          data={[{ value: customer.score }, { value: 100 - customer.score }]}
                          cx="50%"
                          cy="100%"
                          innerRadius={80}
                          outerRadius={100}
                          startAngle={180}
                          endAngle={0}
                          dataKey="value"
                          stroke="none"
                        >
                          <Cell fill={customer.status === 'green' ? '#007840' : customer.status === 'yellow' ? '#F8AC13' : '#DC2626'} />
                          <Cell fill="#F1F1F1" />
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="gauge-center">
                      <span className="gauge-value">
                        {customer.score || 0}
                        <span style={{ fontSize: '18px', opacity: 0.5 }}>/100</span>
                      </span>
                      <span className={`gauge-status status-${customer.status}`}>
                        Overview : {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="financial-actions">
                  <button className="action-btn secondary">
                    Download
                  </button>
                  <button className="action-btn primary">
                    Re-Calculate
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

CustomerDetailsSlider.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  customer: PropTypes.shape({
    initials: PropTypes.string,
    fullName: PropTypes.string,
    arabicName: PropTypes.string,
    nationalId: PropTypes.string,
    dateOfBirth: PropTypes.string,
    joiningDate: PropTypes.string,
    yearsWithBank: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    homeAddress: PropTypes.string,
    numberOfChildren: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    maritalStatus: PropTypes.string,
    jobTitle: PropTypes.string,
    jobAddress: PropTypes.string,
    status: PropTypes.string,
    lastBalance: PropTypes.number,
    averageBalance: PropTypes.number,
    txSuccessRate: PropTypes.number,
    score: PropTypes.number,
  }),
}

export default CustomerDetailsSlider

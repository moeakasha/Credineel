import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { fetchDashboardData } from '../../../infrastructure/services/dashboardService'
import CustomerDetailsSlider from './CustomerDetailsSlider'
import { fetchCustomerById } from '../../../infrastructure/services/customerService'
import './DashboardContent.css'

/**
 * Dashboard Content Component
 * Main content area with Portfolio Overview, Finance Health, and Customer table
 */
const DashboardContent = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [dashboardData, setDashboardData] = useState({
    metrics: {
      portfolioSize: 0,
      totalCustomers: 0,
      eligibleCustomers: 0,
      privateBanking: 0,
      greenCustomers: 0,
      yellowCustomers: 0,
      amberCustomers: 0,
      avgCreditScore: 0,
      avgSuccessRate: 0
    },
    topCustomers: [],
    eligibility: [],
    branches: []
  })
  const [isSliderOpen, setIsSliderOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState(null)

  const navigate = useNavigate()

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true)
        const data = await fetchDashboardData()
        setDashboardData(data)
        setError(null)
      } catch (err) {
        console.error('Failed to load dashboard data:', err)
        setError('Failed to load dashboard data. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  // Show error state (only if we have no data at all)
  if (error && !dashboardData.metrics.totalCustomers) {
    return (
      <main className="dashboard-content">
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '400px',
          fontSize: '18px',
          color: '#f44336'
        }}>
          {error}
        </div>
      </main>
    )
  }

  // Extract data from dashboardData
  const { metrics, topCustomers, eligibility, branches } = dashboardData

  // Format portfolio data
  const portfolioData = {
    portfolioSize: metrics.portfolioSize.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }),
    currency: 'SDG',
    totalCustomers: metrics.totalCustomers.toLocaleString(),
    eligibleCustomers: metrics.eligibleCustomers.toLocaleString(),
    privateBanking: metrics.privateBanking.toLocaleString(),
    branches: branches,
  }

  // Determine credit score status
  const getCreditScoreStatus = (score) => {
    if (score >= 70) return 'Green'
    if (score >= 40) return 'Yellow'
    return 'Amber'
  }

  const financeHealthData = {
    greenCustomers: metrics.greenCustomers.toLocaleString(),
    yellowCustomers: metrics.yellowCustomers.toLocaleString(),
    eligibilityOverview: {
      eligible: metrics.eligibleCustomers,
      nonEligible: metrics.totalCustomers - metrics.eligibleCustomers,
    },
    creditScore: {
      score: metrics.avgCreditScore,
      maxScore: 100,
      status: getCreditScoreStatus(metrics.avgCreditScore),
    },
    tnxSuccess: {
      percentage: metrics.avgSuccessRate,
      eligible: metrics.eligibleCustomers,
      nonEligible: metrics.totalCustomers - metrics.eligibleCustomers,
    },
  }

  // Format customers data
  const customers = topCustomers.map(customer => ({
    id: customer.uid,
    name: customer['Full Name'],
    initials: customer['Full Name']
      .split(' ')
      .slice(0, 2)
      .map(n => n[0])
      .join(''),
    accountNumber: customer['National ID'],
    branch: customer['Branch'],
    averageBalance: parseFloat(customer['Avarage Balance'] || 0).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }),
    lastBalance: parseFloat(customer['Last Balance'] || 0).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }),
    mobileNumber: customer['Mobile'] ? `+${customer['Mobile']}` : 'N/A',
    finalScore: customer['Final Score'],
    status: 'green' // These are filtered as Green in the service
  }))

  const handleCustomerClick = async (customer) => {
    try {
      // Fetch full details for the slider if needed, 
      // though dashboard service might not return everything
      const fullCustomer = await fetchCustomerById(customer.id)
      setSelectedCustomer(fullCustomer)
      setIsSliderOpen(true)
    } catch (error) {
      console.error('Failed to fetch customer details:', error)
      // Fallback to what we have
      setSelectedCustomer(customer)
      setIsSliderOpen(true)
    }
  }

  const handleCloseSlider = () => {
    setIsSliderOpen(false)
    setTimeout(() => setSelectedCustomer(null), 400)
  }

  // Eligibility chart data - using total counts
  const eligibilityChartData = [
    { name: 'Green', value: metrics.greenCustomers, color: '#5AB10E' },
    { name: 'Yellow', value: metrics.yellowCustomers, color: '#F8AC13' },
    { name: 'Amber', value: metrics.amberCustomers, color: '#F85F13' },
  ]

  // TNx Success chart data - using average success rate
  const tnxChartData = [
    { name: 'Success Rate', value: parseFloat(metrics.avgSuccessRate), color: '#5AB10E' },
    { name: 'Failure', value: 100 - parseFloat(metrics.avgSuccessRate), color: '#D1D1E0' },
  ]

  return (
    <main className={`dashboard-content ${loading ? 'is-loading' : ''}`}>
      {/* Portfolio Overview Section */}
      <div className="portfolio-overview-section">
        <h2 className="section-title">Portfolio Overview</h2>
        <div className="cards-grid">
          {/* Top Row - 3 Cards */}
          <div className="portfolio-card">
            <div className="card-header">
              <p className="card-label">Portfolio size</p>
              <div className="card-icon purple">
                <span className="material-icons-outlined">account_balance_wallet</span>
              </div>
            </div>
            <div className="card-content">
              <p className="card-value">
                {portfolioData.portfolioSize.split('.')[0]}
                <span className="card-decimal">.{portfolioData.portfolioSize.split('.')[1]}</span>
                <span className="card-currency">{portfolioData.currency}</span>
              </p>
            </div>
          </div>

          <div className="portfolio-card">
            <div className="card-header">
              <p className="card-label">Total Customers</p>
              <div className="card-icon purple">
                <span className="material-icons-outlined">account_circle</span>
              </div>
            </div>
            <div className="card-content">
              <p className="card-value">{portfolioData.totalCustomers}</p>
            </div>
          </div>

          <div className="portfolio-card branches-card">
            <div className="card-header">
              <p className="card-label">Branches Insights</p>
              <div className="card-icon purple">
                <span className="material-icons-outlined">account_balance</span>
              </div>
            </div>
            <div className="card-content">
              <div className="branches-list">
                {portfolioData.branches.map((branch, index) => (
                  <React.Fragment key={index}>
                    <div className="branch-item">{branch.name}</div>
                    <div className="branch-value">{branch.value}</div>
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Row - 2 Cards */}
          <div className="portfolio-card">
            <div className="card-header">
              <p className="card-label">Private Banking</p>
              <div className="card-icon purple diamond-icon">
                <span className="material-icons-outlined">diamond</span>
              </div>
            </div>
            <div className="card-content">
              <p className="card-value">{portfolioData.privateBanking}</p>
            </div>
          </div>

          <div className="portfolio-card">
            <div className="card-header">
              <p className="card-label">Eligible Customers</p>
              <div className="card-icon purple">
                <span className="material-icons-outlined">fact_check</span>
              </div>
            </div>
            <div className="card-content">
              <p className="card-value">{portfolioData.eligibleCustomers}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Finance Health Overview Section */}
      <div className="finance-health-section">
        <h2 className="section-title">Finance health Overview</h2>
        <div className="finance-health-grid">
          {/* Left Column - Two Small Cards */}
          <div className="finance-health-left">
            <div className="portfolio-card">
              <div className="card-header">
                <p className="card-label">Green customers</p>
                <div className="card-icon purple">
                  <span className="material-icons-outlined">account_balance_wallet</span>
                </div>
              </div>
              <div className="card-content">
                <p className="card-value">{financeHealthData.greenCustomers}</p>
              </div>
            </div>

            <div className="portfolio-card">
              <div className="card-header">
                <p className="card-label">Yellow Customers</p>
                <div className="card-icon purple">
                  <span className="material-icons-outlined">account_circle</span>
                </div>
              </div>
              <div className="card-content">
                <p className="card-value">{financeHealthData.yellowCustomers}</p>
              </div>
            </div>
          </div>

          {/* Right Column - Chart Cards */}
          <div className="finance-health-right">
            <div className="portfolio-card chart-card eligibility-chart">
              <div className="card-content">
                <p className="card-label">Customers Eligibility</p>
                <div className="donut-chart-container">
                  <div className="donut-chart">
                    <ResponsiveContainer width={200} height={200}>
                      <PieChart>
                        <Pie
                          data={eligibilityChartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={65}
                          outerRadius={95}
                          startAngle={90}
                          endAngle={-270}
                          dataKey="value"
                          stroke="none"
                        >
                          {eligibilityChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="donut-center">
                      <span className="donut-label">Eligibility</span>
                      <span className="donut-label">Overview</span>
                    </div>
                  </div>
                  <div className="chart-legend">
                    <div className="legend-item">
                      <span className="legend-dot green"></span>
                      <span>Green</span>
                    </div>
                    <div className="legend-item">
                      <span className="legend-dot yellow"></span>
                      <span>Yellow</span>
                    </div>
                    <div className="legend-item">
                      <span className="legend-dot amber"></span>
                      <span>Amber</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="portfolio-card chart-card credit-score-chart">
              <div className="card-content">
                <p className="card-label">Credit Score Health</p>
                <div className="gauge-chart-container">
                  <div className="gauge-chart">
                    <ResponsiveContainer width={200} height={150}>
                      <PieChart>
                        <Pie
                          data={[{ value: financeHealthData.creditScore.score }, { value: 100 - financeHealthData.creditScore.score }]}
                          cx="50%"
                          cy="100%"
                          innerRadius={80}
                          outerRadius={100}
                          startAngle={180}
                          endAngle={0}
                          dataKey="value"
                          stroke="none"
                        >
                          <Cell fill={financeHealthData.creditScore.score >= 70 ? '#5AB10E' : financeHealthData.creditScore.score >= 40 ? '#F8AC13' : '#F85F13'} />
                          <Cell fill="#F1F1F1" />
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="gauge-center">
                      <span className="gauge-value">{financeHealthData.creditScore.score}<span style={{ fontSize: '18px', opacity: 0.5 }}>/100</span></span>
                      <span className={`gauge-status status-${financeHealthData.creditScore.status.toLowerCase()}`}>
                        Overview : {financeHealthData.creditScore.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="portfolio-card chart-card tnx-success-chart">
              <div className="card-content">
                <p className="card-label">TNx Success Health</p>
                <div className="donut-chart-container">
                  <div className="donut-chart">
                    <ResponsiveContainer width={200} height={200}>
                      <PieChart>
                        <Pie
                          data={tnxChartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={65}
                          outerRadius={95}
                          startAngle={90}
                          endAngle={-270}
                          dataKey="value"
                          stroke="none"
                        >
                          {tnxChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="donut-center">
                      <span className="donut-percentage">{financeHealthData.tnxSuccess.percentage}%</span>
                    </div>
                  </div>
                  <div className="chart-legend">
                    <div className="legend-item">
                      <span className="legend-dot green"></span>
                      <span>Avg Success Rate</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Private Banking Customers Section */}
      <div className="customers-section">
        <div className="customers-header">
          <h2 className="section-title">Private Banking Customers (green)</h2>
          <button
            className="see-all-link-btn"
            onClick={() => navigate('/customers')}
          >
            See All
          </button>
        </div>
        <div className="customers-table">
          <table>
            <tbody>
              {customers.map((customer) => (
                <tr
                  key={customer.id}
                  onClick={() => handleCustomerClick(customer)}
                  style={{ cursor: 'pointer' }}
                >
                  <td>
                    <div className="customer-cell-content">
                      <div className="customer-avatar">
                        {customer.initials}
                      </div>
                      <span className="customer-name">{customer.name}</span>
                    </div>
                  </td>
                  <td>{customer.accountNumber}</td>
                  <td>{customer.branch}</td>
                  {/* Mobile Number column removed */}
                  <td>{customer.averageBalance} SDG</td>
                  <td>{customer.lastBalance} SDG</td>
                  <td>
                    <button className="score-button score-green">
                      {customer.finalScore || 0}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Details Slider */}
      <CustomerDetailsSlider
        isOpen={isSliderOpen}
        onClose={handleCloseSlider}
        customer={selectedCustomer}
      />
    </main>
  )
}

export default DashboardContent

import { useEffect, useState, useCallback, useMemo } from 'react'
import DashboardSidebar from '../components/dashboard/DashboardSidebar'
import DashboardHeader from '../components/dashboard/DashboardHeader'
import CustomerDetailsSlider from '../components/dashboard/CustomerDetailsSlider'
import { fetchCustomers, fetchCustomerById } from '../../infrastructure/services/customerService'
import './CustomersPage.css'

/**
 * Customers Page Component
 * Displays a list of customers with filtering, search, and detailed view
 */
const CustomersPage = () => {
  // Navigation & UI state
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024)
  const [activeFilter, setActiveFilter] = useState('all')
  const [isSliderOpen, setIsSliderOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState(null)

  // Data state
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [sortField, setSortField] = useState('Final Score')
  const [sortOrder, setSortOrder] = useState('desc')
  const [localSortField, setLocalSortField] = useState(null)
  const [localSortOrder, setLocalSortOrder] = useState('desc')
  const pageSize = 100
  const totalPages = Math.ceil(totalCount / pageSize)

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm)
      setCurrentPage(1) // Reset to first page on search
    }, 500)
    return () => clearTimeout(timer)
  }, [searchTerm])

  // Fetch customers from Supabase
  const loadCustomers = useCallback(async () => {
    setLoading(true)
    try {
      const { data, totalCount } = await fetchCustomers({
        page: currentPage,
        pageSize,
        status: activeFilter,
        searchTerm: debouncedSearch,
        sortField: 'Final Score',
        sortOrder: 'desc'
      })
      setCustomers(data)
      setTotalCount(totalCount)
    } catch (error) {
      console.error('Failed to load customers:', error)
    } finally {
      setLoading(false)
    }
  }, [currentPage, activeFilter, debouncedSearch])

  useEffect(() => {
    loadCustomers()
  }, [loadCustomers])

  // Memoized sorted customers for local sorting
  const sortedCustomers = useMemo(() => {
    if (!localSortField) return customers

    return [...customers].sort((a, b) => {
      let valA, valB

      if (localSortField === 'Avarage Balance') {
        valA = a.averageBalance || 0
        valB = b.averageBalance || 0
      } else if (localSortField === 'Last Balance') {
        valA = a.lastBalance || 0
        valB = b.lastBalance || 0
      } else if (localSortField === 'Final Score') {
        valA = a.score || 0
        valB = b.score || 0
      } else {
        return 0
      }

      if (localSortOrder === 'asc') {
        return valA - valB
      } else {
        return valB - valA
      }
    })
  }, [customers, localSortField, localSortOrder])

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1024) {
        setIsSidebarOpen(true)
      } else {
        setIsSidebarOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const handleFilterChange = (filter) => {
    setActiveFilter(filter)
    setCurrentPage(1)
  }

  const handleSort = (field) => {
    if (localSortField === field) {
      setLocalSortOrder(localSortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setLocalSortField(field)
      setLocalSortOrder('desc')
    }
  }

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const handleCustomerClick = async (customer) => {
    try {
      setLoading(true)
      const fullDetails = await fetchCustomerById(customer.id)
      setSelectedCustomer(fullDetails)
      setIsSliderOpen(true)
    } catch (error) {
      console.error('Error opening customer details:', error)
      // Fallback to minimal data if full fetch fails
      setSelectedCustomer(customer)
      setIsSliderOpen(true)
    } finally {
      setLoading(false)
    }
  }

  const handleCloseSlider = () => {
    setIsSliderOpen(false)
    // Delay clearing the customer to allow animation to complete
    setTimeout(() => setSelectedCustomer(null), 400)
  }

  const renderSortIcon = (field) => {
    const activeField = localSortField || (field === 'Final Score' ? 'Final Score' : null)
    const activeOrder = localSortField ? localSortOrder : 'desc'

    if (activeField !== field) {
      return <span className="material-icons-outlined sort-icon subtle">unfold_more</span>
    }
    return activeOrder === 'asc'
      ? <span className="material-icons-outlined sort-icon active">expand_less</span>
      : <span className="material-icons-outlined sort-icon active">expand_more</span>
  }

  const getPageNumbers = () => {
    const pages = []
    const maxVisiblePages = 5

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Show pages based on current page position
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages)
      }
    }
    return pages
  }

  return (
    <div className="customers-page">
      <DashboardHeader onMenuClick={toggleSidebar} />
      <div className="dashboard-layout">
        {/* Backdrop for mobile */}
        {isSidebarOpen && window.innerWidth <= 1024 && (
          <div
            className="sidebar-backdrop visible"
            onClick={toggleSidebar}
          />
        )}
        <DashboardSidebar isOpen={isSidebarOpen} onToggle={toggleSidebar} />
        <main className={`dashboard-main ${isSidebarOpen ? 'sidebar-open' : ''}`}>
          <div className="customers-content">
            <div className="customers-page-header">
              <h1 className="page-title">Customers</h1>
              <div className="page-actions">
                <div className="search-box">
                  <span className="material-icons-outlined search-icon">search</span>
                  <input
                    type="text"
                    className="search-input"
                    placeholder="Search by name or National ID"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <button className="action-button filter-button">
                  <span className="material-icons-outlined">filter_alt</span>
                  <span>Filter</span>
                </button>
                <button className="action-button export-button">
                  <span className="material-icons-outlined">file_download</span>
                  <span>Export</span>
                </button>
              </div>
            </div>

            {/* Filter Pills */}
            <div className="filter-pills">
              <button
                className={`filter-pill ${activeFilter === 'all' ? 'active' : ''}`}
                onClick={() => handleFilterChange('all')}
              >
                All Customers
              </button>
              <button
                className={`filter-pill amber ${activeFilter === 'amber' ? 'active' : ''}`}
                onClick={() => handleFilterChange('amber')}
              >
                Amber
              </button>
              <button
                className={`filter-pill yellow ${activeFilter === 'yellow' ? 'active' : ''}`}
                onClick={() => handleFilterChange('yellow')}
              >
                Yellow
              </button>
              <button
                className={`filter-pill green ${activeFilter === 'green' ? 'active' : ''}`}
                onClick={() => handleFilterChange('green')}
              >
                Green
              </button>
            </div>

            {/* Customers Table */}
            <div className="customers-table-container">
              {loading && customers.length === 0 ? (
                <div className="loading-state">
                  <div className="spinner"></div>
                  <p>Loading customers...</p>
                </div>
              ) : customers.length === 0 ? (
                <div className="empty-state">
                  <p>No customers found matching your criteria.</p>
                </div>
              ) : (
                <table className="customers-table-main">
                  <thead>
                    <tr className="table-header-row">
                      <th>Customer Name</th>
                      <th>Account Number</th>
                      <th>Branch</th>
                      <th onClick={() => handleSort('Avarage Balance')} className="sortable-header">
                        <div className="header-content">
                          Average Balance {renderSortIcon('Avarage Balance')}
                        </div>
                      </th>
                      <th onClick={() => handleSort('Last Balance')} className="sortable-header">
                        <div className="header-content">
                          Last Balance {renderSortIcon('Last Balance')}
                        </div>
                      </th>
                      <th onClick={() => handleSort('Final Score')} className="sortable-header">
                        <div className="header-content">
                          Score {renderSortIcon('Final Score')}
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedCustomers.map((customer) => (
                      <tr
                        key={customer.id}
                        onClick={() => handleCustomerClick(customer)}
                        style={{ cursor: 'pointer' }}
                      >
                        <td>
                          <div className="customer-info">
                            <div className="customer-avatar">{customer.initials}</div>
                            <span className="customer-name">{customer.name}</span>
                          </div>
                        </td>
                        <td className="customer-field">{customer.accountNumber}</td>
                        <td className="customer-field">{customer.branch}</td>
                        <td className="customer-field">{(customer.averageBalance || 0).toLocaleString()}</td>
                        <td className="customer-field">{(customer.lastBalance || 0).toLocaleString()}</td>
                        <td className="customer-action">
                          <button className={`score-btn score-${customer.status}`}>
                            {customer.score || 0}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <span className="pagination-label">
                  Showing {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, totalCount)} of {totalCount} customers
                </span>
                <button
                  className="pagination-button"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  aria-label="Previous page"
                >
                  <span className="material-icons-outlined">chevron_left</span>
                </button>
                {getPageNumbers().map((page, index) =>
                  page === '...' ? (
                    <span key={`ellipsis-${index}`} className="pagination-ellipsis">
                      ...
                    </span>
                  ) : (
                    <button
                      key={page}
                      className={`pagination-number ${currentPage === page ? 'active' : ''}`}
                      onClick={() => handlePageChange(page)}
                      aria-label={`Go to page ${page}`}
                    >
                      {page}
                    </button>
                  )
                )}
                <button
                  className="pagination-button"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  aria-label="Next page"
                >
                  <span className="material-icons-outlined">chevron_right</span>
                </button>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Customer Details Slider */}
      <CustomerDetailsSlider
        isOpen={isSliderOpen}
        onClose={handleCloseSlider}
        customer={selectedCustomer}
      />
    </div>
  )
}

export default CustomersPage

import { useState, useEffect } from 'react'
import DashboardSidebar from '../components/dashboard/DashboardSidebar'
import DashboardHeader from '../components/dashboard/DashboardHeader'
import './SettingsPage.css'

/**
 * Settings Page Component
 * Displays application settings interface
 */
const SettingsPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024)

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

  return (
    <div className="settings-page">
      <DashboardHeader onMenuClick={toggleSidebar} />
      <div className="dashboard-layout">
        {isSidebarOpen && window.innerWidth <= 1024 && (
          <div className="sidebar-backdrop visible" onClick={toggleSidebar} />
        )}
        <DashboardSidebar isOpen={isSidebarOpen} onToggle={toggleSidebar} />
        <div className={`dashboard-main ${isSidebarOpen ? 'sidebar-open' : ''}`}>
          <main className="settings-content">
            {/* Header Section */}
            <div className="settings-page-header">
              <h1 className="page-title">Settings</h1>
              <div className="page-actions">
                <div className="search-box">
                  <span className="material-icons-outlined search-icon">search</span>
                  <input
                    type="text"
                    className="search-input"
                    placeholder="Search"
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
          </main>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage

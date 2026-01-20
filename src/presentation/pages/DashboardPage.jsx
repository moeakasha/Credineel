import { useEffect, useState } from 'react'
import DashboardSidebar from '../components/dashboard/DashboardSidebar'
import DashboardHeader from '../components/dashboard/DashboardHeader'
import DashboardContent from '../components/dashboard/DashboardContent'
import './DashboardPage.css'

/**
 * Dashboard Page Container Component
 * Orchestrates the dashboard page layout and state
 */
const DashboardPage = () => {
  // Start with sidebar open on desktop, closed on mobile (threshold: 1024px)
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
    <div className="dashboard-page">
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
        <div className={`dashboard-main ${isSidebarOpen ? 'sidebar-open' : ''}`}>
          <DashboardContent />
        </div>
      </div>
    </div>
  )
}

export default DashboardPage

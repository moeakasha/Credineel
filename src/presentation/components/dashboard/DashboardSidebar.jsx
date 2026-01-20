import PropTypes from 'prop-types'
import { NavLink } from 'react-router-dom'
import './DashboardSidebar.css'

/**
 * Dashboard Sidebar Component
 * Navigation sidebar for the dashboard
 */
const DashboardSidebar = ({ isOpen, onToggle }) => {
  const menuItems = [
    {
      path: '/dashboard',
      label: 'Finance Portfolio',
      icon: 'pie_chart',
    },
    {
      path: '/customers',
      label: 'Customers',
      icon: 'group',
    },
    {
      path: '/eligibility-rules',
      label: 'Eligibly Rules',
      icon: 'manage_accounts',
    },
    {
      path: '/settings',
      label: 'Settings',
      icon: 'settings',
    },
  ]

  const handleLinkClick = () => {
    // Close sidebar on mobile when a link is clicked
    if (window.innerWidth <= 768 && onToggle) {
      onToggle()
    }
  }

  return (
    <aside className={`dashboard-sidebar ${isOpen ? 'open' : 'closed'}`}>
      <nav className="sidebar-nav">
        <ul className="nav-list">
          {menuItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                onClick={handleLinkClick}
              >
                <span className="material-icons-outlined nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}

DashboardSidebar.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onToggle: PropTypes.func,
}

DashboardSidebar.defaultProps = {
  onToggle: null,
}

export default DashboardSidebar

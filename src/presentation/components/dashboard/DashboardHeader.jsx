import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import PropTypes from 'prop-types'
import { useAuth } from '../../context/AuthContext'
import coverImage from '../../../assets/images/Navimg.png'
import logo from '../../../assets/images/logo.svg'
import './DashboardHeader.css'

/**
 * Dashboard Header Component
 * Top header with search and user info
 */
const DashboardHeader = ({ onMenuClick }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  // Display user info (from auth or default)
  const displayUser = {
    name: user?.name || 'Ahmed Alamin',
    role: 'Underwriter',
    initials: user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'AM',
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    setIsDropdownOpen(false)
    await logout()
    navigate('/login', { replace: true })
  }

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen)
  }

  return (
    <header className="dashboard-header" style={{ backgroundImage: `url(${coverImage})` }}>
      <div className="header-overlay"></div>
      <div className="header-content">
        <div className="header-left">
          <button className="menu-toggle" onClick={onMenuClick} aria-label="Toggle menu">
            <span className="material-icons">menu</span>
          </button>
          <div className="logo-container">
            <img src={logo} alt="Credyneel" className="logo-image" />
          </div>
          <div className="search-container">
            <input
              type="text"
              className="search-input"
              placeholder="Search"
            />
            <span className="material-icons search-icon">search</span>
          </div>
        </div>
        <div className="header-right">
          <div className="user-info" ref={dropdownRef}>
            <div className="user-details">
              <span className="user-name">{displayUser.name}</span>
              <span className="user-role">{displayUser.role}</span>
            </div>
            <button 
              className="user-avatar-btn"
              onClick={toggleDropdown}
              aria-label="User menu"
              aria-expanded={isDropdownOpen}
            >
              <div className="user-avatar">
                {displayUser.initials}
              </div>
            </button>
            
            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="user-dropdown">
                <div className="dropdown-header">
                  <span className="dropdown-name">{displayUser.name}</span>
                  <span className="dropdown-email">{user?.email || ''}</span>
                </div>
                <div className="dropdown-divider"></div>
                <button className="dropdown-item" onClick={handleLogout}>
                  <span className="material-icons-outlined">logout</span>
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

DashboardHeader.propTypes = {
  onMenuClick: PropTypes.func,
}

DashboardHeader.defaultProps = {
  onMenuClick: null,
}

export default DashboardHeader

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './presentation/context/AuthContext'
import ProtectedRoute from './presentation/components/auth/ProtectedRoute'
import DashboardPage from './presentation/pages/DashboardPage'
import CustomersPage from './presentation/pages/CustomersPage'
import EligibilityRulesPage from './presentation/pages/EligibilityRulesPage'
import SettingsPage from './presentation/pages/SettingsPage'
import LoginPage from './presentation/pages/LoginPage'
import './presentation/components/auth/ProtectedRoute.css'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customers"
            element={
              <ProtectedRoute>
                <CustomersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/eligibility-rules"
            element={
              <ProtectedRoute>
                <EligibilityRulesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App

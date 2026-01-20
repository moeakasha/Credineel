import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { isConfigured } from '../../infrastructure/supabase/supabaseClient.js'
import HeroSection from '../components/ui/HeroSection'
import LanguageSelector from '../components/ui/LanguageSelector'
import Logo from '../components/ui/Logo'
import LoginForm from '../components/ui/LoginForm'
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } from '../../shared/constants/languages.js'
import { LOGIN_PAGE_CONTENT } from '../../shared/constants/app.js'
import './LoginPage.css'

/**
 * Login Page Container Component
 * Orchestrates the login page presentation and business logic
 */
const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [language, setLanguage] = useState(DEFAULT_LANGUAGE)
  const [isLoading, setIsLoading] = useState(false)

  const { login, isAuthenticated, loading: authLoading, error, clearError } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Ensure the post-login destination is always the dashboard
  const from = '/dashboard'

  // Redirect if already authenticated (but wait for loading to complete)
  useEffect(() => {
    // Only redirect if we're sure the user is authenticated and auth has finished loading
    if (!authLoading && isAuthenticated) {
      navigate(from, { replace: true })
    }
  }, [isAuthenticated, authLoading, navigate, from])

  // Clear error when inputs change
  useEffect(() => {
    if (error) {
      clearError()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email, password])

  const handleLogin = async (emailValue, passwordValue) => {
    setIsLoading(true)
    const result = await login(emailValue, passwordValue)
    setIsLoading(false)

    if (result.success) {
      // Navigate to the originally requested page or dashboard
      navigate(from, { replace: true })
    }
  }

  // Show loading state while auth is initializing (AFTER all hooks)
  if (authLoading) {
    return (
      <div className="login-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="loading-spinner" style={{ margin: '0 auto 1rem' }}></div>
          <p style={{ color: '#ffffff', fontFamily: 'Poppins, sans-serif' }}>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="login-container">
      <HeroSection
        heading={LOGIN_PAGE_CONTENT.heading}
        subheading={LOGIN_PAGE_CONTENT.subheading}
      />

      <div className="login-right">
        <div className="login-form-container">
          <LanguageSelector
            language={language}
            onLanguageChange={setLanguage}
            languages={SUPPORTED_LANGUAGES}
          />

          <Logo />

          <h2 className="form-heading">{LOGIN_PAGE_CONTENT.formTitle}</h2>
          <p className="form-subheading">{LOGIN_PAGE_CONTENT.formSubtitle}</p>

          {!isConfigured && (
            <div className="error-message" style={{
              backgroundColor: '#FEF3C7',
              border: '1px solid #F59E0B',
              color: '#92400E',
              padding: '1rem',
              borderRadius: '8px',
              marginBottom: '1rem',
              fontSize: '14px',
            }}>
              <strong>⚠️ Supabase Not Configured</strong>
              <p style={{ margin: '0.5rem 0 0 0' }}>
                Please add your Supabase credentials to the <code>.env</code> file.
                See <code>SUPABASE_SETUP.md</code> for instructions.
              </p>
            </div>
          )}

          {error && <div className="error-message">{error}</div>}

          <LoginForm
            email={email}
            password={password}
            onEmailChange={setEmail}
            onPasswordChange={setPassword}
            onSubmit={handleLogin}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  )
}

export default LoginPage

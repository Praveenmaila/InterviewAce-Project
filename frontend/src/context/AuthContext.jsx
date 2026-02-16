import { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      setLoading(false)
      return
    }

    try {
      const response = await authService.getProfile()
      setUser(response.data)
      setIsAuthenticated(true)
    } catch (error) {
      // Token invalid, clear it
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    const response = await authService.login({ email, password })
    const { access, refresh } = response.data
    
    localStorage.setItem('access_token', access)
    localStorage.setItem('refresh_token', refresh)
    
    // Fetch user profile
    const profileResponse = await authService.getProfile()
    setUser(profileResponse.data)
    setIsAuthenticated(true)
    
    return response.data
  }

  const register = async (data) => {
    const response = await authService.register(data)
    const { tokens, user: userData } = response.data
    
    localStorage.setItem('access_token', tokens.access)
    localStorage.setItem('refresh_token', tokens.refresh)
    
    setUser(userData)
    setIsAuthenticated(true)
    
    return response.data
  }

  const logout = async () => {
    const refreshToken = localStorage.getItem('refresh_token')
    
    try {
      await authService.logout(refreshToken)
    } catch (error) {
      // Ignore logout errors
    }
    
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    setUser(null)
    setIsAuthenticated(false)
  }

  const updateUser = (userData) => {
    setUser(prev => ({ ...prev, ...userData }))
  }

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateUser,
    checkAuth
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

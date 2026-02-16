import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

// Layouts
import MainLayout from './components/layout/MainLayout'
import AuthLayout from './components/layout/AuthLayout'

// Components
import FloatingChatbot from './components/FloatingChatbot'

// Pages
import Landing from './pages/Landing'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import Dashboard from './pages/Dashboard'
import InterviewSetup from './pages/interview/InterviewSetup'
import InterviewSession from './pages/interview/InterviewSession'
import InterviewResults from './pages/interview/InterviewResults'
import History from './pages/History'
import Analytics from './pages/Analytics'
import ResumeAnalyzer from './pages/ResumeAnalyzer'
import Profile from './pages/Profile'

// Protected Route component
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
      </div>
    )
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  return children
}

// Public Route (redirect to dashboard if authenticated)
function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
      </div>
    )
  }
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }
  
  return children
}

function App() {
  const { isAuthenticated } = useAuth()
  
  return (
    <>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Landing />} />
        
        <Route element={<AuthLayout />}>
          <Route path="/login" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />
          <Route path="/register" element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } />
        </Route>
        
        {/* Protected routes */}
        <Route element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/interview/setup" element={<InterviewSetup />} />
          <Route path="/interview/session/:sessionId" element={<InterviewSession />} />
          <Route path="/interview/results/:sessionId" element={<InterviewResults />} />
          <Route path="/history" element={<History />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/resume" element={<ResumeAnalyzer />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
        
        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      
      {/* Floating Chatbot - only show for authenticated users */}
      {isAuthenticated && <FloatingChatbot />}
    </>
  )
}

export default App

import axios from 'axios'

const API_URL = '/api'

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      
      const refreshToken = localStorage.getItem('refresh_token')
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_URL}/auth/refresh/`, {
            refresh: refreshToken
          })
          
          const { access } = response.data
          localStorage.setItem('access_token', access)
          
          originalRequest.headers.Authorization = `Bearer ${access}`
          return api(originalRequest)
        } catch (refreshError) {
          // Refresh failed, clear tokens and redirect to login
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          window.location.href = '/login'
          return Promise.reject(refreshError)
        }
      }
    }
    
    return Promise.reject(error)
  }
)

// Auth services
export const authService = {
  register: (data) => api.post('/auth/register/', data),
  login: (data) => api.post('/auth/login/', data),
  logout: (refreshToken) => api.post('/auth/logout/', { refresh: refreshToken }),
  getProfile: () => api.get('/auth/profile/'),
  updateProfile: (data) => api.patch('/auth/profile/', data),
  changePassword: (data) => api.put('/auth/change-password/', data),
  getDashboard: () => api.get('/auth/dashboard/'),
}

// Interview services
export const interviewService = {
  getTypes: () => api.get('/interviews/types/'),
  getDomains: (interviewTypeId) => 
    api.get('/interviews/domains/', { 
      params: interviewTypeId ? { interview_type: interviewTypeId } : {}
    }),
  startSession: (data) => api.post('/interviews/sessions/start/', data),
  getSession: (sessionId) => api.get(`/interviews/sessions/${sessionId}/`),
  getSessions: (status) => 
    api.get('/interviews/sessions/', { params: status ? { status } : {} }),
  getQuestion: (sessionId) => api.get(`/interviews/sessions/${sessionId}/question/`),
  submitAnswer: (sessionId, data) => 
    api.post(`/interviews/sessions/${sessionId}/answer/`, data),
  abandonSession: (sessionId) => 
    api.post(`/interviews/sessions/${sessionId}/abandon/`),
  getHistory: (params) => api.get('/interviews/history/', { params }),
}

// Feedback services
export const feedbackService = {
  getSessionFeedback: (sessionId) => api.get(`/feedback/sessions/${sessionId}/`),
  getTrends: (days) => api.get('/feedback/trends/', { params: { days } }),
  getAnalytics: () => api.get('/feedback/analytics/'),
  getQuestionAnalytics: () => api.get('/feedback/question-analytics/'),
  getWeakAreas: () => api.get('/feedback/weak-areas/'),
}

// Resume services
export const resumeService = {
  upload: (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/resume/upload/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  getResumes: () => api.get('/resume/'),
  getResume: (id) => api.get(`/resume/${id}/`),
  deleteResume: (id) => api.delete(`/resume/${id}/`),
  getAnalysis: (resumeId) => api.get(`/resume/analysis/${resumeId}/`),
  setPrimary: (id) => api.post(`/resume/${id}/set-primary/`),
  reanalyze: (id) => api.post(`/resume/${id}/reanalyze/`),
  getTemplates: () => api.get('/resume/templates/'),
}

// Chatbot services
export const chatbotService = {
  sendMessage: (message, history = []) => 
    api.post('/resume/chatbot/', { message, history }),
}

export default api

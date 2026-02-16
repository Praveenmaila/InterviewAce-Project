import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Register() {
  const navigate = useNavigate()
  const { register } = useAuth()
  
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    first_name: '',
    last_name: '',
    password: '',
    password_confirm: '',
    experience_level: 'student'
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const experienceLevels = [
    { value: 'student', label: 'Student' },
    { value: 'fresher', label: 'Fresh Graduate (0-1 years)' },
    { value: 'junior', label: 'Junior (1-3 years)' },
    { value: 'mid', label: 'Mid-level (3-5 years)' },
    { value: 'senior', label: 'Senior (5+ years)' }
  ]

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validate = () => {
    const newErrors = {}
    
    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email'
    }
    
    if (!formData.username) {
      newErrors.username = 'Username is required'
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters'
    }
    
    if (!formData.first_name) {
      newErrors.first_name = 'First name is required'
    }
    
    if (!formData.last_name) {
      newErrors.last_name = 'Last name is required'
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    }
    
    if (formData.password !== formData.password_confirm) {
      newErrors.password_confirm = 'Passwords do not match'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validate()) return
    
    setLoading(true)
    
    try {
      await register(formData)
      toast.success('Account created successfully!')
      navigate('/dashboard')
    } catch (error) {
      const data = error.response?.data
      if (data) {
        // Handle field-specific errors
        const fieldErrors = {}
        Object.keys(data).forEach(key => {
          if (Array.isArray(data[key])) {
            fieldErrors[key] = data[key][0]
          }
        })
        setErrors(fieldErrors)
        
        if (Object.keys(fieldErrors).length === 0) {
          toast.error(data.detail || 'Registration failed')
        }
      } else {
        toast.error('Registration failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="animate-in">
      <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
        Create your account
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">
              First name
            </label>
            <input
              id="first_name"
              name="first_name"
              type="text"
              value={formData.first_name}
              onChange={handleChange}
              className={`input ${errors.first_name ? 'input-error' : ''}`}
              placeholder="John"
            />
            {errors.first_name && (
              <p className="mt-1 text-sm text-red-500">{errors.first_name}</p>
            )}
          </div>
          <div>
            <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">
              Last name
            </label>
            <input
              id="last_name"
              name="last_name"
              type="text"
              value={formData.last_name}
              onChange={handleChange}
              className={`input ${errors.last_name ? 'input-error' : ''}`}
              placeholder="Doe"
            />
            {errors.last_name && (
              <p className="mt-1 text-sm text-red-500">{errors.last_name}</p>
            )}
          </div>
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className={`input pl-10 ${errors.email ? 'input-error' : ''}`}
              placeholder="you@example.com"
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-sm text-red-500">{errors.email}</p>
          )}
        </div>

        {/* Username */}
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
            Username
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              id="username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              className={`input pl-10 ${errors.username ? 'input-error' : ''}`}
              placeholder="johndoe"
            />
          </div>
          {errors.username && (
            <p className="mt-1 text-sm text-red-500">{errors.username}</p>
          )}
        </div>

        {/* Experience Level */}
        <div>
          <label htmlFor="experience_level" className="block text-sm font-medium text-gray-700 mb-1">
            Experience Level
          </label>
          <select
            id="experience_level"
            name="experience_level"
            value={formData.experience_level}
            onChange={handleChange}
            className="input"
          >
            {experienceLevels.map(level => (
              <option key={level.value} value={level.value}>
                {level.label}
              </option>
            ))}
          </select>
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              className={`input pl-10 pr-10 ${errors.password ? 'input-error' : ''}`}
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-red-500">{errors.password}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label htmlFor="password_confirm" className="block text-sm font-medium text-gray-700 mb-1">
            Confirm Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              id="password_confirm"
              name="password_confirm"
              type={showPassword ? 'text' : 'password'}
              value={formData.password_confirm}
              onChange={handleChange}
              className={`input pl-10 ${errors.password_confirm ? 'input-error' : ''}`}
              placeholder="••••••••"
            />
          </div>
          {errors.password_confirm && (
            <p className="mt-1 text-sm text-red-500">{errors.password_confirm}</p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full"
        >
          {loading ? (
            <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            'Create Account'
          )}
        </button>
      </form>

      {/* Login link */}
      <p className="mt-6 text-center text-sm text-gray-600">
        Already have an account?{' '}
        <Link to="/login" className="text-primary-600 hover:text-primary-500 font-medium">
          Sign in
        </Link>
      </p>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { interviewService } from '../../services/api'
import { 
  Users, 
  Code, 
  ArrowRight, 
  ArrowLeft,
  CheckCircle,
  Zap
} from 'lucide-react'
import { LoadingSpinner, Badge } from '../../components/ui'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const DOMAIN_ICONS = {
  react: '⚛️',
  django: '🐍',
  dsa: '🔢',
  java: '☕',
  python: '🐍',
  'system-design': '🏗️',
  'general-hr': '👥',
}

const DOMAIN_COLORS = {
  cyan: 'border-cyan-200 bg-cyan-50 hover:border-cyan-400',
  green: 'border-green-200 bg-green-50 hover:border-green-400',
  purple: 'border-purple-200 bg-purple-50 hover:border-purple-400',
  orange: 'border-orange-200 bg-orange-50 hover:border-orange-400',
  yellow: 'border-yellow-200 bg-yellow-50 hover:border-yellow-400',
  blue: 'border-blue-200 bg-blue-50 hover:border-blue-400',
  gray: 'border-gray-200 bg-gray-50 hover:border-gray-400',
}

export default function InterviewSetup() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  
  const [interviewTypes, setInterviewTypes] = useState([])
  const [domains, setDomains] = useState([])
  
  const [config, setConfig] = useState({
    interview_type_id: null,
    domain_id: null,
    total_questions: 10,
    time_limit_minutes: 30
  })

  useEffect(() => {
    fetchInterviewTypes()
  }, [])

  useEffect(() => {
    if (config.interview_type_id) {
      fetchDomains(config.interview_type_id)
    }
  }, [config.interview_type_id])

  const fetchInterviewTypes = async () => {
    try {
      const response = await interviewService.getTypes()
      // Handle both paginated and non-paginated responses
      const data = response.data.results || response.data
      setInterviewTypes(Array.isArray(data) ? data : [])
    } catch (error) {
      toast.error('Failed to load interview types')
    } finally {
      setLoading(false)
    }
  }

  const fetchDomains = async (typeId) => {
    try {
      const response = await interviewService.getDomains(typeId)
      // Handle both paginated and non-paginated responses
      const data = response.data.results || response.data
      setDomains(Array.isArray(data) ? data : [])
    } catch (error) {
      toast.error('Failed to load domains')
    }
  }

  const handleTypeSelect = (typeId) => {
    setConfig(prev => ({ 
      ...prev, 
      interview_type_id: typeId,
      domain_id: null 
    }))
    setStep(2)
  }

  const handleDomainSelect = (domainId) => {
    setConfig(prev => ({ ...prev, domain_id: domainId }))
    setStep(3)
  }

  const handleStartInterview = async () => {
    setSubmitting(true)
    
    try {
      const response = await interviewService.startSession(config)
      toast.success('Interview started!')
      navigate(`/interview/session/${response.data.session.id}`)
    } catch (error) {
      const message = error.response?.data?.error || 
                     error.response?.data?.message ||
                     'Failed to start interview'
      toast.error(message)
      
      // If there's an incomplete session, offer to continue
      if (error.response?.data?.session_id) {
        const sessionId = error.response.data.session_id
        if (window.confirm('You have an incomplete session. Would you like to continue it?')) {
          navigate(`/interview/session/${sessionId}`)
        }
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto animate-in">
      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-12">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center">
            <div className={clsx(
              'w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors',
              step >= s 
                ? 'bg-primary-600 text-white' 
                : 'bg-gray-200 text-gray-500'
            )}>
              {step > s ? <CheckCircle className="h-5 w-5" /> : s}
            </div>
            {s < 3 && (
              <div className={clsx(
                'w-20 h-1 mx-2 rounded',
                step > s ? 'bg-primary-600' : 'bg-gray-200'
              )} />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Interview Type */}
      {step === 1 && (
        <div>
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Choose Interview Type
            </h1>
            <p className="mt-2 text-gray-600">
              What kind of interview would you like to practice?
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {interviewTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => handleTypeSelect(type.id)}
                className={clsx(
                  'card-hover text-left p-8 border-2 transition-all',
                  config.interview_type_id === type.id
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200'
                )}
              >
                <div className="flex items-start gap-4">
                  <div className={clsx(
                    'p-4 rounded-xl',
                    type.slug === 'hr-interview'
                      ? 'bg-purple-100 text-purple-600'
                      : 'bg-blue-100 text-blue-600'
                  )}>
                    {type.slug === 'hr-interview' ? (
                      <Users className="h-8 w-8" />
                    ) : (
                      <Code className="h-8 w-8" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {type.name}
                    </h3>
                    <p className="mt-2 text-gray-600">
                      {type.description}
                    </p>
                    <p className="mt-3 text-sm text-gray-500">
                      {type.question_count} questions available
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Domain Selection */}
      {step === 2 && (
        <div>
          <button
            onClick={() => setStep(1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to interview types
          </button>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Select Domain
            </h1>
            <p className="mt-2 text-gray-600">
              Choose the domain you want to practice
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {domains.map((domain) => (
              <button
                key={domain.id}
                onClick={() => handleDomainSelect(domain.id)}
                className={clsx(
                  'card-hover text-left p-6 border-2 transition-all',
                  config.domain_id === domain.id
                    ? 'border-primary-500 ring-2 ring-primary-200'
                    : DOMAIN_COLORS[domain.color] || DOMAIN_COLORS.gray
                )}
              >
                <div className="text-3xl mb-3">
                  {DOMAIN_ICONS[domain.slug] || '📚'}
                </div>
                <h3 className="font-semibold text-gray-900">{domain.name}</h3>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                  {domain.description}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  {domain.question_count} questions
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Configuration */}
      {step === 3 && (
        <div>
          <button
            onClick={() => setStep(2)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to domains
          </button>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Configure Your Session
            </h1>
            <p className="mt-2 text-gray-600">
              Customize your interview experience
            </p>
          </div>

          <div className="card max-w-xl mx-auto">
            {/* Selected Options Summary */}
            <div className="mb-8 p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-500 mb-3">Your Selection</h4>
              <div className="flex flex-wrap gap-2">
                <Badge variant="primary">
                  {interviewTypes.find(t => t.id === config.interview_type_id)?.name}
                </Badge>
                <Badge variant="success">
                  {domains.find(d => d.id === config.domain_id)?.name}
                </Badge>
              </div>
            </div>

            {/* Number of Questions */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Number of Questions
              </label>
              <div className="flex gap-3">
                {[5, 10, 15, 20].map((num) => (
                  <button
                    key={num}
                    onClick={() => setConfig(prev => ({ ...prev, total_questions: num }))}
                    className={clsx(
                      'flex-1 py-3 rounded-lg font-medium transition-colors',
                      config.total_questions === num
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    )}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            {/* Time Limit */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Time Limit (minutes)
              </label>
              <div className="flex gap-3">
                {[15, 30, 45, 60].map((mins) => (
                  <button
                    key={mins}
                    onClick={() => setConfig(prev => ({ ...prev, time_limit_minutes: mins }))}
                    className={clsx(
                      'flex-1 py-3 rounded-lg font-medium transition-colors',
                      config.time_limit_minutes === mins
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    )}
                  >
                    {mins}m
                  </button>
                ))}
              </div>
            </div>

            {/* Start Button */}
            <button
              onClick={handleStartInterview}
              disabled={submitting}
              className="btn-primary w-full btn-lg"
            >
              {submitting ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  <Zap className="h-5 w-5 mr-2" />
                  Start Interview
                </>
              )}
            </button>

            <p className="text-center text-sm text-gray-500 mt-4">
              You'll receive instant AI feedback after each answer
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

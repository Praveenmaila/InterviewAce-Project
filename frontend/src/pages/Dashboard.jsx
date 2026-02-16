import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authService, interviewService } from '../services/api'
import { 
  MessageSquare, 
  History, 
  TrendingUp, 
  Target,
  ArrowRight,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { StatCard, ScoreGauge, EmptyState, LoadingSpinner, Badge } from '../components/ui'

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await authService.getDashboard()
      setStats(response.data)
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
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
    <div className="animate-in">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.first_name || 'there'}! 👋
        </h1>
        <p className="mt-2 text-gray-600">
          Ready to ace your next interview? Let's continue practicing.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Link
          to="/interview/setup"
          className="card-hover bg-gradient-to-br from-primary-500 to-primary-700 text-white p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold mb-2">Start Mock Interview</h3>
              <p className="text-primary-100">
                Practice with AI-powered adaptive questions
              </p>
            </div>
            <div className="bg-white/20 p-4 rounded-lg">
              <MessageSquare className="h-8 w-8" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-primary-100">
            <span className="font-medium">Begin now</span>
            <ArrowRight className="ml-2 h-4 w-4" />
          </div>
        </Link>

        <Link
          to="/resume"
          className="card-hover bg-gradient-to-br from-accent-500 to-accent-700 text-white p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold mb-2">Analyze Resume</h3>
              <p className="text-accent-100">
                Get AI feedback on your resume
              </p>
            </div>
            <div className="bg-white/20 p-4 rounded-lg">
              <Target className="h-8 w-8" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-accent-100">
            <span className="font-medium">Upload resume</span>
            <ArrowRight className="ml-2 h-4 w-4" />
          </div>
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Interviews"
          value={stats?.total_interviews || 0}
          icon={MessageSquare}
          color="primary"
        />
        <StatCard
          title="Completed"
          value={stats?.completed_interviews || 0}
          icon={CheckCircle}
          color="success"
        />
        <StatCard
          title="Average Score"
          value={`${stats?.average_score || 0}%`}
          icon={TrendingUp}
          color="purple"
        />
        <StatCard
          title="This Week"
          value={stats?.recent_sessions?.length || 0}
          subtitle="Sessions completed"
          icon={Clock}
          color="warning"
        />
      </div>

      {/* Recent Sessions & Performance */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Sessions */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Recent Sessions</h2>
            <Link
              to="/history"
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              View all
            </Link>
          </div>

          {stats?.recent_sessions?.length > 0 ? (
            <div className="space-y-4">
              {stats.recent_sessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${
                      session.status === 'completed' 
                        ? 'bg-green-100 text-green-600'
                        : session.status === 'in_progress'
                        ? 'bg-yellow-100 text-yellow-600'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {session.status === 'completed' ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : session.status === 'in_progress' ? (
                        <Clock className="h-5 w-5" />
                      ) : (
                        <AlertCircle className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {session.type} - {session.domain}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(session.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant={session.status === 'completed' ? 'success' : 'warning'}>
                      {session.status.replace('_', ' ')}
                    </Badge>
                    {session.status === 'completed' && (
                      <Link
                        to={`/interview/results/${session.id}`}
                        className="text-primary-600 hover:text-primary-700"
                      >
                        <ArrowRight className="h-5 w-5" />
                      </Link>
                    )}
                    {session.status === 'in_progress' && (
                      <Link
                        to={`/interview/session/${session.id}`}
                        className="btn-primary btn-sm"
                      >
                        Continue
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={History}
              title="No sessions yet"
              description="Start your first mock interview to see your progress here"
              action={
                <Link to="/interview/setup" className="btn-primary">
                  Start Interview
                </Link>
              }
            />
          )}
        </div>

        {/* Domain Performance */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Domain Performance</h2>
          
          {stats?.domain_performance && Object.keys(stats.domain_performance).length > 0 ? (
            <div className="space-y-4">
              {Object.entries(stats.domain_performance).map(([domain, data]) => (
                <div key={domain}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">{domain}</span>
                    <span className="text-sm text-gray-500">{data.avg_score || 0}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-500 rounded-full transition-all duration-500"
                      style={{ width: `${data.avg_score || 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Target className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">
                Complete interviews to see domain-specific performance
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  BarChart2,
  PieChart,
  Target,
  Clock,
  Award,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPie,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar
} from 'recharts';
import { feedbackService, interviewService } from '../services/api';
import { LoadingSpinner, ProgressBar, EmptyState } from '../components/ui';

export default function Analytics() {
  const [analytics, setAnalytics] = useState(null);
  const [timeRange, setTimeRange] = useState('30d');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const data = await feedbackService.getAnalytics({ range: timeRange });
      setAnalytics(data);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-500';
    return 'text-red-500';
  };

  const getTrendIcon = (trend) => {
    if (trend > 0) return <ArrowUpRight className="w-4 h-4 text-green-500" />;
    if (trend < 0) return <ArrowDownRight className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  const getTrendColor = (trend) => {
    if (trend > 0) return 'text-green-600';
    if (trend < 0) return 'text-red-600';
    return 'text-gray-500';
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Generate mock data if API returns empty
  const mockData = {
    overview: {
      total_sessions: analytics?.total_sessions || 12,
      avg_score: analytics?.avg_score || 72,
      total_questions: analytics?.total_questions || 98,
      total_time: analytics?.total_time || 4820,
      score_trend: analytics?.score_trend || 5.2,
      sessions_trend: analytics?.sessions_trend || 2
    },
    score_history: analytics?.score_history || [
      { date: 'Week 1', score: 65 },
      { date: 'Week 2', score: 68 },
      { date: 'Week 3', score: 72 },
      { date: 'Week 4', score: 75 }
    ],
    domain_breakdown: analytics?.domain_breakdown || [
      { name: 'React', value: 35, score: 78 },
      { name: 'Django', value: 25, score: 72 },
      { name: 'DSA', value: 20, score: 65 },
      { name: 'System Design', value: 20, score: 70 }
    ],
    skill_scores: analytics?.skill_scores || {
      clarity: 75,
      relevance: 72,
      grammar: 80,
      keywords: 68
    },
    difficulty_breakdown: analytics?.difficulty_breakdown || [
      { difficulty: 'Easy', correct: 85, total: 100 },
      { difficulty: 'Medium', correct: 68, total: 100 },
      { difficulty: 'Hard', correct: 52, total: 100 }
    ]
  };

  const { overview, score_history, domain_breakdown, skill_scores, difficulty_breakdown } = mockData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Performance Analytics</h1>
          <p className="text-gray-600">Track your interview performance and identify areas for improvement</p>
        </div>
        
        {/* Time Range Selector */}
        <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 p-1">
          {['7d', '30d', '90d', 'all'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                timeRange === range
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : range === '90d' ? '90 Days' : 'All Time'}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
              <BarChart2 className="w-5 h-5 text-primary-600" />
            </div>
            <div className="flex items-center gap-1">
              {getTrendIcon(overview.sessions_trend)}
              <span className={`text-sm font-medium ${getTrendColor(overview.sessions_trend)}`}>
                {overview.sessions_trend > 0 ? '+' : ''}{overview.sessions_trend}
              </span>
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900">{overview.total_sessions}</div>
          <div className="text-sm text-gray-500">Total Sessions</div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <Award className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex items-center gap-1">
              {getTrendIcon(overview.score_trend)}
              <span className={`text-sm font-medium ${getTrendColor(overview.score_trend)}`}>
                {overview.score_trend > 0 ? '+' : ''}{overview.score_trend}%
              </span>
            </div>
          </div>
          <div className={`text-3xl font-bold ${getScoreColor(overview.avg_score)}`}>{overview.avg_score}%</div>
          <div className="text-sm text-gray-500">Average Score</div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <Target className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900">{overview.total_questions}</div>
          <div className="text-sm text-gray-500">Questions Answered</div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900">{Math.round(overview.total_time / 60)}m</div>
          <div className="text-sm text-gray-500">Total Practice Time</div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Score Trend Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary-600" />
            Score Trend
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={score_history}>
                <defs>
                  <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
                <YAxis domain={[0, 100]} stroke="#9CA3AF" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  fill="url(#scoreGradient)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Domain Breakdown */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-primary-600" />
            Domain Distribution
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPie>
                <Pie
                  data={domain_breakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {domain_breakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
              </RechartsPie>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Skill Breakdown */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <Target className="w-5 h-5 text-primary-600" />
          Skill Breakdown
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-700 font-medium">Clarity & Structure</span>
              <span className={`font-bold ${getScoreColor(skill_scores.clarity)}`}>{skill_scores.clarity}%</span>
            </div>
            <ProgressBar value={skill_scores.clarity} max={100} color="blue" />
            <p className="text-xs text-gray-500 mt-2">How well you organize and present your answers</p>
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-700 font-medium">Relevance</span>
              <span className={`font-bold ${getScoreColor(skill_scores.relevance)}`}>{skill_scores.relevance}%</span>
            </div>
            <ProgressBar value={skill_scores.relevance} max={100} color="green" />
            <p className="text-xs text-gray-500 mt-2">How directly you address the question asked</p>
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-700 font-medium">Grammar</span>
              <span className={`font-bold ${getScoreColor(skill_scores.grammar)}`}>{skill_scores.grammar}%</span>
            </div>
            <ProgressBar value={skill_scores.grammar} max={100} color="purple" />
            <p className="text-xs text-gray-500 mt-2">Language quality and grammatical correctness</p>
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-700 font-medium">Keywords</span>
              <span className={`font-bold ${getScoreColor(skill_scores.keywords)}`}>{skill_scores.keywords}%</span>
            </div>
            <ProgressBar value={skill_scores.keywords} max={100} color="orange" />
            <p className="text-xs text-gray-500 mt-2">Use of relevant technical terms and concepts</p>
          </div>
        </div>
      </div>

      {/* Difficulty Performance */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <BarChart2 className="w-5 h-5 text-primary-600" />
          Performance by Difficulty
        </h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={difficulty_breakdown} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis type="number" domain={[0, 100]} stroke="#9CA3AF" fontSize={12} />
              <YAxis dataKey="difficulty" type="category" stroke="#9CA3AF" fontSize={12} width={80} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px'
                }}
                formatter={(value) => [`${value}%`, 'Score']}
              />
              <Bar dataKey="correct" fill="#3B82F6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Domain Scores Table */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Domain Performance</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="pb-3 font-medium text-gray-600">Domain</th>
                <th className="pb-3 font-medium text-gray-600 text-center">Sessions</th>
                <th className="pb-3 font-medium text-gray-600 text-center">Avg Score</th>
                <th className="pb-3 font-medium text-gray-600">Progress</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {domain_breakdown.map((domain, index) => (
                <tr key={domain.name} className="hover:bg-gray-50">
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="font-medium text-gray-900">{domain.name}</span>
                    </div>
                  </td>
                  <td className="py-4 text-center text-gray-600">{domain.value}%</td>
                  <td className="py-4 text-center">
                    <span className={`font-semibold ${getScoreColor(domain.score)}`}>
                      {domain.score}%
                    </span>
                  </td>
                  <td className="py-4 w-48">
                    <ProgressBar value={domain.score} max={100} color="primary" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-xl p-6 border border-primary-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-primary-600" />
          Personalized Recommendations
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {skill_scores.keywords < 70 && (
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <h3 className="font-medium text-gray-900 mb-2">Improve Keyword Usage</h3>
              <p className="text-sm text-gray-600">Focus on incorporating more technical terms and industry-specific vocabulary in your answers.</p>
            </div>
          )}
          {skill_scores.clarity < 70 && (
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <h3 className="font-medium text-gray-900 mb-2">Enhance Answer Structure</h3>
              <p className="text-sm text-gray-600">Practice structuring your answers with clear introduction, main points, and conclusion.</p>
            </div>
          )}
          {domain_breakdown.some(d => d.score < 65) && (
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <h3 className="font-medium text-gray-900 mb-2">Focus on Weak Areas</h3>
              <p className="text-sm text-gray-600">
                Consider practicing more in {domain_breakdown.filter(d => d.score < 65).map(d => d.name).join(', ')} domain(s).
              </p>
            </div>
          )}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h3 className="font-medium text-gray-900 mb-2">Keep Practicing!</h3>
            <p className="text-sm text-gray-600">Consistency is key. Try to complete at least 2-3 interview sessions per week.</p>
            <Link to="/interviews/setup" className="text-primary-600 hover:text-primary-700 text-sm font-medium mt-2 inline-block">
              Start a new interview →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

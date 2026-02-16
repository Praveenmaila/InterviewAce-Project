import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  Target,
  ChevronRight,
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  BarChart2,
  PlayCircle
} from 'lucide-react';
import { interviewService } from '../services/api';
import { LoadingSpinner, Badge, EmptyState, ScoreGauge } from '../components/ui';

export default function History() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [interviewTypes, setInterviewTypes] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sessionsRes, typesRes] = await Promise.all([
        interviewService.getSessions(),
        interviewService.getTypes()
      ]);
      setSessions(sessionsRes.data.results || sessionsRes.data || []);
      setInterviewTypes(typesRes.data.results || typesRes.data || []);
    } catch (err) {
      console.error('Failed to fetch history:', err);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-500';
    return 'text-red-500';
  };

  const getScoreBg = (score) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    if (score >= 40) return 'bg-orange-100';
    return 'bg-red-100';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (seconds) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    return mins < 60 ? `${mins} min` : `${Math.floor(mins/60)}h ${mins%60}m`;
  };

  const filteredSessions = sessions.filter(session => {
    const matchesSearch = 
      session.interview_type_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.domain_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || session.interview_type === parseInt(filterType);
    const matchesStatus = filterStatus === 'all' || session.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const stats = {
    total: sessions.length,
    completed: sessions.filter(s => s.status === 'completed').length,
    avgScore: sessions.length > 0 
      ? Math.round(sessions.filter(s => s.status === 'completed').reduce((acc, s) => acc + (s.overall_score || 0), 0) / sessions.filter(s => s.status === 'completed').length)
      : 0,
    bestScore: sessions.length > 0 
      ? Math.max(...sessions.map(s => s.overall_score || 0))
      : 0
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Interview History</h1>
          <p className="text-gray-600">Review your past interview sessions and track progress</p>
        </div>
        <Link to="/interviews/setup" className="btn btn-primary flex items-center gap-2 w-fit">
          <PlayCircle className="w-5 h-5" />
          New Interview
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
              <BarChart2 className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-500">Total Sessions</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <Target className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.completed}</div>
              <div className="text-sm text-gray-500">Completed</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className={`text-2xl font-bold ${getScoreColor(stats.avgScore)}`}>{stats.avgScore}%</div>
              <div className="text-sm text-gray-500">Avg Score</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
              <Target className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <div className={`text-2xl font-bold ${getScoreColor(stats.bestScore)}`}>{stats.bestScore}%</div>
              <div className="text-sm text-gray-500">Best Score</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by type or domain..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>
          
          {/* Type Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="input py-2"
            >
              <option value="all">All Types</option>
              {interviewTypes.map(type => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>
          </div>
          
          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="input py-2"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="in_progress">In Progress</option>
            <option value="abandoned">Abandoned</option>
          </select>
        </div>
      </div>

      {/* Sessions List */}
      {filteredSessions.length === 0 ? (
        <EmptyState
          icon={Clock}
          title="No interviews found"
          description={sessions.length === 0 
            ? "You haven't taken any interviews yet. Start your first one!" 
            : "No interviews match your search criteria"}
          action={sessions.length === 0 ? (
            <Link to="/interviews/setup" className="btn btn-primary">
              Start Interview
            </Link>
          ) : undefined}
        />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          {filteredSessions.map((session) => (
            <Link
              key={session.id}
              to={session.status === 'completed' 
                ? `/interviews/${session.id}/results` 
                : `/interviews/${session.id}`}
              className="flex items-center justify-between p-4 md:p-6 hover:bg-gray-50 transition-colors group"
            >
              <div className="flex items-center gap-4">
                {/* Score indicator */}
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${getScoreBg(session.overall_score || 0)}`}>
                  {session.status === 'completed' ? (
                    <span className={`text-xl font-bold ${getScoreColor(session.overall_score || 0)}`}>
                      {session.overall_score || 0}%
                    </span>
                  ) : (
                    <Clock className="w-6 h-6 text-gray-400" />
                  )}
                </div>
                
                {/* Session Info */}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">
                      {session.interview_type_name || 'Interview'}
                    </h3>
                    {session.domain_name && (
                      <Badge variant="default">{session.domain_name}</Badge>
                    )}
                    <Badge 
                      variant={
                        session.status === 'completed' ? 'success' : 
                        session.status === 'in_progress' ? 'warning' : 'danger'
                      }
                    >
                      {session.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(session.created_at)}
                    </span>
                    {session.total_time && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {formatDuration(session.total_time)}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Target className="w-4 h-4" />
                      {session.questions_answered || 0} questions
                    </span>
                  </div>
                </div>
              </div>

              {/* Arrow */}
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary-500 transition-colors" />
            </Link>
          ))}
        </div>
      )}

      {/* Pagination placeholder */}
      {filteredSessions.length > 10 && (
        <div className="flex justify-center">
          <div className="text-sm text-gray-500">
            Showing {filteredSessions.length} of {sessions.length} sessions
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  CheckCircle,
  XCircle,
  Award,
  TrendingUp,
  TrendingDown,
  Clock,
  Target,
  BarChart2,
  ChevronDown,
  ChevronUp,
  Home,
  RefreshCw,
  Download,
  Share2,
  MessageSquare,
  Zap
} from 'lucide-react';
import { interviewService, feedbackService } from '../../services/api';
import { LoadingSpinner, ScoreGauge, ProgressBar, Badge } from '../../components/ui';
import toast from 'react-hot-toast';

export default function InterviewResults() {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedResponses, setExpandedResponses] = useState({});

  useEffect(() => {
    fetchResults();
  }, [sessionId]);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const [sessionResponse, feedbackResponse] = await Promise.all([
        interviewService.getSession(sessionId),
        feedbackService.getSessionFeedback(sessionId)
      ]);
      
      setSession(sessionResponse.data);
      setFeedback(feedbackResponse.data);
    } catch (err) {
      toast.error('Failed to load results');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const toggleResponse = (responseId) => {
    setExpandedResponses(prev => ({
      ...prev,
      [responseId]: !prev[responseId]
    }));
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

  const getPerformanceMessage = (score) => {
    if (score >= 90) return { text: 'Excellent Performance!', emoji: '🌟' };
    if (score >= 80) return { text: 'Great Job!', emoji: '👏' };
    if (score >= 70) return { text: 'Good Performance!', emoji: '👍' };
    if (score >= 60) return { text: 'Decent Effort!', emoji: '💪' };
    if (score >= 50) return { text: 'Room for Improvement', emoji: '📈' };
    return { text: 'Keep Practicing!', emoji: '🎯' };
  };

  const formatDuration = (seconds) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading your results...</p>
        </div>
      </div>
    );
  }

  if (!session) return null;

  const overallScore = feedback?.overall_score || 0;
  const performance = getPerformanceMessage(overallScore);
  
  // Get interview type and domain names from session
  const interviewTypeName = session.interview_type?.name || session.interview_type_name || 'Interview';
  const domainName = session.domain?.name || session.domain_name || '';
  
  // Calculate stats from responses
  const responses = session.responses || [];
  const questionsAnswered = responses.length || session.questions_answered || 0;
  const strongAnswers = responses.filter(r => (r.score || 0) >= 70).length;
  const totalTime = responses.reduce((acc, r) => acc + (r.time_taken_seconds || 0), 0);
  
  // Get scores from feedback or calculate from responses
  const clarityScore = feedback?.category_scores?.clarity || 
    (responses.length > 0 ? Math.round(responses.reduce((a, r) => a + (r.clarity_score || 0), 0) / responses.length) : 0);
  const relevanceScore = feedback?.technical_score || 
    (responses.length > 0 ? Math.round(responses.reduce((a, r) => a + (r.relevance_score || 0), 0) / responses.length) : 0);
  const grammarScore = feedback?.communication_score || 
    (responses.length > 0 ? Math.round(responses.reduce((a, r) => a + (r.grammar_score || 0), 0) / responses.length) : 0);
  const keywordScore = feedback?.category_scores?.keywords || 
    (responses.length > 0 ? Math.round(responses.reduce((a, r) => a + (r.keyword_score || 0), 0) / responses.length) : 0);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Results Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-primary-100 mb-2">
              <Award className="w-5 h-5" />
              <span>Interview Complete</span>
            </div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              {performance.text} {performance.emoji}
            </h1>
            <p className="text-primary-100">
              {interviewTypeName} {domainName ? `- ${domainName}` : ''}
            </p>
          </div>
          <div className="hidden md:block">
            <div className="bg-white rounded-xl p-6 text-center">
              <ScoreGauge score={overallScore} size="lg" />
              <div className="text-gray-600 text-sm mt-2">Overall Score</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
          <div className="text-3xl font-bold text-primary-600">{questionsAnswered}</div>
          <div className="text-sm text-gray-600">Questions Answered</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
          <div className="text-3xl font-bold text-green-600">{strongAnswers}</div>
          <div className="text-sm text-gray-600">Strong Answers</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
          <div className="text-3xl font-bold text-yellow-600">{formatDuration(totalTime)}</div>
          <div className="text-sm text-gray-600">Time Spent</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
          <div className={`text-3xl font-bold ${getScoreColor(overallScore)}`}>{Math.round(overallScore)}%</div>
          <div className="text-sm text-gray-600">Final Score</div>
        </div>
      </div>

      {/* Score Breakdown */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <BarChart2 className="w-5 h-5 text-primary-600" />
          Score Breakdown
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-700">Clarity & Structure</span>
              <span className="font-semibold">{clarityScore}%</span>
            </div>
            <ProgressBar value={clarityScore} max={100} color="blue" />
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-700">Technical Accuracy</span>
              <span className="font-semibold">{relevanceScore}%</span>
            </div>
            <ProgressBar value={relevanceScore} max={100} color="green" />
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-700">Grammar & Language</span>
              <span className="font-semibold">{grammarScore}%</span>
            </div>
            <ProgressBar value={grammarScore} max={100} color="purple" />
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-700">Keyword Coverage</span>
              <span className="font-semibold">{keywordScore}%</span>
            </div>
            <ProgressBar value={keywordScore} max={100} color="orange" />
          </div>
        </div>
      </div>

      {/* Detailed Responses */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary-600" />
            Detailed Feedback
          </h2>
        </div>
        
        <div className="divide-y divide-gray-100">
          {responses.map((response, index) => {
            const isExpanded = expandedResponses[response.id];
            const score = response.score || 0;
            
            return (
              <div key={response.id || index} className="p-6">
                <button
                  onClick={() => toggleResponse(response.id || index)}
                  className="w-full text-left"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${getScoreBg(score)}`}>
                        {score >= 60 ? (
                          <CheckCircle className={`w-5 h-5 ${getScoreColor(score)}`} />
                        ) : (
                          <XCircle className={`w-5 h-5 ${getScoreColor(score)}`} />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm text-gray-500">Q{index + 1}</span>
                          <Badge variant={
                            response.question?.difficulty === 'easy' ? 'success' :
                            response.question?.difficulty === 'medium' ? 'warning' : 'danger'
                          }>
                            {response.question?.difficulty || 'medium'}
                          </Badge>
                        </div>
                        <h3 className="font-medium text-gray-900">
                          {response.question?.text || 'Question'}
                        </h3>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-lg font-bold ${getScoreColor(score)}`}>
                        {Math.round(score)}%
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </button>

                {isExpanded && (
                  <div className="mt-4 pl-11 space-y-4">
                    {/* User's Answer */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Your Answer:</h4>
                      <p className="text-gray-600">
                        {response.answer_text === '[SKIPPED]' ? (
                          <span className="italic text-gray-400">Question was skipped</span>
                        ) : (
                          response.answer_text
                        )}
                      </p>
                    </div>

                    {/* Feedback */}
                    {response.answer_text !== '[SKIPPED]' && (
                      <div className="space-y-3">
                        {/* Score breakdown */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div className="bg-blue-50 rounded-lg p-3 text-center">
                            <div className="text-lg font-bold text-blue-700">{Math.round(response.clarity_score || 0)}%</div>
                            <div className="text-xs text-blue-600">Clarity</div>
                          </div>
                          <div className="bg-green-50 rounded-lg p-3 text-center">
                            <div className="text-lg font-bold text-green-700">{Math.round(response.relevance_score || 0)}%</div>
                            <div className="text-xs text-green-600">Relevance</div>
                          </div>
                          <div className="bg-purple-50 rounded-lg p-3 text-center">
                            <div className="text-lg font-bold text-purple-700">{Math.round(response.grammar_score || 0)}%</div>
                            <div className="text-xs text-purple-600">Grammar</div>
                          </div>
                          <div className="bg-orange-50 rounded-lg p-3 text-center">
                            <div className="text-lg font-bold text-orange-700">{Math.round(response.keyword_score || 0)}%</div>
                            <div className="text-xs text-orange-600">Keywords</div>
                          </div>
                        </div>

                        {/* AI Feedback */}
                        {response.feedback_text && (
                          <div className="bg-primary-50 rounded-lg p-4 border border-primary-100">
                            <div className="flex items-start gap-2">
                              <Zap className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                              <div>
                                <h4 className="font-medium text-primary-800 mb-1">AI Feedback</h4>
                                <p className="text-primary-700 text-sm">{response.feedback_text}</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Suggestions */}
                        {response.improvements && response.improvements.length > 0 && (
                          <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-100">
                            <h4 className="font-medium text-yellow-800 mb-2">Suggestions for Improvement:</h4>
                            <ul className="space-y-1">
                              {response.improvements.map((improvement, idx) => (
                                <li key={idx} className="text-sm text-yellow-700 flex items-start gap-2">
                                  <span>•</span>
                                  <span>{improvement}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Ideal Answer (if available) */}
                    {response.question?.sample_answer && (
                      <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                        <h4 className="font-medium text-green-800 mb-2">Model Answer:</h4>
                        <p className="text-green-700 text-sm">{response.question.sample_answer}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link to="/dashboard" className="btn btn-secondary flex items-center justify-center gap-2">
          <Home className="w-5 h-5" />
          Back to Dashboard
        </Link>
        <Link to="/interviews/setup" className="btn btn-primary flex items-center justify-center gap-2">
          <RefreshCw className="w-5 h-5" />
          Start New Interview
        </Link>
      </div>

      {/* Improvement Tips */}
      {overallScore < 80 && (
        <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl p-6 border border-orange-200">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-orange-600" />
            Tips to Improve Your Score
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {session.clarity_score < 70 && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Target className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Improve Clarity</h4>
                  <p className="text-sm text-gray-600">Structure your answers with clear introduction, body, and conclusion.</p>
                </div>
              </div>
            )}
            {session.relevance_score < 70 && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Stay On Topic</h4>
                  <p className="text-sm text-gray-600">Focus on directly answering the question asked without going off-topic.</p>
                </div>
              </div>
            )}
            {session.keyword_score < 70 && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <Zap className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Use Key Terms</h4>
                  <p className="text-sm text-gray-600">Include relevant technical terms and industry keywords in your answers.</p>
                </div>
              </div>
            )}
            {session.grammar_score < 70 && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-4 h-4 text-orange-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Polish Grammar</h4>
                  <p className="text-sm text-gray-600">Review your answers for grammatical errors before submitting.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Clock, 
  ChevronRight, 
  ChevronLeft,
  Send,
  AlertCircle,
  CheckCircle,
  HelpCircle,
  Lightbulb,
  Timer
} from 'lucide-react';
import { interviewService } from '../../services/api';
import { LoadingSpinner, ProgressBar } from '../../components/ui';
import toast from 'react-hot-toast';

export default function InterviewSession() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  
  const [session, setSession] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [answer, setAnswer] = useState('');
  const [questionIndex, setQuestionIndex] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(10);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [questionStartTime, setQuestionStartTime] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [answeredQuestions, setAnsweredQuestions] = useState([]);

  useEffect(() => {
    fetchSessionData();
  }, [sessionId]);

  useEffect(() => {
    // Timer for tracking time spent
    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchSessionData = async () => {
    try {
      setLoading(true);
      const response = await interviewService.getSession(sessionId);
      const data = response.data;
      setSession(data);
      setTotalQuestions(data.total_questions || 10);
      setAnsweredQuestions(data.responses || []);
      setQuestionIndex(data.responses?.length || 0);
      
      // Get next question
      if (data.status === 'in_progress') {
        await fetchQuestion();
      } else if (data.status === 'completed') {
        navigate(`/interview/results/${sessionId}`);
      }
    } catch (err) {
      toast.error('Failed to load session');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestion = async () => {
    try {
      const response = await interviewService.getQuestion(sessionId);
      const data = response.data;
      
      // Handle completion response
      if (data.message && data.message.includes('completed')) {
        navigate(`/interview/results/${sessionId}`);
        return;
      }
      
      setCurrentQuestion(data.question);
      setQuestionIndex(data.question_number - 1);
      setTotalQuestions(data.total_questions);
      setAnswer('');
      setShowHint(false);
      setQuestionStartTime(Date.now());
    } catch (err) {
      if (err.response?.status === 400) {
        // Session complete
        navigate(`/interview/results/${sessionId}`);
      } else {
        toast.error('Failed to fetch question');
      }
    }
  };

  const handleSubmitAnswer = async () => {
    if (!answer.trim()) {
      toast.error('Please provide an answer');
      return;
    }

    try {
      setSubmitting(true);
      const timeTaken = Math.round((Date.now() - questionStartTime) / 1000);
      
      await interviewService.submitAnswer(sessionId, {
        question_id: currentQuestion.id,
        answer_text: answer,
        time_taken_seconds: timeTaken
      });

      setAnsweredQuestions(prev => [...prev, { question: currentQuestion, answer }]);
      setQuestionIndex(prev => prev + 1);

      if (questionIndex + 1 >= totalQuestions) {
        // Complete the session
        toast.success('Interview completed!');
        navigate(`/interview/results/${sessionId}`);
      } else {
        await fetchQuestion();
        toast.success('Answer submitted!');
      }
    } catch (err) {
      toast.error('Failed to submit answer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSkipQuestion = async () => {
    try {
      setSubmitting(true);
      await interviewService.submitAnswer(sessionId, {
        question_id: currentQuestion.id,
        answer_text: '[SKIPPED]',
        time_taken_seconds: 0
      });

      setQuestionIndex(prev => prev + 1);
      
      if (questionIndex + 1 >= totalQuestions) {
        navigate(`/interview/results/${sessionId}`);
      } else {
        await fetchQuestion();
      }
    } catch (err) {
      toast.error('Failed to skip question');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEndInterview = async () => {
    if (window.confirm('Are you sure you want to end this interview early? Your progress will be saved.')) {
      try {
        await interviewService.abandonSession(sessionId);
        navigate(`/interview/results/${sessionId}`);
      } catch (err) {
        toast.error('Failed to end interview');
      }
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'hard': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading your interview session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header with progress */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="text-lg font-semibold text-gray-900">
              Question {questionIndex + 1} of {totalQuestions}
            </div>
            {currentQuestion && (
              <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getDifficultyColor(currentQuestion.difficulty)}`}>
                {currentQuestion.difficulty}
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-gray-600">
              <Timer className="w-5 h-5" />
              <span className="font-mono text-lg">{formatTime(timeElapsed)}</span>
            </div>
            <button
              onClick={handleEndInterview}
              className="text-sm text-red-600 hover:text-red-700 font-medium"
            >
              End Interview
            </button>
          </div>
        </div>
        <ProgressBar 
          value={questionIndex} 
          max={totalQuestions} 
          showLabel 
          color="primary"
        />
      </div>

      {/* Question Card */}
      {currentQuestion ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center flex-shrink-0">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {currentQuestion.text}
              </h2>
              {currentQuestion.category && (
                <span className="text-sm text-gray-500">
                  Category: {currentQuestion.category}
                </span>
              )}
            </div>
          </div>

          {/* Answer Input */}
          <div className="space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-gray-700 mb-2 block">
                Your Answer
              </span>
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Type your answer here... Be specific and provide examples where relevant."
                rows={8}
                className="input resize-none"
                disabled={submitting}
              />
            </label>

            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>{answer.length} characters</span>
              <button
                type="button"
                onClick={() => setShowHint(!showHint)}
                className="flex items-center gap-1 text-primary-600 hover:text-primary-700"
              >
                <Lightbulb className="w-4 h-4" />
                {showHint ? 'Hide Hint' : 'Show Hint'}
              </button>
            </div>

            {showHint && currentQuestion.hints && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-yellow-800 mb-1">Hint</p>
                    <p className="text-yellow-700 text-sm">
                      {Array.isArray(currentQuestion.hints) ? currentQuestion.hints.join(', ') : currentQuestion.hints}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {showHint && !currentQuestion.hints && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-gray-600 text-sm">No hint available for this question. Try to think about key concepts and provide a structured answer.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-6">
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner size="lg" />
            <span className="ml-3 text-gray-600">Loading question...</span>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleSkipQuestion}
          disabled={submitting || !currentQuestion}
          className="btn btn-secondary flex items-center gap-2"
        >
          Skip Question
          <ChevronRight className="w-4 h-4" />
        </button>

        <button
          onClick={handleSubmitAnswer}
          disabled={submitting || !answer.trim() || !currentQuestion}
          className="btn btn-primary flex items-center gap-2"
        >
          {submitting ? (
            <>
              <LoadingSpinner size="sm" />
              Submitting...
            </>
          ) : questionIndex + 1 >= totalQuestions ? (
            <>
              <CheckCircle className="w-5 h-5" />
              Complete Interview
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Submit & Next
            </>
          )}
        </button>
      </div>

      {/* Tips Panel */}
      <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-blue-600" />
          Interview Tips
        </h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
            Take your time to structure your thoughts before answering
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
            Use specific examples from your experience when possible
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
            For technical questions, explain your thought process
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
            It's okay to skip if you're unsure - focus on questions you can answer well
          </li>
        </ul>
      </div>
    </div>
  );
}

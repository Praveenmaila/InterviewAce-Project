"""
Views for feedback and analytics.
"""

from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Avg, Count, Sum
from django.db.models.functions import TruncDate
from django.utils import timezone
from datetime import timedelta

from .models import SessionFeedback, PerformanceTrend, WeakAreaAnalysis
from .serializers import (
    SessionFeedbackSerializer,
    PerformanceTrendSerializer,
    WeakAreaSerializer
)
from .services import FeedbackEngine
from interviews.models import InterviewSession, SessionResponse


class SessionFeedbackView(generics.RetrieveAPIView):
    """Get detailed feedback for a completed session."""
    
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = SessionFeedbackSerializer
    lookup_field = 'session_id'
    lookup_url_kwarg = 'session_id'
    
    def get_queryset(self):
        return SessionFeedback.objects.filter(
            session__user=self.request.user
        )
    
    def get_object(self):
        session_id = self.kwargs.get('session_id')
        
        # Try to get existing feedback
        try:
            return SessionFeedback.objects.get(
                session_id=session_id,
                session__user=self.request.user
            )
        except SessionFeedback.DoesNotExist:
            # Generate feedback if session is completed
            session = InterviewSession.objects.get(
                id=session_id,
                user=self.request.user,
                status='completed'
            )
            
            # Generate and save feedback
            engine = FeedbackEngine()
            feedback_data = engine.generate_session_feedback(session)
            
            feedback = SessionFeedback.objects.create(
                session=session,
                **feedback_data
            )
            
            return feedback


class PerformanceTrendsView(generics.ListAPIView):
    """Get user's performance trends over time."""
    
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = PerformanceTrendSerializer
    
    def get_queryset(self):
        # Calculate trends from session data
        days = int(self.request.query_params.get('days', 30))
        start_date = timezone.now().date() - timedelta(days=days)
        
        # Get or create trends from sessions
        sessions = InterviewSession.objects.filter(
            user=self.request.user,
            status='completed',
            completed_at__date__gte=start_date
        )
        
        # Aggregate by date
        trends = sessions.annotate(
            date=TruncDate('completed_at')
        ).values('date').annotate(
            sessions_count=Count('id'),
            questions_answered=Count('responses')
        ).order_by('date')
        
        # Calculate average scores per date
        result = []
        for trend in trends:
            responses = SessionResponse.objects.filter(
                session__user=self.request.user,
                session__completed_at__date=trend['date']
            )
            
            avg_scores = responses.aggregate(
                avg_score=Avg('score'),
                avg_clarity=Avg('clarity_score'),
                avg_relevance=Avg('relevance_score'),
                avg_grammar=Avg('grammar_score'),
                avg_keyword=Avg('keyword_score')
            )
            
            result.append({
                'date': trend['date'],
                'sessions_count': trend['sessions_count'],
                'questions_answered': trend['questions_answered'],
                'average_score': round(avg_scores['avg_score'] or 0, 1),
                'clarity_avg': round(avg_scores['avg_clarity'] or 0, 1),
                'relevance_avg': round(avg_scores['avg_relevance'] or 0, 1),
                'grammar_avg': round(avg_scores['avg_grammar'] or 0, 1),
                'keyword_avg': round(avg_scores['avg_keyword'] or 0, 1)
            })
        
        return result
    
    def list(self, request, *args, **kwargs):
        trends = self.get_queryset()
        return Response(trends)


class WeakAreasView(generics.ListAPIView):
    """Get user's weak areas analysis."""
    
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = WeakAreaSerializer
    
    def get_queryset(self):
        return WeakAreaAnalysis.objects.filter(
            user=self.request.user,
            is_resolved=False
        )


class AnalyticsView(APIView):
    """Comprehensive analytics dashboard data."""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        user = request.user
        
        # Get all completed sessions
        sessions = InterviewSession.objects.filter(user=user)
        completed = sessions.filter(status='completed')
        
        # Get all responses
        responses = SessionResponse.objects.filter(session__user=user)
        
        # Calculate overall stats
        total_sessions = sessions.count()
        completed_sessions = completed.count()
        total_questions = responses.count()
        
        avg_score = responses.aggregate(avg=Avg('score'))['avg'] or 0
        
        # Domain-wise performance
        domain_performance = {}
        for session in completed:
            domain_name = session.domain.name if session.domain else 'General'
            if domain_name not in domain_performance:
                domain_performance[domain_name] = {
                    'sessions': 0,
                    'total_score': 0,
                    'questions': 0
                }
            
            domain_performance[domain_name]['sessions'] += 1
            
            session_responses = responses.filter(session=session)
            for resp in session_responses:
                if resp.score:
                    domain_performance[domain_name]['total_score'] += resp.score
                    domain_performance[domain_name]['questions'] += 1
        
        # Calculate averages and find best/weakest
        best_domain = {'name': None, 'score': 0}
        weakest_domain = {'name': None, 'score': 100}
        
        for domain, data in domain_performance.items():
            if data['questions'] > 0:
                avg = data['total_score'] / data['questions']
                data['average_score'] = round(avg, 1)
                
                if avg > best_domain['score']:
                    best_domain = {'name': domain, 'score': round(avg, 1)}
                if avg < weakest_domain['score']:
                    weakest_domain = {'name': domain, 'score': round(avg, 1)}
        
        # Calculate improvement rate (compare last 5 sessions vs previous 5)
        recent_sessions = completed.order_by('-completed_at')[:5]
        older_sessions = completed.order_by('-completed_at')[5:10]
        
        recent_avg = SessionResponse.objects.filter(
            session__in=recent_sessions
        ).aggregate(avg=Avg('score'))['avg'] or 0
        
        older_avg = SessionResponse.objects.filter(
            session__in=older_sessions
        ).aggregate(avg=Avg('score'))['avg'] or 0
        
        improvement_rate = recent_avg - older_avg if older_avg else 0
        
        # Get recent trend (last 7 days)
        week_ago = timezone.now() - timedelta(days=7)
        recent_trend = []
        
        for i in range(7):
            date = (week_ago + timedelta(days=i+1)).date()
            day_responses = responses.filter(
                created_at__date=date
            )
            day_avg = day_responses.aggregate(avg=Avg('score'))['avg']
            
            recent_trend.append({
                'date': date.isoformat(),
                'score': round(day_avg, 1) if day_avg else None,
                'count': day_responses.count()
            })
        
        # Score distribution
        score_distribution = {
            '0-20': responses.filter(score__lt=20).count(),
            '20-40': responses.filter(score__gte=20, score__lt=40).count(),
            '40-60': responses.filter(score__gte=40, score__lt=60).count(),
            '60-80': responses.filter(score__gte=60, score__lt=80).count(),
            '80-100': responses.filter(score__gte=80).count(),
        }
        
        # Interview type performance
        type_performance = {}
        for session in completed:
            type_name = session.interview_type.name if session.interview_type else 'General'
            if type_name not in type_performance:
                type_performance[type_name] = {'sessions': 0, 'avg_score': 0, 'scores': []}
            
            type_performance[type_name]['sessions'] += 1
            type_responses = responses.filter(session=session)
            for resp in type_responses:
                if resp.score:
                    type_performance[type_name]['scores'].append(resp.score)
        
        for type_name, data in type_performance.items():
            if data['scores']:
                data['avg_score'] = round(sum(data['scores']) / len(data['scores']), 1)
            del data['scores']
        
        return Response({
            'overview': {
                'total_sessions': total_sessions,
                'completed_sessions': completed_sessions,
                'total_questions': total_questions,
                'average_score': round(avg_score, 1),
                'improvement_rate': round(improvement_rate, 1)
            },
            'best_domain': best_domain,
            'weakest_domain': weakest_domain if weakest_domain['name'] else None,
            'domain_performance': domain_performance,
            'type_performance': type_performance,
            'recent_trend': recent_trend,
            'score_distribution': score_distribution
        })


class QuestionAnalyticsView(APIView):
    """Analytics for individual question performance."""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        user = request.user
        
        responses = SessionResponse.objects.filter(
            session__user=user
        ).select_related('question')
        
        # Group by difficulty
        difficulty_stats = {
            'easy': {'count': 0, 'total_score': 0, 'avg_time': 0},
            'medium': {'count': 0, 'total_score': 0, 'avg_time': 0},
            'hard': {'count': 0, 'total_score': 0, 'avg_time': 0}
        }
        
        for resp in responses:
            diff = resp.question.difficulty
            if diff in difficulty_stats:
                difficulty_stats[diff]['count'] += 1
                if resp.score:
                    difficulty_stats[diff]['total_score'] += resp.score
                difficulty_stats[diff]['avg_time'] += resp.time_taken_seconds
        
        for diff, data in difficulty_stats.items():
            if data['count'] > 0:
                data['avg_score'] = round(data['total_score'] / data['count'], 1)
                data['avg_time'] = round(data['avg_time'] / data['count'], 0)
            else:
                data['avg_score'] = 0
        
        # Best and worst performing questions
        question_scores = {}
        for resp in responses:
            q_id = resp.question_id
            if q_id not in question_scores:
                question_scores[q_id] = {
                    'question': resp.question.text[:100],
                    'domain': resp.question.domain.name if resp.question.domain else 'General',
                    'scores': []
                }
            if resp.score:
                question_scores[q_id]['scores'].append(resp.score)
        
        for q_id, data in question_scores.items():
            if data['scores']:
                data['avg_score'] = round(sum(data['scores']) / len(data['scores']), 1)
                data['attempts'] = len(data['scores'])
            del data['scores']
        
        sorted_questions = sorted(
            question_scores.values(), 
            key=lambda x: x.get('avg_score', 0)
        )
        
        return Response({
            'difficulty_performance': difficulty_stats,
            'weakest_questions': sorted_questions[:5],
            'strongest_questions': sorted_questions[-5:][::-1],
            'total_unique_questions': len(question_scores)
        })

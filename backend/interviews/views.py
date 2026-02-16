"""
Views for the interview system.
"""

from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.utils import timezone

from .models import InterviewType, Domain, Question, InterviewSession, SessionResponse
from .serializers import (
    InterviewTypeSerializer,
    DomainSerializer,
    QuestionSerializer,
    QuestionDetailSerializer,
    InterviewSessionSerializer,
    InterviewSessionDetailSerializer,
    SessionResponseSerializer,
    SessionResponseCreateSerializer,
    StartSessionSerializer
)
from feedback.services import FeedbackEngine


class InterviewTypeListView(generics.ListAPIView):
    """List all available interview types."""
    
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = InterviewTypeSerializer
    queryset = InterviewType.objects.filter(is_active=True)


class DomainListView(generics.ListAPIView):
    """List all available domains, optionally filtered by interview type."""
    
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = DomainSerializer
    
    def get_queryset(self):
        queryset = Domain.objects.filter(is_active=True)
        interview_type_id = self.request.query_params.get('interview_type')
        
        if interview_type_id:
            queryset = queryset.filter(interview_types__id=interview_type_id)
        
        return queryset


class StartSessionView(APIView):
    """Start a new interview session."""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        serializer = StartSessionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        data = serializer.validated_data
        
        # Check for any incomplete sessions
        incomplete = InterviewSession.objects.filter(
            user=request.user,
            status='in_progress'
        ).first()
        
        if incomplete:
            return Response({
                'error': 'You have an incomplete session.',
                'session_id': incomplete.id,
                'message': 'Please complete or abandon your current session first.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Create new session
        session = InterviewSession.objects.create(
            user=request.user,
            interview_type_id=data['interview_type_id'],
            domain_id=data.get('domain_id'),
            total_questions=data['total_questions'],
            time_limit_minutes=data['time_limit_minutes']
        )
        
        return Response({
            'message': 'Session started successfully!',
            'session': InterviewSessionSerializer(session).data
        }, status=status.HTTP_201_CREATED)


class SessionListView(generics.ListAPIView):
    """List user's interview sessions."""
    
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = InterviewSessionSerializer
    
    def get_queryset(self):
        queryset = InterviewSession.objects.filter(user=self.request.user)
        
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        return queryset


class SessionDetailView(generics.RetrieveAPIView):
    """Get detailed session information."""
    
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = InterviewSessionDetailSerializer
    
    def get_queryset(self):
        return InterviewSession.objects.filter(user=self.request.user)


class GetQuestionView(APIView):
    """Get the current/next question for a session."""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, session_id):
        session = get_object_or_404(
            InterviewSession,
            id=session_id,
            user=request.user
        )
        
        if session.status != 'in_progress':
            return Response({
                'error': 'This session is not active.',
                'status': session.status
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if session is complete
        if session.questions_answered >= session.total_questions:
            session.complete()
            return Response({
                'message': 'Interview completed!',
                'session': InterviewSessionSerializer(session).data
            })
        
        # Get next question
        question = session.get_next_question()
        
        if not question:
            session.complete()
            return Response({
                'message': 'No more questions available. Interview completed!',
                'session': InterviewSessionSerializer(session).data
            })
        
        return Response({
            'question': QuestionSerializer(question).data,
            'question_number': session.questions_answered + 1,
            'total_questions': session.total_questions,
            'progress': session.progress_percentage
        })


class SubmitAnswerView(APIView):
    """Submit an answer to a question."""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, session_id):
        session = get_object_or_404(
            InterviewSession,
            id=session_id,
            user=request.user,
            status='in_progress'
        )
        
        question_id = request.data.get('question_id')
        if not question_id:
            return Response({
                'error': 'question_id is required.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        question = get_object_or_404(Question, id=question_id)
        
        # Check if already answered
        if SessionResponse.objects.filter(session=session, question=question).exists():
            return Response({
                'error': 'This question has already been answered.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = SessionResponseCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Create response
        response = SessionResponse.objects.create(
            session=session,
            question=question,
            **serializer.validated_data
        )
        
        # Generate AI feedback
        feedback_engine = FeedbackEngine()
        feedback = feedback_engine.analyze_response(response)
        
        # Update response with feedback
        response.score = feedback['overall_score']
        response.clarity_score = feedback['clarity_score']
        response.relevance_score = feedback['relevance_score']
        response.grammar_score = feedback['grammar_score']
        response.keyword_score = feedback['keyword_score']
        response.feedback_text = feedback['feedback_text']
        response.strengths = feedback['strengths']
        response.improvements = feedback['improvements']
        response.save()
        
        # Update session progress
        session.current_question_index += 1
        session.save()
        
        # Update question statistics
        question.times_asked += 1
        # Update running average
        if question.avg_score == 0:
            question.avg_score = feedback['overall_score']
        else:
            question.avg_score = (question.avg_score + feedback['overall_score']) / 2
        question.save()
        
        # Check if session is complete
        is_complete = session.questions_answered >= session.total_questions
        if is_complete:
            session.complete()
        
        return Response({
            'response': SessionResponseSerializer(response).data,
            'is_complete': is_complete,
            'session': InterviewSessionSerializer(session).data
        })


class AbandonSessionView(APIView):
    """Abandon an in-progress session."""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, session_id):
        session = get_object_or_404(
            InterviewSession,
            id=session_id,
            user=request.user,
            status='in_progress'
        )
        
        session.status = 'abandoned'
        session.completed_at = timezone.now()
        session.save()
        
        return Response({
            'message': 'Session abandoned.',
            'session': InterviewSessionSerializer(session).data
        })


class SessionHistoryView(generics.ListAPIView):
    """Get user's session history with filtering."""
    
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = InterviewSessionSerializer
    
    def get_queryset(self):
        queryset = InterviewSession.objects.filter(
            user=self.request.user,
            status='completed'
        )
        
        # Filter by interview type
        interview_type = self.request.query_params.get('interview_type')
        if interview_type:
            queryset = queryset.filter(interview_type_id=interview_type)
        
        # Filter by domain
        domain = self.request.query_params.get('domain')
        if domain:
            queryset = queryset.filter(domain_id=domain)
        
        # Filter by date range
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        
        if start_date:
            queryset = queryset.filter(created_at__gte=start_date)
        if end_date:
            queryset = queryset.filter(created_at__lte=end_date)
        
        return queryset

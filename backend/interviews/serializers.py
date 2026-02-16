"""
Serializers for the interview system.
"""

from rest_framework import serializers
from .models import InterviewType, Domain, Question, InterviewSession, SessionResponse


class InterviewTypeSerializer(serializers.ModelSerializer):
    """Serializer for interview types."""
    
    question_count = serializers.SerializerMethodField()
    
    class Meta:
        model = InterviewType
        fields = ['id', 'name', 'slug', 'description', 'icon', 'question_count']
    
    def get_question_count(self, obj):
        return obj.questions.filter(is_active=True).count()


class DomainSerializer(serializers.ModelSerializer):
    """Serializer for domains."""
    
    question_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Domain
        fields = ['id', 'name', 'slug', 'description', 'icon', 'color', 'question_count']
    
    def get_question_count(self, obj):
        return obj.questions.filter(is_active=True).count()


class QuestionSerializer(serializers.ModelSerializer):
    """Serializer for questions (limited info for active interviews)."""
    
    class Meta:
        model = Question
        fields = ['id', 'text', 'difficulty', 'hints']


class QuestionDetailSerializer(serializers.ModelSerializer):
    """Full question details (for review after answering)."""
    
    interview_type_name = serializers.CharField(source='interview_type.name', read_only=True)
    domain_name = serializers.CharField(source='domain.name', read_only=True)
    
    class Meta:
        model = Question
        fields = [
            'id', 'text', 'difficulty', 'expected_keywords',
            'sample_answer', 'explanation', 'hints', 'follow_up_questions',
            'interview_type_name', 'domain_name'
        ]


class SessionResponseSerializer(serializers.ModelSerializer):
    """Serializer for session responses."""
    
    question = QuestionSerializer(read_only=True)
    
    class Meta:
        model = SessionResponse
        fields = [
            'id', 'question', 'answer_text', 'time_taken_seconds',
            'score', 'clarity_score', 'relevance_score',
            'grammar_score', 'keyword_score',
            'feedback_text', 'strengths', 'improvements', 'created_at'
        ]


class SessionResponseCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating a response."""
    
    class Meta:
        model = SessionResponse
        fields = ['answer_text', 'time_taken_seconds']


class InterviewSessionSerializer(serializers.ModelSerializer):
    """Serializer for interview sessions."""
    
    interview_type_name = serializers.CharField(source='interview_type.name', read_only=True)
    domain_name = serializers.CharField(source='domain.name', read_only=True)
    progress_percentage = serializers.ReadOnlyField()
    questions_answered = serializers.ReadOnlyField()
    
    class Meta:
        model = InterviewSession
        fields = [
            'id', 'interview_type', 'interview_type_name',
            'domain', 'domain_name', 'status',
            'total_questions', 'time_limit_minutes',
            'current_question_index', 'progress_percentage',
            'questions_answered', 'started_at', 'completed_at'
        ]
        read_only_fields = ['status', 'current_question_index', 'started_at', 'completed_at']


class InterviewSessionDetailSerializer(serializers.ModelSerializer):
    """Detailed session serializer with responses."""
    
    interview_type = InterviewTypeSerializer(read_only=True)
    domain = DomainSerializer(read_only=True)
    responses = SessionResponseSerializer(many=True, read_only=True)
    progress_percentage = serializers.ReadOnlyField()
    questions_answered = serializers.ReadOnlyField()
    
    class Meta:
        model = InterviewSession
        fields = [
            'id', 'interview_type', 'domain', 'status',
            'total_questions', 'time_limit_minutes',
            'current_question_index', 'progress_percentage',
            'questions_answered', 'responses',
            'started_at', 'completed_at'
        ]


class StartSessionSerializer(serializers.Serializer):
    """Serializer for starting a new interview session."""
    
    interview_type_id = serializers.IntegerField()
    domain_id = serializers.IntegerField(required=False, allow_null=True)
    total_questions = serializers.IntegerField(default=10, min_value=5, max_value=30)
    time_limit_minutes = serializers.IntegerField(default=30, min_value=10, max_value=120)
    
    def validate_interview_type_id(self, value):
        if not InterviewType.objects.filter(id=value, is_active=True).exists():
            raise serializers.ValidationError("Invalid interview type.")
        return value
    
    def validate_domain_id(self, value):
        if value and not Domain.objects.filter(id=value, is_active=True).exists():
            raise serializers.ValidationError("Invalid domain.")
        return value

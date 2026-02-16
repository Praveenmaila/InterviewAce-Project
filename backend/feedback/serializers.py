"""
Serializers for feedback app.
"""

from rest_framework import serializers
from .models import SessionFeedback, PerformanceTrend, WeakAreaAnalysis


class SessionFeedbackSerializer(serializers.ModelSerializer):
    """Serializer for session feedback."""
    
    session_info = serializers.SerializerMethodField()
    
    class Meta:
        model = SessionFeedback
        fields = [
            'id', 'session', 'session_info',
            'overall_score', 'communication_score',
            'technical_score', 'confidence_score',
            'summary', 'key_strengths', 'areas_to_improve',
            'recommendations', 'category_scores',
            'percentile_rank', 'created_at'
        ]
    
    def get_session_info(self, obj):
        session = obj.session
        return {
            'id': session.id,
            'interview_type': session.interview_type.name if session.interview_type else None,
            'domain': session.domain.name if session.domain else None,
            'completed_at': session.completed_at
        }


class PerformanceTrendSerializer(serializers.ModelSerializer):
    """Serializer for performance trends."""
    
    class Meta:
        model = PerformanceTrend
        fields = [
            'id', 'date', 'average_score', 'sessions_count',
            'questions_answered', 'clarity_avg', 'relevance_avg',
            'grammar_avg', 'keyword_avg'
        ]


class WeakAreaSerializer(serializers.ModelSerializer):
    """Serializer for weak areas analysis."""
    
    domain_name = serializers.CharField(source='domain.name', read_only=True)
    
    class Meta:
        model = WeakAreaAnalysis
        fields = [
            'id', 'domain', 'domain_name', 'topic',
            'average_score', 'questions_attempted',
            'suggested_resources', 'practice_questions_ids',
            'is_resolved', 'identified_at', 'updated_at'
        ]


class AnalyticsSummarySerializer(serializers.Serializer):
    """Serializer for analytics summary."""
    
    total_sessions = serializers.IntegerField()
    completed_sessions = serializers.IntegerField()
    total_questions_answered = serializers.IntegerField()
    average_score = serializers.FloatField()
    best_domain = serializers.DictField()
    weakest_domain = serializers.DictField()
    improvement_rate = serializers.FloatField()
    recent_trend = serializers.ListField()
    score_distribution = serializers.DictField()

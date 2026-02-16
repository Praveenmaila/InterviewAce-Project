"""
Models for feedback and analytics.
"""

from django.db import models
from django.conf import settings


class SessionFeedback(models.Model):
    """Overall feedback for a completed interview session."""
    
    session = models.OneToOneField(
        'interviews.InterviewSession',
        on_delete=models.CASCADE,
        related_name='feedback'
    )
    
    # Overall scores (0-100)
    overall_score = models.FloatField(default=0.0)
    communication_score = models.FloatField(default=0.0)
    technical_score = models.FloatField(default=0.0)
    confidence_score = models.FloatField(default=0.0)
    
    # Detailed analysis
    summary = models.TextField(blank=True)
    key_strengths = models.JSONField(default=list, blank=True)
    areas_to_improve = models.JSONField(default=list, blank=True)
    recommendations = models.JSONField(default=list, blank=True)
    
    # Performance breakdown by category
    category_scores = models.JSONField(default=dict, blank=True)
    
    # Comparative analysis
    percentile_rank = models.FloatField(null=True, blank=True)  # Among all users
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Feedback for Session {self.session_id} - {self.overall_score}%"


class PerformanceTrend(models.Model):
    """Track user's performance trends over time."""
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='performance_trends'
    )
    
    # Time period
    date = models.DateField()
    
    # Aggregated scores
    average_score = models.FloatField(default=0.0)
    sessions_count = models.PositiveIntegerField(default=0)
    questions_answered = models.PositiveIntegerField(default=0)
    
    # Score breakdown
    clarity_avg = models.FloatField(default=0.0)
    relevance_avg = models.FloatField(default=0.0)
    grammar_avg = models.FloatField(default=0.0)
    keyword_avg = models.FloatField(default=0.0)
    
    class Meta:
        unique_together = ['user', 'date']
        ordering = ['-date']
    
    def __str__(self):
        return f"{self.user.email} - {self.date} - {self.average_score}%"


class WeakAreaAnalysis(models.Model):
    """Identify and track weak areas for users."""
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='weak_areas'
    )
    
    # Category information
    domain = models.ForeignKey(
        'interviews.Domain',
        on_delete=models.CASCADE,
        null=True,
        blank=True
    )
    topic = models.CharField(max_length=200)
    
    # Performance data
    average_score = models.FloatField(default=0.0)
    questions_attempted = models.PositiveIntegerField(default=0)
    
    # Recommendations
    suggested_resources = models.JSONField(default=list, blank=True)
    practice_questions_ids = models.JSONField(default=list, blank=True)
    
    # Status
    is_resolved = models.BooleanField(default=False)
    
    # Timestamps
    identified_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['average_score', '-questions_attempted']
    
    def __str__(self):
        return f"{self.user.email} - {self.topic} - {self.average_score}%"

"""
Admin configuration for feedback app.
"""

from django.contrib import admin
from .models import SessionFeedback, PerformanceTrend, WeakAreaAnalysis


@admin.register(SessionFeedback)
class SessionFeedbackAdmin(admin.ModelAdmin):
    list_display = ['session', 'overall_score', 'communication_score', 'technical_score', 'created_at']
    list_filter = ['overall_score', 'created_at']
    search_fields = ['session__user__email']
    readonly_fields = ['created_at']
    raw_id_fields = ['session']


@admin.register(PerformanceTrend)
class PerformanceTrendAdmin(admin.ModelAdmin):
    list_display = ['user', 'date', 'average_score', 'sessions_count', 'questions_answered']
    list_filter = ['date']
    search_fields = ['user__email']
    raw_id_fields = ['user']


@admin.register(WeakAreaAnalysis)
class WeakAreaAnalysisAdmin(admin.ModelAdmin):
    list_display = ['user', 'topic', 'domain', 'average_score', 'is_resolved', 'identified_at']
    list_filter = ['is_resolved', 'domain', 'identified_at']
    search_fields = ['user__email', 'topic']
    raw_id_fields = ['user', 'domain']

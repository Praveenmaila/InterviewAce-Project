"""
Admin configuration for interviews app.
"""

from django.contrib import admin
from .models import InterviewType, Domain, Question, InterviewSession, SessionResponse


@admin.register(InterviewType)
class InterviewTypeAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'is_active', 'order']
    list_filter = ['is_active']
    search_fields = ['name', 'description']
    prepopulated_fields = {'slug': ('name',)}
    ordering = ['order', 'name']


@admin.register(Domain)
class DomainAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'color', 'is_active', 'order']
    list_filter = ['is_active', 'interview_types']
    search_fields = ['name', 'description']
    prepopulated_fields = {'slug': ('name',)}
    filter_horizontal = ['interview_types']
    ordering = ['order', 'name']


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ['text_preview', 'interview_type', 'domain', 'difficulty', 'times_asked', 'avg_score', 'is_active']
    list_filter = ['interview_type', 'domain', 'difficulty', 'is_active']
    search_fields = ['text', 'sample_answer']
    readonly_fields = ['times_asked', 'avg_score', 'created_at', 'updated_at']
    
    def text_preview(self, obj):
        return obj.text[:50] + '...' if len(obj.text) > 50 else obj.text
    text_preview.short_description = 'Question'


@admin.register(InterviewSession)
class InterviewSessionAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'interview_type', 'domain', 'status', 'questions_answered', 'total_questions', 'created_at']
    list_filter = ['status', 'interview_type', 'domain', 'created_at']
    search_fields = ['user__email', 'user__username']
    readonly_fields = ['created_at', 'started_at', 'completed_at']
    raw_id_fields = ['user']


@admin.register(SessionResponse)
class SessionResponseAdmin(admin.ModelAdmin):
    list_display = ['id', 'session', 'question_preview', 'score', 'time_taken_seconds', 'created_at']
    list_filter = ['score', 'created_at']
    search_fields = ['session__user__email', 'answer_text']
    readonly_fields = ['created_at']
    raw_id_fields = ['session', 'question']
    
    def question_preview(self, obj):
        return obj.question.text[:30] + '...'
    question_preview.short_description = 'Question'

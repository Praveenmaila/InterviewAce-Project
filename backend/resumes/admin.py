"""
Admin configuration for resumes app.
"""

from django.contrib import admin
from .models import Resume, ResumeAnalysis, ResumeTemplate


@admin.register(Resume)
class ResumeAdmin(admin.ModelAdmin):
    list_display = ['user', 'original_filename', 'file_type', 'status', 'is_primary', 'created_at']
    list_filter = ['status', 'file_type', 'is_primary', 'created_at']
    search_fields = ['user__email', 'original_filename']
    readonly_fields = ['file_size', 'created_at', 'updated_at']
    raw_id_fields = ['user']


@admin.register(ResumeAnalysis)
class ResumeAnalysisAdmin(admin.ModelAdmin):
    list_display = ['resume', 'overall_score', 'ats_score', 'created_at']
    list_filter = ['overall_score', 'ats_score', 'created_at']
    search_fields = ['resume__user__email', 'resume__original_filename']
    readonly_fields = ['created_at']
    raw_id_fields = ['resume']


@admin.register(ResumeTemplate)
class ResumeTemplateAdmin(admin.ModelAdmin):
    list_display = ['name', 'target_audience', 'is_premium', 'is_active']
    list_filter = ['target_audience', 'is_premium', 'is_active']
    search_fields = ['name', 'description']

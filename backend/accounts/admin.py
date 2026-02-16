"""
Admin configuration for accounts app.
"""

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, UserSkill


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['email', 'username', 'full_name', 'experience_level', 'is_active', 'created_at']
    list_filter = ['experience_level', 'is_active', 'is_staff', 'created_at']
    search_fields = ['email', 'username', 'first_name', 'last_name']
    ordering = ['-created_at']
    
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Profile Information', {
            'fields': ('bio', 'avatar', 'experience_level', 'target_role')
        }),
        ('Links', {
            'fields': ('linkedin_url', 'github_url', 'portfolio_url')
        }),
        ('Preferences', {
            'fields': ('preferred_domains',)
        }),
    )


@admin.register(UserSkill)
class UserSkillAdmin(admin.ModelAdmin):
    list_display = ['user', 'name', 'proficiency', 'created_at']
    list_filter = ['proficiency', 'created_at']
    search_fields = ['user__email', 'name']

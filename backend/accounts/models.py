"""
User models for InterviewAce platform.
Custom user model with extended profile information.
"""

from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """Extended User model with additional fields for interview platform."""
    
    email = models.EmailField(unique=True)
    
    # Profile information
    bio = models.TextField(max_length=500, blank=True)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    
    # Career information
    EXPERIENCE_CHOICES = [
        ('student', 'Student'),
        ('fresher', 'Fresh Graduate (0-1 years)'),
        ('junior', 'Junior (1-3 years)'),
        ('mid', 'Mid-level (3-5 years)'),
        ('senior', 'Senior (5+ years)'),
    ]
    experience_level = models.CharField(
        max_length=20, 
        choices=EXPERIENCE_CHOICES, 
        default='student'
    )
    
    target_role = models.CharField(max_length=100, blank=True)
    linkedin_url = models.URLField(blank=True)
    github_url = models.URLField(blank=True)
    portfolio_url = models.URLField(blank=True)
    
    # Preferences
    preferred_domains = models.JSONField(default=list, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Use email for authentication
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']
    
    class Meta:
        verbose_name = 'User'
        verbose_name_plural = 'Users'
        ordering = ['-created_at']
    
    def __str__(self):
        return self.email
    
    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip() or self.username
    
    @property
    def total_interviews(self):
        return self.interview_sessions.count()
    
    @property
    def completed_interviews(self):
        return self.interview_sessions.filter(status='completed').count()


class UserSkill(models.Model):
    """User's skills with proficiency levels."""
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='skills')
    name = models.CharField(max_length=100)
    
    PROFICIENCY_CHOICES = [
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
        ('expert', 'Expert'),
    ]
    proficiency = models.CharField(
        max_length=20, 
        choices=PROFICIENCY_CHOICES, 
        default='intermediate'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['user', 'name']
        ordering = ['name']
    
    def __str__(self):
        return f"{self.user.email} - {self.name} ({self.proficiency})"

"""
Models for resume management and analysis.
"""

from django.db import models
from django.conf import settings


class Resume(models.Model):
    """Uploaded resume document."""
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='resumes'
    )
    
    # File information
    file = models.FileField(upload_to='resumes/%Y/%m/')
    original_filename = models.CharField(max_length=255)
    file_type = models.CharField(max_length=20)  # pdf, docx, etc.
    file_size = models.PositiveIntegerField()  # bytes
    
    # Extracted content
    extracted_text = models.TextField(blank=True)
    
    # Analysis status
    STATUS_CHOICES = [
        ('pending', 'Pending Analysis'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )
    
    # Metadata
    is_primary = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.email} - {self.original_filename}"
    
    def save(self, *args, **kwargs):
        # Ensure only one primary resume per user
        if self.is_primary:
            Resume.objects.filter(
                user=self.user, 
                is_primary=True
            ).update(is_primary=False)
        super().save(*args, **kwargs)


class ResumeAnalysis(models.Model):
    """Analysis results for a resume."""
    
    resume = models.OneToOneField(
        Resume,
        on_delete=models.CASCADE,
        related_name='analysis'
    )
    
    # Overall score (0-100)
    overall_score = models.FloatField(default=0.0)
    
    # Section scores
    format_score = models.FloatField(default=0.0)
    content_score = models.FloatField(default=0.0)
    keywords_score = models.FloatField(default=0.0)
    impact_score = models.FloatField(default=0.0)
    
    # Extracted information
    extracted_skills = models.JSONField(default=list, blank=True)
    extracted_experience = models.JSONField(default=list, blank=True)
    extracted_education = models.JSONField(default=list, blank=True)
    extracted_projects = models.JSONField(default=list, blank=True)
    
    # Analysis results
    strengths = models.JSONField(default=list, blank=True)
    weaknesses = models.JSONField(default=list, blank=True)
    suggestions = models.JSONField(default=list, blank=True)
    
    # Missing elements
    missing_sections = models.JSONField(default=list, blank=True)
    
    # ATS compatibility
    ats_score = models.FloatField(default=0.0)
    ats_issues = models.JSONField(default=list, blank=True)
    
    # Keyword analysis
    found_keywords = models.JSONField(default=list, blank=True)
    missing_keywords = models.JSONField(default=list, blank=True)
    
    # Summary
    summary = models.TextField(blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name_plural = 'Resume Analyses'
    
    def __str__(self):
        return f"Analysis for {self.resume.original_filename} - {self.overall_score}%"


class ResumeTemplate(models.Model):
    """Template suggestions for resume improvement."""
    
    name = models.CharField(max_length=100)
    description = models.TextField()
    preview_image = models.ImageField(upload_to='templates/', null=True, blank=True)
    
    # Target audience
    TARGET_CHOICES = [
        ('fresher', 'Fresh Graduate'),
        ('experienced', 'Experienced Professional'),
        ('career_change', 'Career Changer'),
        ('technical', 'Technical Role'),
        ('management', 'Management Role'),
    ]
    target_audience = models.CharField(max_length=20, choices=TARGET_CHOICES)
    
    # Template content
    sections = models.JSONField(default=list)
    tips = models.JSONField(default=list)
    
    is_premium = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['target_audience', 'name']
    
    def __str__(self):
        return f"{self.name} ({self.target_audience})"

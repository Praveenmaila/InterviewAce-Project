"""
Models for the interview system.
Includes interview types, domains, questions, and sessions.
"""

from django.db import models
from django.conf import settings
from django.utils import timezone
import random


class InterviewType(models.Model):
    """Types of interviews (HR, Technical, etc.)"""
    
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=50, default='briefcase')  # Icon name for frontend
    is_active = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0)
    
    class Meta:
        ordering = ['order', 'name']
    
    def __str__(self):
        return self.name


class Domain(models.Model):
    """Technical domains (React, Django, DSA, Java, etc.)"""
    
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=50, default='code')
    color = models.CharField(max_length=20, default='blue')  # For UI styling
    interview_types = models.ManyToManyField(
        InterviewType, 
        related_name='domains',
        blank=True
    )
    is_active = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0)
    
    class Meta:
        ordering = ['order', 'name']
    
    def __str__(self):
        return self.name


class Question(models.Model):
    """Interview questions database."""
    
    DIFFICULTY_CHOICES = [
        ('easy', 'Easy'),
        ('medium', 'Medium'),
        ('hard', 'Hard'),
    ]
    
    interview_type = models.ForeignKey(
        InterviewType, 
        on_delete=models.CASCADE,
        related_name='questions'
    )
    domain = models.ForeignKey(
        Domain,
        on_delete=models.CASCADE,
        related_name='questions',
        null=True,
        blank=True
    )
    
    text = models.TextField()
    difficulty = models.CharField(
        max_length=10, 
        choices=DIFFICULTY_CHOICES,
        default='medium'
    )
    
    # Expected elements in a good answer (for scoring)
    expected_keywords = models.JSONField(default=list, blank=True)
    sample_answer = models.TextField(blank=True)
    explanation = models.TextField(blank=True)
    
    # Hints for adaptive learning
    hints = models.JSONField(default=list, blank=True)
    
    # Follow-up questions for deeper assessment
    follow_up_questions = models.JSONField(default=list, blank=True)
    
    # Metadata
    times_asked = models.PositiveIntegerField(default=0)
    avg_score = models.FloatField(default=0.0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(default=timezone.now)
    
    class Meta:
        ordering = ['difficulty', '-created_at']
        indexes = [
            models.Index(fields=['interview_type', 'domain', 'difficulty']),
        ]
    
    def __str__(self):
        return f"{self.text[:50]}... ({self.difficulty})"
    
    @classmethod
    def get_adaptive_question(cls, session):
        """Get next question based on user's performance."""
        
        # Get questions not yet asked in this session
        asked_ids = session.responses.values_list('question_id', flat=True)
        
        available_questions = cls.objects.filter(
            interview_type=session.interview_type,
            is_active=True
        ).exclude(id__in=asked_ids)
        
        # Filter by domain if specified
        if session.domain:
            available_questions = available_questions.filter(
                models.Q(domain=session.domain) | models.Q(domain__isnull=True)
            )
        
        if not available_questions.exists():
            return None
        
        # Adaptive difficulty based on performance
        responses = session.responses.all()
        if responses.count() >= 2:
            recent_scores = [r.score for r in responses.order_by('-created_at')[:3] if r.score]
            avg_recent = sum(recent_scores) / len(recent_scores) if recent_scores else 50
            
            if avg_recent >= 80:
                # User is doing well, increase difficulty
                preferred_difficulty = ['hard', 'medium']
            elif avg_recent >= 50:
                # Medium performance
                preferred_difficulty = ['medium', 'easy', 'hard']
            else:
                # Struggling, ease up
                preferred_difficulty = ['easy', 'medium']
            
            for diff in preferred_difficulty:
                questions = available_questions.filter(difficulty=diff)
                if questions.exists():
                    return random.choice(list(questions))
        
        # Default: random selection with weight towards medium
        return random.choice(list(available_questions))


class InterviewSession(models.Model):
    """A single interview session."""
    
    STATUS_CHOICES = [
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('abandoned', 'Abandoned'),
    ]
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='interview_sessions'
    )
    interview_type = models.ForeignKey(
        InterviewType,
        on_delete=models.SET_NULL,
        null=True,
        related_name='sessions'
    )
    domain = models.ForeignKey(
        Domain,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='sessions'
    )
    
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='in_progress'
    )
    
    # Session settings
    total_questions = models.PositiveIntegerField(default=10)
    time_limit_minutes = models.PositiveIntegerField(default=30)
    
    # Progress tracking
    current_question_index = models.PositiveIntegerField(default=0)
    
    # Timestamps
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'status']),
        ]
    
    def __str__(self):
        return f"{self.user.email} - {self.interview_type} - {self.status}"
    
    @property
    def progress_percentage(self):
        if self.total_questions == 0:
            return 0
        return round((self.current_question_index / self.total_questions) * 100)
    
    @property
    def questions_answered(self):
        return self.responses.count()
    
    def get_next_question(self):
        """Get the next adaptive question for this session."""
        return Question.get_adaptive_question(self)
    
    def complete(self):
        """Mark session as completed."""
        from django.utils import timezone
        self.status = 'completed'
        self.completed_at = timezone.now()
        self.save()


class SessionResponse(models.Model):
    """User's response to a question in a session."""
    
    session = models.ForeignKey(
        InterviewSession,
        on_delete=models.CASCADE,
        related_name='responses'
    )
    question = models.ForeignKey(
        Question,
        on_delete=models.CASCADE,
        related_name='responses'
    )
    
    # User's answer
    answer_text = models.TextField()
    answer_audio_url = models.URLField(blank=True)  # For voice responses (future)
    
    # Time tracking
    time_taken_seconds = models.PositiveIntegerField(default=0)
    
    # Scores (0-100)
    score = models.FloatField(null=True, blank=True)
    clarity_score = models.FloatField(null=True, blank=True)
    relevance_score = models.FloatField(null=True, blank=True)
    grammar_score = models.FloatField(null=True, blank=True)
    keyword_score = models.FloatField(null=True, blank=True)
    
    # Feedback
    feedback_text = models.TextField(blank=True)
    strengths = models.JSONField(default=list, blank=True)
    improvements = models.JSONField(default=list, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['created_at']
        unique_together = ['session', 'question']
    
    def __str__(self):
        return f"Response to {self.question.id} - Score: {self.score}"

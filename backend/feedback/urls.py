"""
URL routes for feedback app.
"""

from django.urls import path
from .views import (
    SessionFeedbackView,
    PerformanceTrendsView,
    WeakAreasView,
    AnalyticsView,
    QuestionAnalyticsView
)

urlpatterns = [
    path('sessions/<int:session_id>/', SessionFeedbackView.as_view(), name='session_feedback'),
    path('trends/', PerformanceTrendsView.as_view(), name='performance_trends'),
    path('weak-areas/', WeakAreasView.as_view(), name='weak_areas'),
    path('analytics/', AnalyticsView.as_view(), name='analytics'),
    path('question-analytics/', QuestionAnalyticsView.as_view(), name='question_analytics'),
]

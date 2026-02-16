"""
URL routes for interviews app.
"""

from django.urls import path
from .views import (
    InterviewTypeListView,
    DomainListView,
    StartSessionView,
    SessionListView,
    SessionDetailView,
    GetQuestionView,
    SubmitAnswerView,
    AbandonSessionView,
    SessionHistoryView
)

urlpatterns = [
    # Interview setup
    path('types/', InterviewTypeListView.as_view(), name='interview_types'),
    path('domains/', DomainListView.as_view(), name='domains'),
    
    # Session management
    path('sessions/', SessionListView.as_view(), name='session_list'),
    path('sessions/start/', StartSessionView.as_view(), name='start_session'),
    path('sessions/<int:pk>/', SessionDetailView.as_view(), name='session_detail'),
    path('sessions/<int:session_id>/question/', GetQuestionView.as_view(), name='get_question'),
    path('sessions/<int:session_id>/answer/', SubmitAnswerView.as_view(), name='submit_answer'),
    path('sessions/<int:session_id>/abandon/', AbandonSessionView.as_view(), name='abandon_session'),
    
    # History
    path('history/', SessionHistoryView.as_view(), name='session_history'),
]

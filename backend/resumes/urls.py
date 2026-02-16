"""
URL routes for resume app.
"""

from django.urls import path
from .views import (
    ResumeUploadView,
    ResumeListView,
    ResumeDetailView,
    ResumeAnalysisView,
    SetPrimaryResumeView,
    ReanalyzeResumeView,
    ResumeTemplateListView,
    ResumeCompareView,
    ChatbotView
)

urlpatterns = [
    path('upload/', ResumeUploadView.as_view(), name='resume_upload'),
    path('', ResumeListView.as_view(), name='resume_list'),
    path('<int:pk>/', ResumeDetailView.as_view(), name='resume_detail'),
    path('analysis/<int:resume_id>/', ResumeAnalysisView.as_view(), name='resume_analysis'),
    path('<int:pk>/set-primary/', SetPrimaryResumeView.as_view(), name='set_primary_resume'),
    path('<int:pk>/reanalyze/', ReanalyzeResumeView.as_view(), name='reanalyze_resume'),
    path('templates/', ResumeTemplateListView.as_view(), name='resume_templates'),
    path('compare/', ResumeCompareView.as_view(), name='resume_compare'),
    path('chatbot/', ChatbotView.as_view(), name='chatbot'),
]

"""
URL routes for accounts app.
"""

from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

from .views import (
    RegisterView,
    ProfileView,
    ChangePasswordView,
    UserSkillsView,
    UserSkillDetailView,
    LogoutView,
    DashboardStatsView
)

urlpatterns = [
    # Authentication
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('logout/', LogoutView.as_view(), name='logout'),
    
    # Profile
    path('profile/', ProfileView.as_view(), name='profile'),
    path('change-password/', ChangePasswordView.as_view(), name='change_password'),
    
    # Skills
    path('skills/', UserSkillsView.as_view(), name='user_skills'),
    path('skills/<int:pk>/', UserSkillDetailView.as_view(), name='user_skill_detail'),
    
    # Dashboard
    path('dashboard/', DashboardStatsView.as_view(), name='dashboard_stats'),
]

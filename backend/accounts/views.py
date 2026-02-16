"""
Views for user authentication and profile management.
"""

from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model

from .serializers import (
    UserRegistrationSerializer,
    UserProfileSerializer,
    UserProfileUpdateSerializer,
    UserSkillSerializer,
    ChangePasswordSerializer
)
from .models import UserSkill

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    """User registration endpoint."""
    
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = UserRegistrationSerializer
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Generate tokens for the new user
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'message': 'Registration successful!',
            'user': UserProfileSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_201_CREATED)


class ProfileView(generics.RetrieveUpdateAPIView):
    """Get and update user profile."""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return UserProfileUpdateSerializer
        return UserProfileSerializer
    
    def get_object(self):
        return self.request.user
    
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        # Return full profile data
        return Response(UserProfileSerializer(instance).data)


class ChangePasswordView(generics.UpdateAPIView):
    """Change user password."""
    
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ChangePasswordSerializer
    
    def get_object(self):
        return self.request.user
    
    def update(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = self.get_object()
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        
        return Response({
            'message': 'Password changed successfully!'
        }, status=status.HTTP_200_OK)


class UserSkillsView(generics.ListCreateAPIView):
    """List and add user skills."""
    
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserSkillSerializer
    
    def get_queryset(self):
        return UserSkill.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class UserSkillDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Update or delete a specific user skill."""
    
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserSkillSerializer
    
    def get_queryset(self):
        return UserSkill.objects.filter(user=self.request.user)


class LogoutView(APIView):
    """Logout user by blacklisting refresh token."""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            return Response({
                'message': 'Logout successful!'
            }, status=status.HTTP_200_OK)
        except Exception:
            return Response({
                'message': 'Logout successful!'
            }, status=status.HTTP_200_OK)


class DashboardStatsView(APIView):
    """Get dashboard statistics for the user."""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        user = request.user
        
        # Import here to avoid circular imports
        from interviews.models import InterviewSession
        from feedback.models import SessionFeedback
        
        sessions = InterviewSession.objects.filter(user=user)
        completed_sessions = sessions.filter(status='completed')
        
        # Calculate average score
        feedbacks = SessionFeedback.objects.filter(session__user=user)
        avg_score = feedbacks.aggregate(
            avg=models.Avg('overall_score')
        )['avg'] or 0
        
        # Get recent sessions
        recent_sessions = sessions.order_by('-created_at')[:5]
        
        # Domain-wise performance
        domain_stats = {}
        for session in completed_sessions:
            domain = session.domain.name if session.domain else 'General'
            if domain not in domain_stats:
                domain_stats[domain] = {'count': 0, 'total_score': 0}
            domain_stats[domain]['count'] += 1
            
            feedback = feedbacks.filter(session=session).first()
            if feedback:
                domain_stats[domain]['total_score'] += feedback.overall_score
        
        # Calculate averages per domain
        for domain in domain_stats:
            count = domain_stats[domain]['count']
            domain_stats[domain]['avg_score'] = round(
                domain_stats[domain]['total_score'] / count, 1
            ) if count > 0 else 0
        
        return Response({
            'total_interviews': sessions.count(),
            'completed_interviews': completed_sessions.count(),
            'average_score': round(avg_score, 1),
            'domain_performance': domain_stats,
            'recent_sessions': [
                {
                    'id': s.id,
                    'type': s.interview_type.name if s.interview_type else 'General',
                    'domain': s.domain.name if s.domain else 'General',
                    'status': s.status,
                    'created_at': s.created_at,
                }
                for s in recent_sessions
            ]
        })


# Import models at top level for the DashboardStatsView
from django.db import models

"""
Serializers for user authentication and profile management.
"""

from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from .models import UserSkill

User = get_user_model()


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration."""
    
    password = serializers.CharField(
        write_only=True, 
        required=True, 
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    password_confirm = serializers.CharField(
        write_only=True, 
        required=True,
        style={'input_type': 'password'}
    )
    
    class Meta:
        model = User
        fields = [
            'email', 'username', 'password', 'password_confirm',
            'first_name', 'last_name', 'experience_level', 'target_role'
        ]
        extra_kwargs = {
            'first_name': {'required': True},
            'last_name': {'required': True},
        }
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({
                'password_confirm': "Passwords don't match."
            })
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(**validated_data)
        return user


class UserLoginSerializer(serializers.Serializer):
    """Serializer for user login."""
    
    email = serializers.EmailField(required=True)
    password = serializers.CharField(required=True, write_only=True)


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for user profile."""
    
    full_name = serializers.ReadOnlyField()
    total_interviews = serializers.ReadOnlyField()
    completed_interviews = serializers.ReadOnlyField()
    skills = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'username', 'first_name', 'last_name', 'full_name',
            'bio', 'avatar', 'experience_level', 'target_role',
            'linkedin_url', 'github_url', 'portfolio_url',
            'preferred_domains', 'total_interviews', 'completed_interviews',
            'skills', 'created_at', 'updated_at'
        ]
        read_only_fields = ['email', 'created_at', 'updated_at']
    
    def get_skills(self, obj):
        return UserSkillSerializer(obj.skills.all(), many=True).data


class UserProfileUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating user profile."""
    
    class Meta:
        model = User
        fields = [
            'first_name', 'last_name', 'bio', 'avatar',
            'experience_level', 'target_role',
            'linkedin_url', 'github_url', 'portfolio_url',
            'preferred_domains'
        ]


class UserSkillSerializer(serializers.ModelSerializer):
    """Serializer for user skills."""
    
    class Meta:
        model = UserSkill
        fields = ['id', 'name', 'proficiency', 'created_at']
        read_only_fields = ['created_at']


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for password change."""
    
    old_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(
        required=True, 
        write_only=True,
        validators=[validate_password]
    )
    new_password_confirm = serializers.CharField(required=True, write_only=True)
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError({
                'new_password_confirm': "New passwords don't match."
            })
        return attrs
    
    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Current password is incorrect.")
        return value

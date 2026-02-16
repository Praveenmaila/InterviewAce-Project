"""
Serializers for resume management.
"""

from rest_framework import serializers
from .models import Resume, ResumeAnalysis, ResumeTemplate


class ResumeUploadSerializer(serializers.ModelSerializer):
    """Serializer for resume upload."""
    
    class Meta:
        model = Resume
        fields = ['file']
    
    def validate_file(self, value):
        # Check file size (max 10MB)
        if value.size > 10 * 1024 * 1024:
            raise serializers.ValidationError("File size must be under 10MB.")
        
        # Check file type
        allowed_types = ['application/pdf', 'application/msword',
                        'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
        
        if hasattr(value, 'content_type'):
            if value.content_type not in allowed_types:
                raise serializers.ValidationError(
                    "Only PDF and Word documents are allowed."
                )
        
        # Check extension
        ext = value.name.split('.')[-1].lower()
        if ext not in ['pdf', 'doc', 'docx']:
            raise serializers.ValidationError(
                "File must be a PDF or Word document."
            )
        
        return value


class ResumeSerializer(serializers.ModelSerializer):
    """Serializer for resume listing."""
    
    has_analysis = serializers.SerializerMethodField()
    
    class Meta:
        model = Resume
        fields = [
            'id', 'original_filename', 'file_type', 'file_size',
            'status', 'is_primary', 'has_analysis', 'created_at'
        ]
    
    def get_has_analysis(self, obj):
        return hasattr(obj, 'analysis')


class ResumeAnalysisSerializer(serializers.ModelSerializer):
    """Serializer for resume analysis results."""
    
    resume_info = serializers.SerializerMethodField()
    
    class Meta:
        model = ResumeAnalysis
        fields = [
            'id', 'resume_info',
            'overall_score', 'format_score', 'content_score',
            'keywords_score', 'impact_score',
            'extracted_skills', 'extracted_experience',
            'extracted_education', 'extracted_projects',
            'strengths', 'weaknesses', 'suggestions',
            'missing_sections', 'ats_score', 'ats_issues',
            'found_keywords', 'missing_keywords',
            'summary', 'created_at'
        ]
    
    def get_resume_info(self, obj):
        return {
            'id': obj.resume.id,
            'filename': obj.resume.original_filename,
            'uploaded_at': obj.resume.created_at
        }


class ResumeTemplateSerializer(serializers.ModelSerializer):
    """Serializer for resume templates."""
    
    class Meta:
        model = ResumeTemplate
        fields = [
            'id', 'name', 'description', 'preview_image',
            'target_audience', 'sections', 'tips',
            'is_premium'
        ]

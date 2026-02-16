"""
Views for resume management and analysis.
"""

from rest_framework import generics, status, permissions, parsers
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
import logging

from .models import Resume, ResumeAnalysis, ResumeTemplate
from .serializers import (
    ResumeUploadSerializer,
    ResumeSerializer,
    ResumeAnalysisSerializer,
    ResumeTemplateSerializer
)
from .services import ResumeAnalyzer
from .grok_service import grok_service
from .chatbot_service import chatbot_service

logger = logging.getLogger(__name__)


class ResumeUploadView(APIView):
    """Upload a new resume."""
    
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [parsers.MultiPartParser, parsers.FormParser]
    
    def post(self, request):
        serializer = ResumeUploadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        file = serializer.validated_data['file']
        
        # Create resume record
        resume = Resume.objects.create(
            user=request.user,
            file=file,
            original_filename=file.name,
            file_type=file.name.split('.')[-1].lower(),
            file_size=file.size,
            is_primary=not Resume.objects.filter(user=request.user).exists()
        )
        
        # Extract text and analyze
        try:
            text = self._extract_text(resume)
            resume.extracted_text = text
            resume.status = 'processing'
            resume.save()
            
            # Run AI analysis with Grok
            try:
                analysis_data = grok_service.analyze_resume(
                    text,
                    target_role=getattr(request.user, 'target_role', None)
                )
            except Exception as e:
                logger.warning(f"Grok analysis failed, using fallback: {str(e)}")
                analyzer = ResumeAnalyzer()
                analysis_data = analyzer.analyze(
                    text,
                    target_role=getattr(request.user, 'target_role', None)
                )
            
            # Save analysis
            ResumeAnalysis.objects.create(
                resume=resume,
                **analysis_data
            )
            
            resume.status = 'completed'
            resume.save()
            
        except Exception as e:
            resume.status = 'failed'
            resume.save()
            return Response({
                'error': f'Analysis failed: {str(e)}',
                'resume': ResumeSerializer(resume).data
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response({
            'message': 'Resume uploaded and analyzed successfully!',
            'resume': ResumeSerializer(resume).data
        }, status=status.HTTP_201_CREATED)
    
    def _extract_text(self, resume) -> str:
        """Extract text from uploaded resume file."""
        file_path = resume.file.path
        file_type = resume.file_type.lower()
        
        text = ""
        
        try:
            if file_type == 'pdf':
                text = self._extract_pdf(file_path)
            elif file_type in ['doc', 'docx']:
                text = self._extract_docx(file_path)
        except Exception as e:
            # Fallback: try to read as text
            try:
                with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                    text = f.read()
            except:
                text = ""
        
        return text
    
    def _extract_pdf(self, file_path: str) -> str:
        """Extract text from PDF file."""
        try:
            from PyPDF2 import PdfReader
            
            reader = PdfReader(file_path)
            text = ""
            for page in reader.pages:
                text += page.extract_text() + "\n"
            return text
        except ImportError:
            # PyPDF2 not installed, return empty
            return ""
        except Exception:
            return ""
    
    def _extract_docx(self, file_path: str) -> str:
        """Extract text from DOCX file."""
        try:
            from docx import Document
            
            doc = Document(file_path)
            text = ""
            for para in doc.paragraphs:
                text += para.text + "\n"
            return text
        except ImportError:
            return ""
        except Exception:
            return ""


class ResumeListView(generics.ListAPIView):
    """List user's uploaded resumes."""
    
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ResumeSerializer
    
    def get_queryset(self):
        return Resume.objects.filter(user=self.request.user)


class ResumeDetailView(generics.RetrieveDestroyAPIView):
    """Get or delete a specific resume."""
    
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ResumeSerializer
    
    def get_queryset(self):
        return Resume.objects.filter(user=self.request.user)


class ResumeAnalysisView(generics.RetrieveAPIView):
    """Get analysis for a specific resume."""
    
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ResumeAnalysisSerializer
    lookup_url_kwarg = 'resume_id'
    
    def get_object(self):
        resume_id = self.kwargs.get('resume_id')
        resume = get_object_or_404(
            Resume,
            id=resume_id,
            user=self.request.user
        )
        
        analysis = get_object_or_404(ResumeAnalysis, resume=resume)
        return analysis


class SetPrimaryResumeView(APIView):
    """Set a resume as the primary resume."""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, pk):
        resume = get_object_or_404(
            Resume,
            id=pk,
            user=request.user
        )
        
        # Clear other primary flags
        Resume.objects.filter(
            user=request.user,
            is_primary=True
        ).update(is_primary=False)
        
        # Set this as primary
        resume.is_primary = True
        resume.save()
        
        return Response({
            'message': 'Primary resume updated successfully!',
            'resume': ResumeSerializer(resume).data
        })


class ReanalyzeResumeView(APIView):
    """Re-run analysis on an existing resume."""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, pk):
        resume = get_object_or_404(
            Resume,
            id=pk,
            user=request.user
        )
        
        if not resume.extracted_text:
            return Response({
                'error': 'No text content available for analysis.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Delete existing analysis
        ResumeAnalysis.objects.filter(resume=resume).delete()
        
        # Run AI analysis with Grok
        try:
            analysis_data = grok_service.analyze_resume(
                resume.extracted_text,
                target_role=getattr(request.user, 'target_role', None)
            )
        except Exception as e:
            logger.warning(f"Grok analysis failed, using fallback: {str(e)}")
            analyzer = ResumeAnalyzer()
            analysis_data = analyzer.analyze(
                resume.extracted_text,
                target_role=getattr(request.user, 'target_role', None)
            )
        
        analysis = ResumeAnalysis.objects.create(
            resume=resume,
            **analysis_data
        )
        
        return Response({
            'message': 'Resume re-analyzed successfully!',
            'analysis': ResumeAnalysisSerializer(analysis).data
        })


class ResumeTemplateListView(generics.ListAPIView):
    """List available resume templates."""
    
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ResumeTemplateSerializer
    
    def get_queryset(self):
        queryset = ResumeTemplate.objects.filter(is_active=True)
        
        # Filter by target audience
        target = self.request.query_params.get('target')
        if target:
            queryset = queryset.filter(target_audience=target)
        
        # Exclude premium if needed
        exclude_premium = self.request.query_params.get('free_only')
        if exclude_premium == 'true':
            queryset = queryset.filter(is_premium=False)
        
        return queryset


class ResumeCompareView(APIView):
    """Compare two resumes."""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        resume_ids = request.query_params.getlist('ids')
        
        if len(resume_ids) != 2:
            return Response({
                'error': 'Please provide exactly 2 resume IDs to compare.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        resumes = Resume.objects.filter(
            id__in=resume_ids,
            user=request.user
        )
        
        if resumes.count() != 2:
            return Response({
                'error': 'One or both resumes not found.'
            }, status=status.HTTP_404_NOT_FOUND)
        
        analyses = []
        for resume in resumes:
            try:
                analysis = resume.analysis
                analyses.append({
                    'resume_id': resume.id,
                    'filename': resume.original_filename,
                    'overall_score': analysis.overall_score,
                    'format_score': analysis.format_score,
                    'content_score': analysis.content_score,
                    'keywords_score': analysis.keywords_score,
                    'impact_score': analysis.impact_score,
                    'skills_count': len(analysis.extracted_skills),
                    'ats_score': analysis.ats_score
                })
            except ResumeAnalysis.DoesNotExist:
                analyses.append({
                    'resume_id': resume.id,
                    'filename': resume.original_filename,
                    'error': 'No analysis available'
                })
        
        return Response({
            'comparison': analyses
        })


class ChatbotView(APIView):
    """AI-powered technical chatbot using static responses."""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        message = request.data.get('message', '').strip()
        conversation_history = request.data.get('history', [])
        
        if not message:
            return Response({
                'error': 'Message is required.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if len(message) > 5000:
            return Response({
                'error': 'Message is too long. Maximum 5000 characters allowed.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            response = chatbot_service.chat(message, conversation_history)
            
            return Response({
                'response': response,
                'message': message
            })
            
        except Exception as e:
            logger.error(f"Chatbot error: {str(e)}")
            return Response({
                'error': 'Failed to process your request. Please try again.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


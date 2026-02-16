"""
Grok AI service for resume analysis and technical chatbot.
"""

import requests
import json
import logging
from typing import Dict, Any, List, Optional
from django.conf import settings

logger = logging.getLogger(__name__)


class GrokService:
    """
    Service for interacting with Grok API for resume analysis
    and technical question answering.
    """
    
    def __init__(self):
        self.api_key = settings.GROK_API_KEY
        self.api_url = settings.GROK_API_URL
        self.model = settings.GROK_MODEL
        self.headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {self.api_key}'
        }
    
    def _make_request(self, messages: List[Dict], max_tokens: int = 2000) -> Optional[str]:
        """Make a request to the Grok API."""
        try:
            payload = {
                'model': self.model,
                'messages': messages,
                'max_tokens': max_tokens,
                'temperature': 0.7
            }
            
            response = requests.post(
                self.api_url,
                headers=self.headers,
                json=payload,
                timeout=60
            )
            
            response.raise_for_status()
            result = response.json()
            
            if 'choices' in result and len(result['choices']) > 0:
                return result['choices'][0]['message']['content']
            
            return None
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Grok API request failed: {str(e)}")
            return None
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse Grok API response: {str(e)}")
            return None
    
    def analyze_resume(self, resume_text: str, target_role: str = None) -> Dict[str, Any]:
        """
        Analyze a resume using Grok AI.
        
        Args:
            resume_text: The extracted text from the resume
            target_role: Optional target job role
            
        Returns:
            Dictionary containing AI analysis results
        """
        role_context = f" for a {target_role} position" if target_role else ""
        
        prompt = f"""Analyze the following resume{role_context} and provide a comprehensive evaluation. 
Return your analysis as a valid JSON object with the following structure:
{{
    "overall_score": <number 0-100>,
    "format_score": <number 0-100>,
    "content_score": <number 0-100>,
    "keywords_score": <number 0-100>,
    "impact_score": <number 0-100>,
    "ats_score": <number 0-100>,
    "extracted_skills": ["skill1", "skill2", ...],
    "extracted_experience": ["experience1", "experience2", ...],
    "extracted_education": ["education1", "education2", ...],
    "extracted_projects": ["project1", "project2", ...],
    "strengths": ["strength1", "strength2", ...],
    "weaknesses": ["weakness1", "weakness2", ...],
    "suggestions": ["suggestion1", "suggestion2", ...],
    "missing_sections": ["section1", ...],
    "ats_issues": ["issue1", ...],
    "found_keywords": ["keyword1", "keyword2", ...],
    "missing_keywords": ["keyword1", ...],
    "summary": "Brief overall summary of the resume"
}}

Evaluation criteria:
- Format Score: Layout, structure, readability, proper sections
- Content Score: Quality of descriptions, achievements, quantifiable results
- Keywords Score: Relevant technical keywords, industry terms
- Impact Score: Action verbs, measurable achievements, results-oriented language
- ATS Score: ATS compatibility, proper formatting, no complex elements

Resume text:
{resume_text}

Return ONLY the JSON object, no additional text or markdown."""

        messages = [
            {
                'role': 'system',
                'content': 'You are an expert resume analyst and career coach. Analyze resumes thoroughly and provide actionable feedback. Always respond with valid JSON only.'
            },
            {
                'role': 'user',
                'content': prompt
            }
        ]
        
        response = self._make_request(messages, max_tokens=3000)
        
        if response:
            try:
                # Clean up the response - remove markdown code blocks if present
                cleaned = response.strip()
                if cleaned.startswith('```json'):
                    cleaned = cleaned[7:]
                if cleaned.startswith('```'):
                    cleaned = cleaned[3:]
                if cleaned.endswith('```'):
                    cleaned = cleaned[:-3]
                cleaned = cleaned.strip()
                
                analysis = json.loads(cleaned)
                return self._validate_analysis(analysis)
            except json.JSONDecodeError as e:
                logger.error(f"Failed to parse Grok analysis response: {str(e)}")
                return self._fallback_analysis(resume_text)
        
        return self._fallback_analysis(resume_text)
    
    def _validate_analysis(self, analysis: Dict) -> Dict[str, Any]:
        """Validate and clean up the analysis response."""
        defaults = {
            'overall_score': 50,
            'format_score': 50,
            'content_score': 50,
            'keywords_score': 50,
            'impact_score': 50,
            'ats_score': 50,
            'extracted_skills': [],
            'extracted_experience': [],
            'extracted_education': [],
            'extracted_projects': [],
            'strengths': [],
            'weaknesses': [],
            'suggestions': [],
            'missing_sections': [],
            'ats_issues': [],
            'found_keywords': [],
            'missing_keywords': [],
            'summary': 'Analysis completed.'
        }
        
        # Ensure all fields exist and have correct types
        for key, default_value in defaults.items():
            if key not in analysis:
                analysis[key] = default_value
            elif isinstance(default_value, list) and not isinstance(analysis[key], list):
                analysis[key] = [analysis[key]] if analysis[key] else []
            elif isinstance(default_value, (int, float)) and not isinstance(analysis[key], (int, float)):
                try:
                    analysis[key] = float(analysis[key])
                except (ValueError, TypeError):
                    analysis[key] = default_value
        
        # Ensure scores are within range
        score_fields = ['overall_score', 'format_score', 'content_score', 
                       'keywords_score', 'impact_score', 'ats_score']
        for field in score_fields:
            analysis[field] = max(0, min(100, float(analysis[field])))
        
        return analysis
    
    def _fallback_analysis(self, resume_text: str) -> Dict[str, Any]:
        """Provide a basic analysis if AI fails."""
        # Import the local analyzer as fallback
        from .services import ResumeAnalyzer
        analyzer = ResumeAnalyzer()
        return analyzer.analyze(resume_text)
    
    def chat(self, message: str, conversation_history: List[Dict] = None) -> str:
        """
        Handle technical question chat with Grok AI.
        
        Args:
            message: The user's question
            conversation_history: Previous messages in the conversation
            
        Returns:
            AI response string
        """
        system_prompt = """You are a helpful technical assistant specializing in:
- Programming languages (Python, JavaScript, Java, C++, etc.)
- Web development (React, Django, Node.js, etc.)
- Data structures and algorithms
- System design and architecture
- Database technologies
- Cloud services and DevOps
- Interview preparation and coding problems

Provide clear, concise, and accurate answers. Include code examples when helpful.
Format your responses using markdown for better readability.
If you're not sure about something, say so rather than making up information."""

        messages = [
            {
                'role': 'system',
                'content': system_prompt
            }
        ]
        
        # Add conversation history if provided
        if conversation_history:
            for msg in conversation_history[-10:]:  # Keep last 10 messages
                messages.append({
                    'role': msg.get('role', 'user'),
                    'content': msg.get('content', '')
                })
        
        # Add current message
        messages.append({
            'role': 'user',
            'content': message
        })
        
        response = self._make_request(messages, max_tokens=2000)
        
        if response:
            return response
        
        return "I apologize, but I'm having trouble processing your request right now. Please try again in a moment."


# Singleton instance
grok_service = GrokService()

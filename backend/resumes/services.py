"""
Resume analysis service.
Extracts and analyzes resume content.
"""

import re
from typing import Dict, List, Any


class ResumeAnalyzer:
    """
    AI-powered resume analyzer.
    Extracts information and provides improvement suggestions.
    """
    
    # Common resume sections
    SECTION_HEADERS = {
        'experience': ['experience', 'work experience', 'employment', 'work history', 'professional experience'],
        'education': ['education', 'academic', 'qualifications', 'academic background'],
        'skills': ['skills', 'technical skills', 'competencies', 'expertise', 'technologies'],
        'projects': ['projects', 'personal projects', 'academic projects', 'portfolio'],
        'certifications': ['certifications', 'certificates', 'credentials', 'licenses'],
        'summary': ['summary', 'objective', 'profile', 'about me', 'professional summary'],
        'contact': ['contact', 'contact information', 'personal information'],
        'achievements': ['achievements', 'accomplishments', 'awards', 'honors']
    }
    
    # Important keywords for tech resumes
    TECH_KEYWORDS = {
        'languages': ['python', 'javascript', 'java', 'c++', 'c#', 'typescript', 'go', 'rust', 'ruby', 'php', 'swift', 'kotlin'],
        'frameworks': ['react', 'angular', 'vue', 'django', 'flask', 'spring', 'node.js', 'express', 'next.js', 'fastapi'],
        'databases': ['mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch', 'sqlite', 'oracle', 'dynamodb'],
        'cloud': ['aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform', 'jenkins', 'ci/cd'],
        'tools': ['git', 'jira', 'confluence', 'slack', 'figma', 'postman', 'vs code'],
        'concepts': ['api', 'rest', 'graphql', 'microservices', 'agile', 'scrum', 'tdd', 'ci/cd', 'devops']
    }
    
    # Action verbs for impact
    ACTION_VERBS = [
        'achieved', 'built', 'created', 'designed', 'developed', 'engineered',
        'established', 'implemented', 'improved', 'increased', 'launched',
        'led', 'managed', 'optimized', 'reduced', 'resolved', 'spearheaded',
        'streamlined', 'transformed', 'architected', 'automated', 'collaborated'
    ]
    
    def __init__(self):
        self.min_resume_length = 200
        self.max_resume_length = 5000
    
    def analyze(self, text: str, target_role: str = None) -> Dict[str, Any]:
        """
        Analyze resume text and generate comprehensive feedback.
        
        Args:
            text: Extracted resume text
            target_role: Target job role (optional)
            
        Returns:
            Dictionary containing analysis results
        """
        if not text or len(text.strip()) < 50:
            return self._empty_analysis("Resume text is too short or empty.")
        
        text_lower = text.lower()
        
        # Extract information
        sections = self._identify_sections(text)
        skills = self._extract_skills(text_lower)
        experience = self._extract_experience(text)
        education = self._extract_education(text)
        
        # Calculate scores
        format_score = self._analyze_format(text, sections)
        content_score = self._analyze_content(text, sections)
        keywords_score = self._analyze_keywords(text_lower, skills)
        impact_score = self._analyze_impact(text_lower)
        
        overall_score = (
            format_score * 0.20 +
            content_score * 0.30 +
            keywords_score * 0.25 +
            impact_score * 0.25
        )
        
        # ATS compatibility
        ats_score, ats_issues = self._check_ats_compatibility(text)
        
        # Generate feedback
        strengths = self._identify_strengths(
            format_score, content_score, keywords_score, 
            impact_score, skills, sections
        )
        weaknesses = self._identify_weaknesses(
            format_score, content_score, keywords_score,
            impact_score, sections
        )
        suggestions = self._generate_suggestions(
            text, sections, skills, weaknesses
        )
        
        # Check missing sections
        missing = self._check_missing_sections(sections)
        
        # Missing keywords for target role
        missing_keywords = self._get_missing_keywords(text_lower, target_role)
        
        # Generate summary
        summary = self._generate_summary(overall_score, strengths, weaknesses)
        
        return {
            'overall_score': round(overall_score, 1),
            'format_score': round(format_score, 1),
            'content_score': round(content_score, 1),
            'keywords_score': round(keywords_score, 1),
            'impact_score': round(impact_score, 1),
            'extracted_skills': skills,
            'extracted_experience': experience,
            'extracted_education': education,
            'extracted_projects': [],  # Could be enhanced
            'strengths': strengths,
            'weaknesses': weaknesses,
            'suggestions': suggestions,
            'missing_sections': missing,
            'ats_score': round(ats_score, 1),
            'ats_issues': ats_issues,
            'found_keywords': list(skills),
            'missing_keywords': missing_keywords,
            'summary': summary
        }
    
    def _identify_sections(self, text: str) -> Dict[str, bool]:
        """Identify which sections are present in the resume."""
        text_lower = text.lower()
        found_sections = {}
        
        for section, headers in self.SECTION_HEADERS.items():
            found_sections[section] = any(
                header in text_lower for header in headers
            )
        
        return found_sections
    
    def _extract_skills(self, text: str) -> List[str]:
        """Extract technical skills from resume."""
        found_skills = set()
        
        for category, keywords in self.TECH_KEYWORDS.items():
            for keyword in keywords:
                if keyword in text:
                    found_skills.add(keyword.title() if len(keyword) > 3 else keyword.upper())
        
        return list(found_skills)
    
    def _extract_experience(self, text: str) -> List[Dict]:
        """Extract work experience entries."""
        experience = []
        
        # Look for patterns like "Company Name | Role | Date"
        # or date ranges like "2020 - 2023" or "Jan 2020 - Present"
        date_pattern = r'\b(20\d{2})\s*[-–]\s*(20\d{2}|present|current)\b'
        
        date_matches = re.findall(date_pattern, text.lower())
        
        for match in date_matches[:5]:  # Limit to 5 entries
            experience.append({
                'period': f"{match[0]} - {match[1].title()}",
                'extracted': True
            })
        
        return experience
    
    def _extract_education(self, text: str) -> List[Dict]:
        """Extract education information."""
        education = []
        
        # Common degree patterns
        degree_patterns = [
            r"(bachelor'?s?|b\.?s\.?|b\.?a\.?|b\.?tech)",
            r"(master'?s?|m\.?s\.?|m\.?a\.?|m\.?tech|mba)",
            r"(ph\.?d\.?|doctorate)",
            r"(associate'?s?|a\.?s\.?|a\.?a\.?)"
        ]
        
        text_lower = text.lower()
        for pattern in degree_patterns:
            if re.search(pattern, text_lower):
                education.append({
                    'type': pattern.replace('|', '/').replace('?', ''),
                    'found': True
                })
        
        return education
    
    def _analyze_format(self, text: str, sections: Dict) -> float:
        """Analyze resume formatting."""
        score = 70.0  # Base score
        
        # Check length
        word_count = len(text.split())
        if word_count < self.min_resume_length:
            score -= 20
        elif word_count > self.max_resume_length:
            score -= 10
        elif self.min_resume_length * 2 <= word_count <= self.max_resume_length:
            score += 10
        
        # Check for proper sections
        essential_sections = ['experience', 'education', 'skills']
        for section in essential_sections:
            if sections.get(section):
                score += 5
        
        # Check for contact info patterns
        if re.search(r'[\w\.-]+@[\w\.-]+\.\w+', text):
            score += 5
        if re.search(r'\b\d{10}\b|\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b', text):
            score += 5
        
        # Check for LinkedIn
        if 'linkedin' in text.lower():
            score += 5
        
        return max(0, min(100, score))
    
    def _analyze_content(self, text: str, sections: Dict) -> float:
        """Analyze resume content quality."""
        score = 60.0
        
        # Check for quantifiable achievements
        numbers = re.findall(r'\b\d+[%$]|\d+\+?\s*(users|customers|projects|years)', text.lower())
        score += min(len(numbers) * 5, 20)
        
        # Check for action verbs
        text_lower = text.lower()
        action_count = sum(1 for verb in self.ACTION_VERBS if verb in text_lower)
        score += min(action_count * 2, 15)
        
        # Check for proper section coverage
        if sections.get('summary'):
            score += 5
        if sections.get('achievements'):
            score += 5
        
        return max(0, min(100, score))
    
    def _analyze_keywords(self, text: str, skills: List[str]) -> float:
        """Analyze keyword optimization."""
        score = 50.0
        
        # More skills = better
        skill_count = len(skills)
        score += min(skill_count * 3, 30)
        
        # Check for variety in skill categories
        categories_covered = 0
        for category, keywords in self.TECH_KEYWORDS.items():
            if any(kw in text for kw in keywords):
                categories_covered += 1
        
        score += categories_covered * 4
        
        return max(0, min(100, score))
    
    def _analyze_impact(self, text: str) -> float:
        """Analyze the impact/achievement focus of the resume."""
        score = 50.0
        
        # Count action verbs
        action_count = sum(1 for verb in self.ACTION_VERBS if verb in text)
        score += min(action_count * 3, 25)
        
        # Count metrics/numbers
        metrics = re.findall(r'\b\d+[%$]|\d+x\b|\d+\+', text)
        score += min(len(metrics) * 5, 25)
        
        return max(0, min(100, score))
    
    def _check_ats_compatibility(self, text: str) -> tuple:
        """Check ATS (Applicant Tracking System) compatibility."""
        score = 80.0
        issues = []
        
        # Check for common ATS issues
        
        # Tables/graphics (can't detect in text, but check for weird formatting)
        if re.search(r'\|{2,}|_{5,}|={5,}', text):
            score -= 10
            issues.append("Possible table or graphic elements detected - may not parse correctly")
        
        # Headers/footers (text at very start/end that's not content)
        lines = text.strip().split('\n')
        if len(lines) > 0 and len(lines[0].split()) < 3:
            # Might be a header
            pass
        
        # Check for standard section headers
        text_lower = text.lower()
        standard_headers = ['experience', 'education', 'skills']
        missing_standard = [h for h in standard_headers if h not in text_lower]
        
        if missing_standard:
            score -= len(missing_standard) * 5
            issues.append(f"Consider using standard headers: {', '.join(missing_standard)}")
        
        # Check for contact info
        if not re.search(r'[\w\.-]+@[\w\.-]+\.\w+', text):
            score -= 10
            issues.append("Email address not detected")
        
        # Check for unusual characters
        unusual = re.findall(r'[^\w\s\.\,\;\:\!\?\@\#\$\%\^\&\*\(\)\-\+\=\'\"\/\\]', text)
        if len(unusual) > 10:
            score -= 10
            issues.append("Contains special characters that may cause parsing issues")
        
        return max(0, min(100, score)), issues
    
    def _identify_strengths(
        self, format_score, content_score, keywords_score,
        impact_score, skills, sections
    ) -> List[str]:
        """Identify resume strengths."""
        strengths = []
        
        if format_score >= 80:
            strengths.append("Well-organized and properly formatted")
        
        if content_score >= 80:
            strengths.append("Strong content with quantifiable achievements")
        
        if keywords_score >= 80:
            strengths.append("Excellent keyword optimization")
        
        if impact_score >= 80:
            strengths.append("Achievement-focused with strong action verbs")
        
        if len(skills) >= 10:
            strengths.append(f"Comprehensive skill set ({len(skills)} technical skills)")
        
        if sections.get('projects'):
            strengths.append("Includes project portfolio")
        
        if sections.get('certifications'):
            strengths.append("Professional certifications highlighted")
        
        return strengths[:5]
    
    def _identify_weaknesses(
        self, format_score, content_score, keywords_score,
        impact_score, sections
    ) -> List[str]:
        """Identify areas for improvement."""
        weaknesses = []
        
        if format_score < 60:
            weaknesses.append("Formatting needs improvement")
        
        if content_score < 60:
            weaknesses.append("Add more quantifiable achievements")
        
        if keywords_score < 60:
            weaknesses.append("Increase relevant technical keywords")
        
        if impact_score < 60:
            weaknesses.append("Use more action verbs to describe accomplishments")
        
        if not sections.get('summary'):
            weaknesses.append("Missing professional summary section")
        
        if not sections.get('projects'):
            weaknesses.append("Consider adding a projects section")
        
        return weaknesses[:5]
    
    def _generate_suggestions(
        self, text, sections, skills, weaknesses
    ) -> List[str]:
        """Generate actionable improvement suggestions."""
        suggestions = []
        
        word_count = len(text.split())
        
        if word_count < 300:
            suggestions.append(
                "Expand your resume with more details about your experiences, "
                "projects, and achievements. Aim for 400-800 words."
            )
        elif word_count > 1500:
            suggestions.append(
                "Consider condensing your resume. Focus on the most relevant "
                "and recent experiences. Aim for 1-2 pages maximum."
            )
        
        if len(skills) < 5:
            suggestions.append(
                "Add more technical skills. Include programming languages, "
                "frameworks, tools, and technologies you've worked with."
            )
        
        if not sections.get('summary'):
            suggestions.append(
                "Add a professional summary at the top. Write 2-3 sentences "
                "highlighting your experience level, key skills, and career goals."
            )
        
        # Check for metrics
        if not re.search(r'\d+%|\d+\+|\$\d+', text):
            suggestions.append(
                "Quantify your achievements with numbers. For example: "
                "'Improved performance by 30%' or 'Managed team of 5 developers'"
            )
        
        if not sections.get('projects'):
            suggestions.append(
                "Add a Projects section showcasing personal or academic projects. "
                "Include technologies used and your contributions."
            )
        
        if 'github' not in text.lower():
            suggestions.append(
                "Consider adding your GitHub profile link to showcase your code "
                "and open-source contributions."
            )
        
        return suggestions[:6]
    
    def _check_missing_sections(self, sections: Dict) -> List[str]:
        """Check for important missing sections."""
        essential = ['experience', 'education', 'skills']
        recommended = ['summary', 'projects']
        
        missing = []
        
        for section in essential:
            if not sections.get(section):
                missing.append(f"{section.title()} (Essential)")
        
        for section in recommended:
            if not sections.get(section):
                missing.append(f"{section.title()} (Recommended)")
        
        return missing
    
    def _get_missing_keywords(self, text: str, target_role: str = None) -> List[str]:
        """Get keywords that should be added based on target role."""
        missing = []
        
        # Common important keywords
        important = ['problem-solving', 'teamwork', 'communication', 'leadership']
        
        for kw in important:
            if kw not in text:
                missing.append(kw.title())
        
        # If technical role, check for common tech keywords
        if target_role:
            role_lower = target_role.lower()
            
            if 'frontend' in role_lower or 'react' in role_lower:
                frontend_kw = ['responsive', 'ui/ux', 'html', 'css', 'javascript']
                for kw in frontend_kw:
                    if kw not in text:
                        missing.append(kw.upper() if len(kw) <= 4 else kw.title())
            
            if 'backend' in role_lower or 'django' in role_lower:
                backend_kw = ['api', 'database', 'rest', 'sql']
                for kw in backend_kw:
                    if kw not in text:
                        missing.append(kw.upper())
        
        return missing[:8]
    
    def _generate_summary(
        self, overall_score: float, 
        strengths: List[str], 
        weaknesses: List[str]
    ) -> str:
        """Generate an analysis summary."""
        
        if overall_score >= 85:
            rating = "excellent"
            message = "Your resume is well-crafted and should perform well with recruiters and ATS systems."
        elif overall_score >= 70:
            rating = "good"
            message = "Your resume is solid but has room for improvement in a few areas."
        elif overall_score >= 55:
            rating = "fair"
            message = "Your resume needs some work to stand out to recruiters."
        else:
            rating = "needs improvement"
            message = "Your resume requires significant improvements to be competitive."
        
        summary = f"Overall, your resume is {rating} with a score of {round(overall_score)}%. {message}"
        
        if strengths:
            summary += f" Key strength: {strengths[0].lower()}."
        
        if weaknesses:
            summary += f" Priority improvement: {weaknesses[0].lower()}."
        
        return summary
    
    def _empty_analysis(self, message: str) -> Dict[str, Any]:
        """Return empty analysis with error message."""
        return {
            'overall_score': 0,
            'format_score': 0,
            'content_score': 0,
            'keywords_score': 0,
            'impact_score': 0,
            'extracted_skills': [],
            'extracted_experience': [],
            'extracted_education': [],
            'extracted_projects': [],
            'strengths': [],
            'weaknesses': [message],
            'suggestions': ['Please upload a complete resume for analysis.'],
            'missing_sections': [],
            'ats_score': 0,
            'ats_issues': [message],
            'found_keywords': [],
            'missing_keywords': [],
            'summary': message
        }

"""
AI-powered feedback engine for analyzing interview responses.
Uses NLP techniques for comprehensive evaluation.
"""

import re
import string
from typing import Dict, List, Any


class FeedbackEngine:
    """
    AI-powered feedback engine that analyzes interview responses.
    Provides scores for clarity, relevance, grammar, and keyword matching.
    """
    
    # Common filler words that reduce clarity
    FILLER_WORDS = [
        'um', 'uh', 'like', 'you know', 'basically', 'actually',
        'literally', 'honestly', 'obviously', 'really', 'very',
        'just', 'kind of', 'sort of', 'i mean', 'well'
    ]
    
    # Positive communication indicators
    STRUCTURE_INDICATORS = [
        'firstly', 'secondly', 'thirdly', 'finally',
        'first', 'second', 'third', 'next', 'then', 'lastly',
        'in addition', 'moreover', 'furthermore', 'however',
        'for example', 'for instance', 'specifically',
        'in conclusion', 'to summarize', 'in summary',
        'the reason is', 'because', 'therefore', 'as a result'
    ]
    
    # Technical communication markers
    TECHNICAL_MARKERS = [
        'implementation', 'architecture', 'design pattern',
        'algorithm', 'complexity', 'optimization', 'scalability',
        'performance', 'security', 'testing', 'debugging',
        'database', 'api', 'framework', 'library'
    ]
    
    def __init__(self):
        self.min_response_words = 20
        self.ideal_response_words = 100
        self.max_response_words = 500
    
    def analyze_response(self, response) -> Dict[str, Any]:
        """
        Analyze a session response and generate comprehensive feedback.
        
        Args:
            response: SessionResponse object
            
        Returns:
            Dictionary containing scores and feedback
        """
        answer_text = response.answer_text.strip()
        question = response.question
        
        # Calculate individual scores
        clarity_score = self._analyze_clarity(answer_text)
        grammar_score = self._analyze_grammar(answer_text)
        relevance_score = self._analyze_relevance(
            answer_text, 
            question.text,
            question.expected_keywords
        )
        keyword_score = self._analyze_keywords(
            answer_text,
            question.expected_keywords
        )
        
        # Calculate overall score (weighted average)
        overall_score = (
            clarity_score * 0.25 +
            grammar_score * 0.20 +
            relevance_score * 0.30 +
            keyword_score * 0.25
        )
        
        # Generate strengths and improvements
        strengths = self._identify_strengths(
            answer_text, clarity_score, grammar_score, 
            relevance_score, keyword_score
        )
        improvements = self._identify_improvements(
            answer_text, question, clarity_score, 
            grammar_score, relevance_score, keyword_score
        )
        
        # Generate feedback text
        feedback_text = self._generate_feedback_text(
            overall_score, strengths, improvements
        )
        
        return {
            'overall_score': round(overall_score, 1),
            'clarity_score': round(clarity_score, 1),
            'grammar_score': round(grammar_score, 1),
            'relevance_score': round(relevance_score, 1),
            'keyword_score': round(keyword_score, 1),
            'feedback_text': feedback_text,
            'strengths': strengths,
            'improvements': improvements
        }
    
    def _analyze_clarity(self, text: str) -> float:
        """Analyze the clarity of the response."""
        if not text:
            return 0.0
        
        words = text.lower().split()
        word_count = len(words)
        
        score = 100.0
        
        # Penalize too short responses
        if word_count < self.min_response_words:
            score -= (self.min_response_words - word_count) * 2
        
        # Penalize too long responses
        if word_count > self.max_response_words:
            score -= (word_count - self.max_response_words) * 0.1
        
        # Check for filler words
        filler_count = sum(
            text.lower().count(filler) 
            for filler in self.FILLER_WORDS
        )
        score -= filler_count * 3
        
        # Reward structured responses
        structure_count = sum(
            1 for indicator in self.STRUCTURE_INDICATORS
            if indicator in text.lower()
        )
        score += min(structure_count * 5, 20)
        
        # Check sentence variety (average sentence length)
        sentences = re.split(r'[.!?]+', text)
        sentences = [s.strip() for s in sentences if s.strip()]
        
        if sentences:
            avg_sentence_length = word_count / len(sentences)
            # Ideal sentence length is 15-25 words
            if 15 <= avg_sentence_length <= 25:
                score += 10
            elif avg_sentence_length < 8 or avg_sentence_length > 40:
                score -= 10
        
        return max(0, min(100, score))
    
    def _analyze_grammar(self, text: str) -> float:
        """Analyze grammar quality of the response."""
        if not text:
            return 0.0
        
        score = 100.0
        
        # Check for basic grammar issues
        # Starting sentences with lowercase
        sentences = re.split(r'[.!?]+', text)
        for sentence in sentences:
            sentence = sentence.strip()
            if sentence and sentence[0].islower():
                score -= 2
        
        # Check for repeated words
        words = text.lower().split()
        for i in range(len(words) - 1):
            if words[i] == words[i + 1] and words[i] not in ['the', 'a', 'an', 'is', 'are']:
                score -= 3
        
        # Check for proper punctuation
        if not text.strip().endswith(('.', '!', '?')):
            score -= 5
        
        # Check for common contractions usage (professional writing)
        contractions = ["don't", "can't", "won't", "isn't", "aren't", "didn't"]
        contraction_count = sum(1 for c in contractions if c in text.lower())
        # Slight penalty for too many contractions in professional context
        if contraction_count > 3:
            score -= (contraction_count - 3) * 2
        
        # Reward proper capitalization of 'I'
        if ' i ' in text.lower() or text.lower().startswith('i '):
            i_count = text.count(' i ') + (1 if text.startswith('i ') else 0)
            proper_i = text.count(' I ') + (1 if text.startswith('I ') else 0)
            if i_count > proper_i:
                score -= (i_count - proper_i) * 3
        
        return max(0, min(100, score))
    
    def _analyze_relevance(
        self, 
        answer: str, 
        question: str,
        expected_keywords: List[str]
    ) -> float:
        """Analyze how relevant the answer is to the question."""
        if not answer:
            return 0.0
        
        score = 60.0  # Base score
        
        answer_lower = answer.lower()
        question_lower = question.lower()
        
        # Extract key terms from question
        question_words = set(
            word.strip(string.punctuation) 
            for word in question_lower.split()
            if len(word) > 3 and word not in ['what', 'how', 'why', 'when', 'where', 'which', 'would', 'could', 'should', 'your', 'the', 'and', 'for', 'with', 'this', 'that']
        )
        
        # Check how many question terms appear in answer
        matching_terms = sum(
            1 for term in question_words 
            if term in answer_lower
        )
        
        if question_words:
            relevance_ratio = matching_terms / len(question_words)
            score += relevance_ratio * 20
        
        # Check for expected keywords
        if expected_keywords:
            keyword_matches = sum(
                1 for kw in expected_keywords
                if kw.lower() in answer_lower
            )
            keyword_ratio = keyword_matches / len(expected_keywords)
            score += keyword_ratio * 20
        
        return max(0, min(100, score))
    
    def _analyze_keywords(
        self, 
        answer: str, 
        expected_keywords: List[str]
    ) -> float:
        """Analyze keyword coverage in the answer."""
        if not expected_keywords:
            return 75.0  # Default score if no keywords defined
        
        if not answer:
            return 0.0
        
        answer_lower = answer.lower()
        
        # Count matched keywords
        matched = sum(
            1 for keyword in expected_keywords
            if keyword.lower() in answer_lower
        )
        
        # Calculate coverage percentage
        coverage = (matched / len(expected_keywords)) * 100
        
        # Also reward technical terminology usage
        tech_term_count = sum(
            1 for term in self.TECHNICAL_MARKERS
            if term in answer_lower
        )
        
        bonus = min(tech_term_count * 3, 15)
        
        return min(100, coverage + bonus)
    
    def _identify_strengths(
        self,
        text: str,
        clarity: float,
        grammar: float,
        relevance: float,
        keywords: float
    ) -> List[str]:
        """Identify strengths in the response."""
        strengths = []
        
        if clarity >= 80:
            strengths.append("Clear and well-structured response")
        elif clarity >= 70:
            strengths.append("Good clarity in communication")
        
        if grammar >= 85:
            strengths.append("Excellent grammar and professional tone")
        elif grammar >= 75:
            strengths.append("Good grammatical accuracy")
        
        if relevance >= 80:
            strengths.append("Highly relevant and on-topic answer")
        elif relevance >= 70:
            strengths.append("Good understanding of the question")
        
        if keywords >= 80:
            strengths.append("Strong use of technical terminology")
        elif keywords >= 70:
            strengths.append("Good coverage of key concepts")
        
        # Check for specific patterns
        text_lower = text.lower()
        
        if any(ind in text_lower for ind in ['for example', 'for instance', 'such as']):
            strengths.append("Good use of examples")
        
        if any(ind in text_lower for ind in ['firstly', 'secondly', 'first', 'next', 'finally']):
            strengths.append("Well-organized with clear structure")
        
        # Limit to top 4 strengths
        return strengths[:4]
    
    def _identify_improvements(
        self,
        text: str,
        question,
        clarity: float,
        grammar: float,
        relevance: float,
        keywords: float
    ) -> List[str]:
        """Identify areas for improvement."""
        improvements = []
        
        word_count = len(text.split())
        
        if word_count < self.min_response_words:
            improvements.append("Expand your answer with more detail and examples")
        elif word_count > self.max_response_words:
            improvements.append("Be more concise - focus on key points")
        
        if clarity < 60:
            improvements.append("Improve clarity by using structured points")
        elif clarity < 75:
            improvements.append("Reduce filler words for better clarity")
        
        if grammar < 70:
            improvements.append("Review grammar and sentence structure")
        elif grammar < 80:
            improvements.append("Pay attention to punctuation and capitalization")
        
        if relevance < 60:
            improvements.append("Focus more on answering the specific question asked")
        elif relevance < 75:
            improvements.append("Address all aspects of the question")
        
        if keywords < 60:
            improvements.append("Include more relevant technical terms and concepts")
        elif keywords < 75:
            if question.expected_keywords:
                missing = [
                    kw for kw in question.expected_keywords 
                    if kw.lower() not in text.lower()
                ][:3]
                if missing:
                    improvements.append(f"Consider mentioning: {', '.join(missing)}")
        
        # Check for missing examples
        text_lower = text.lower()
        if not any(ind in text_lower for ind in ['for example', 'for instance', 'such as']):
            improvements.append("Add concrete examples to strengthen your answer")
        
        # Limit to top 4 improvements
        return improvements[:4]
    
    def _generate_feedback_text(
        self,
        overall_score: float,
        strengths: List[str],
        improvements: List[str]
    ) -> str:
        """Generate a natural feedback message."""
        
        # Determine performance level
        if overall_score >= 85:
            intro = "Excellent response! You demonstrated strong communication skills."
        elif overall_score >= 70:
            intro = "Good answer! You covered the main points well."
        elif overall_score >= 55:
            intro = "Decent attempt. There's room for improvement in your response."
        else:
            intro = "This response needs more work. Let's focus on key areas."
        
        feedback_parts = [intro]
        
        if strengths:
            feedback_parts.append(f"Strengths: {strengths[0]}.")
        
        if improvements:
            feedback_parts.append(f"Suggestion: {improvements[0]}.")
        
        return " ".join(feedback_parts)
    
    def generate_session_feedback(self, session) -> Dict[str, Any]:
        """Generate overall feedback for a completed session."""
        responses = session.responses.all()
        
        if not responses:
            return {
                'overall_score': 0,
                'summary': 'No responses recorded for this session.',
                'key_strengths': [],
                'areas_to_improve': [],
                'recommendations': []
            }
        
        # Calculate aggregate scores
        scores = {
            'overall': [],
            'clarity': [],
            'grammar': [],
            'relevance': [],
            'keyword': []
        }
        
        all_strengths = []
        all_improvements = []
        
        for response in responses:
            if response.score is not None:
                scores['overall'].append(response.score)
            if response.clarity_score is not None:
                scores['clarity'].append(response.clarity_score)
            if response.grammar_score is not None:
                scores['grammar'].append(response.grammar_score)
            if response.relevance_score is not None:
                scores['relevance'].append(response.relevance_score)
            if response.keyword_score is not None:
                scores['keyword'].append(response.keyword_score)
            
            all_strengths.extend(response.strengths)
            all_improvements.extend(response.improvements)
        
        # Calculate averages
        avg = lambda lst: sum(lst) / len(lst) if lst else 0
        
        overall_score = avg(scores['overall'])
        
        # Identify most common strengths and improvements
        strength_counts = {}
        for s in all_strengths:
            strength_counts[s] = strength_counts.get(s, 0) + 1
        
        improvement_counts = {}
        for i in all_improvements:
            improvement_counts[i] = improvement_counts.get(i, 0) + 1
        
        top_strengths = sorted(
            strength_counts.keys(), 
            key=lambda x: strength_counts[x], 
            reverse=True
        )[:5]
        
        top_improvements = sorted(
            improvement_counts.keys(),
            key=lambda x: improvement_counts[x],
            reverse=True
        )[:5]
        
        # Generate recommendations
        recommendations = self._generate_recommendations(
            overall_score,
            avg(scores['clarity']),
            avg(scores['grammar']),
            avg(scores['relevance']),
            avg(scores['keyword'])
        )
        
        # Generate summary
        summary = self._generate_session_summary(
            len(responses),
            overall_score,
            top_strengths,
            top_improvements
        )
        
        return {
            'overall_score': round(overall_score, 1),
            'communication_score': round(avg(scores['clarity']), 1),
            'technical_score': round(avg(scores['keyword']), 1),
            'confidence_score': round(
                (avg(scores['clarity']) + avg(scores['relevance'])) / 2, 1
            ),
            'summary': summary,
            'key_strengths': top_strengths,
            'areas_to_improve': top_improvements,
            'recommendations': recommendations,
            'category_scores': {
                'Clarity': round(avg(scores['clarity']), 1),
                'Grammar': round(avg(scores['grammar']), 1),
                'Relevance': round(avg(scores['relevance']), 1),
                'Technical Knowledge': round(avg(scores['keyword']), 1)
            }
        }
    
    def _generate_recommendations(
        self,
        overall: float,
        clarity: float,
        grammar: float,
        relevance: float,
        keywords: float
    ) -> List[str]:
        """Generate personalized recommendations."""
        recommendations = []
        
        if clarity < 70:
            recommendations.append(
                "Practice organizing your thoughts before speaking. "
                "Use the STAR method (Situation, Task, Action, Result) for behavioral questions."
            )
        
        if grammar < 70:
            recommendations.append(
                "Focus on speaking in complete sentences. "
                "Record yourself practicing and review for grammar improvements."
            )
        
        if relevance < 70:
            recommendations.append(
                "Carefully listen to each question and address all parts. "
                "Ask clarifying questions if needed before answering."
            )
        
        if keywords < 70:
            recommendations.append(
                "Review technical concepts in your domain. "
                "Make flashcards of key terms and practice incorporating them naturally."
            )
        
        if overall >= 80:
            recommendations.append(
                "Great job! To reach the next level, practice mock interviews with time constraints "
                "and work on handling unexpected follow-up questions."
            )
        elif overall >= 60:
            recommendations.append(
                "You're on the right track! Focus on providing more specific examples "
                "and quantifying your achievements when possible."
            )
        else:
            recommendations.append(
                "Start with simpler questions and gradually increase difficulty. "
                "Focus on one improvement area at a time for best results."
            )
        
        return recommendations[:4]
    
    def _generate_session_summary(
        self,
        question_count: int,
        overall_score: float,
        strengths: List[str],
        improvements: List[str]
    ) -> str:
        """Generate a summary paragraph for the session."""
        
        if overall_score >= 85:
            performance = "excellent"
            sentiment = "You demonstrated strong interview skills"
        elif overall_score >= 70:
            performance = "good"
            sentiment = "You showed solid understanding"
        elif overall_score >= 55:
            performance = "moderate"
            sentiment = "You have a foundation to build upon"
        else:
            performance = "needs improvement"
            sentiment = "There are several areas to focus on"
        
        summary = (
            f"You completed {question_count} questions with an overall score of "
            f"{round(overall_score)}%. Your performance was {performance}. {sentiment}. "
        )
        
        if strengths:
            summary += f"Key strength: {strengths[0].lower()}. "
        
        if improvements:
            summary += f"Primary focus area: {improvements[0].lower()}."
        
        return summary

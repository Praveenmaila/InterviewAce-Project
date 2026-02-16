import { useState, useRef } from 'react';
import {
  Upload,
  FileText,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Award,
  Target,
  Briefcase,
  GraduationCap,
  Code,
  ExternalLink,
  RefreshCw,
  Download,
  Zap,
  TrendingUp,
  List
} from 'lucide-react';
import { resumeService } from '../services/api';
import { LoadingSpinner, ProgressBar, Badge } from '../components/ui';
import toast from 'react-hot-toast';

export default function ResumeAnalyzer() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (selectedFile) => {
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    
    if (!allowedTypes.includes(selectedFile.type)) {
      toast.error('Please upload a PDF, DOC, DOCX, or TXT file');
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setFile(selectedFile);
    setAnalysis(null);
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file first');
      return;
    }

    try {
      setUploading(true);
      
      const result = await resumeService.upload(file);
      
      // Fetch the analysis
      const analysisData = await resumeService.getAnalysis(result.data.resume.id);
      setAnalysis(analysisData.data);
      toast.success('Resume analyzed successfully!');
    } catch (err) {
      toast.error('Failed to analyze resume');
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setAnalysis(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-500';
    return 'text-red-500';
  };

  const getScoreBg = (score) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    if (score >= 40) return 'bg-orange-100';
    return 'bg-red-100';
  };

  // Map API response to UI format
  const mockAnalysis = analysis ? {
    overall_score: analysis.overall_score || 0,
    ats_score: analysis.ats_score || 0,
    sections: {
      contact: !analysis.missing_sections?.includes('contact'),
      summary: !analysis.missing_sections?.includes('summary'),
      experience: !analysis.missing_sections?.includes('experience'),
      education: !analysis.missing_sections?.includes('education'),
      skills: !analysis.missing_sections?.includes('skills'),
      projects: !analysis.missing_sections?.includes('projects'),
      certifications: !analysis.missing_sections?.includes('certifications')
    },
    skills_found: analysis.extracted_skills || analysis.found_keywords || [],
    missing_skills: analysis.missing_keywords || [],
    keyword_density: Math.round((analysis.keywords_score || 0) / 10) / 10,
    word_count: analysis.summary?.split(' ').length * 50 || 400,
    experience_years: (analysis.extracted_experience || []).length || 1,
    strengths: analysis.strengths || [],
    improvements: [...(analysis.weaknesses || []), ...(analysis.suggestions || [])],
    formatting_issues: analysis.ats_issues || []
  } : {
    overall_score: 72,
    ats_score: 68,
    sections: {
      contact: true,
      summary: true,
      experience: true,
      education: true,
      skills: true,
      projects: false,
      certifications: false
    },
    skills_found: ['JavaScript', 'React', 'Python', 'Django', 'SQL', 'Git', 'REST APIs', 'Node.js'],
    missing_skills: ['TypeScript', 'AWS', 'Docker', 'CI/CD'],
    keyword_density: 3.2,
    word_count: 485,
    experience_years: 2,
    strengths: [
      'Clear contact information',
      'Well-structured experience section',
      'Good use of action verbs',
      'Quantified achievements present'
    ],
    improvements: [
      'Add a projects section to showcase practical work',
      'Include relevant certifications',
      'Add more industry-specific keywords',
      'Consider adding a professional summary',
      'Include links to portfolio or GitHub'
    ],
    formatting_issues: [
      'Inconsistent bullet point formatting',
      'Some dates are in different formats'
    ]
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Resume Analyzer</h1>
        <p className="text-gray-600">
          Get AI-powered feedback on your resume to improve your chances of landing interviews
        </p>
      </div>

      {/* Upload Section */}
      {!analysis && (
        <div className="bg-white rounded-xl border border-gray-200 p-8">
          <div
            className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
              dragActive 
                ? 'border-primary-500 bg-primary-50' 
                : file 
                  ? 'border-green-500 bg-green-50' 
                  : 'border-gray-300 hover:border-primary-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              onChange={handleChange}
              className="hidden"
              id="resume-upload"
            />
            
            {file ? (
              <div className="space-y-4">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                  <FileText className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{file.name}</p>
                  <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={handleReset}
                    className="btn btn-secondary"
                  >
                    Choose Different File
                  </button>
                  <button
                    onClick={handleUpload}
                    disabled={uploading}
                    className="btn btn-primary flex items-center gap-2"
                  >
                    {uploading ? (
                      <>
                        <LoadingSpinner size="sm" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Zap className="w-5 h-5" />
                        Analyze Resume
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <label htmlFor="resume-upload" className="cursor-pointer">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-lg font-medium text-gray-900 mb-2">
                  Drop your resume here, or click to browse
                </p>
                <p className="text-sm text-gray-500">
                  Supports PDF, DOC, DOCX, TXT (Max 5MB)
                </p>
              </label>
            )}
          </div>
        </div>
      )}

      {/* Analysis Results */}
      {analysis && (
        <>
          {/* Overall Score */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 text-primary-100 mb-2">
                  <Award className="w-5 h-5" />
                  <span>Resume Analysis Complete</span>
                </div>
                <h2 className="text-3xl font-bold mb-2">
                  {mockAnalysis.overall_score >= 80 
                    ? 'Great Resume!' 
                    : mockAnalysis.overall_score >= 60 
                      ? 'Good Foundation!' 
                      : 'Needs Improvement'}
                </h2>
                <p className="text-primary-100">
                  Your resume scored {mockAnalysis.overall_score}% overall with {mockAnalysis.ats_score}% ATS compatibility
                </p>
              </div>
              <div className="hidden md:flex items-center gap-6">
                <div className="text-center">
                  <div className="text-5xl font-bold">{mockAnalysis.overall_score}%</div>
                  <div className="text-primary-200 text-sm">Overall Score</div>
                </div>
                <div className="text-center">
                  <div className="text-5xl font-bold">{mockAnalysis.ats_score}%</div>
                  <div className="text-primary-200 text-sm">ATS Score</div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
              <div className="text-2xl font-bold text-gray-900">{mockAnalysis.word_count}</div>
              <div className="text-sm text-gray-600">Words</div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
              <div className="text-2xl font-bold text-gray-900">{mockAnalysis.skills_found.length}</div>
              <div className="text-sm text-gray-600">Skills Found</div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
              <div className="text-2xl font-bold text-gray-900">{mockAnalysis.experience_years}</div>
              <div className="text-sm text-gray-600">Years Experience</div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
              <div className="text-2xl font-bold text-gray-900">{mockAnalysis.keyword_density}%</div>
              <div className="text-sm text-gray-600">Keyword Density</div>
            </div>
          </div>

          {/* Sections Check */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <List className="w-5 h-5 text-primary-600" />
              Resume Sections
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(mockAnalysis.sections).map(([section, present]) => (
                <div
                  key={section}
                  className={`flex items-center gap-2 p-3 rounded-lg ${
                    present ? 'bg-green-50' : 'bg-red-50'
                  }`}
                >
                  {present ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                  <span className={`capitalize font-medium ${present ? 'text-green-700' : 'text-red-700'}`}>
                    {section.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Skills Analysis */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Code className="w-5 h-5 text-green-600" />
                Skills Found
              </h2>
              <div className="flex flex-wrap gap-2">
                {mockAnalysis.skills_found.map((skill) => (
                  <Badge key={skill} variant="success">{skill}</Badge>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                Suggested Skills to Add
              </h2>
              <div className="flex flex-wrap gap-2">
                {mockAnalysis.missing_skills.map((skill) => (
                  <Badge key={skill} variant="warning">{skill}</Badge>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-3">
                Adding these in-demand skills could improve your visibility to recruiters
              </p>
            </div>
          </div>

          {/* Strengths & Improvements */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-green-50 rounded-xl border border-green-200 p-6">
              <h2 className="text-lg font-semibold text-green-800 mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Strengths
              </h2>
              <ul className="space-y-3">
                {mockAnalysis.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start gap-2 text-green-700">
                    <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-6">
              <h2 className="text-lg font-semibold text-yellow-800 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Areas for Improvement
              </h2>
              <ul className="space-y-3">
                {mockAnalysis.improvements.map((improvement, index) => (
                  <li key={index} className="flex items-start gap-2 text-yellow-700">
                    <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{improvement}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Formatting Issues */}
          {mockAnalysis.formatting_issues.length > 0 && (
            <div className="bg-red-50 rounded-xl border border-red-200 p-6">
              <h2 className="text-lg font-semibold text-red-800 mb-4 flex items-center gap-2">
                <XCircle className="w-5 h-5" />
                Formatting Issues
              </h2>
              <ul className="space-y-2">
                {mockAnalysis.formatting_issues.map((issue, index) => (
                  <li key={index} className="flex items-start gap-2 text-red-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 flex-shrink-0" />
                    <span>{issue}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={handleReset} className="btn btn-secondary flex items-center justify-center gap-2">
              <RefreshCw className="w-5 h-5" />
              Analyze Another Resume
            </button>
          </div>

          {/* Tips */}
          <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-xl p-6 border border-primary-100">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary-600" />
              Pro Tips for a Better Resume
            </h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-2" />
                <span>Use action verbs like "developed", "implemented", "achieved"</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-2" />
                <span>Quantify achievements with numbers and percentages</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-2" />
                <span>Tailor your resume for each job application</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-2" />
                <span>Keep it concise - ideally 1-2 pages maximum</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-2" />
                <span>Use a clean, professional format with consistent styling</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-2" />
                <span>Include keywords from the job description</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

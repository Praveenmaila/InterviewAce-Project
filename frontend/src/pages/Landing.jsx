import { Link } from 'react-router-dom'
import { 
  Sparkles, 
  MessageSquare, 
  BarChart3, 
  FileText, 
  CheckCircle,
  ArrowRight,
  Users,
  Target,
  Zap
} from 'lucide-react'

const features = [
  {
    icon: MessageSquare,
    title: 'AI-Powered Mock Interviews',
    description: 'Practice with realistic interview questions tailored to your target role and experience level.'
  },
  {
    icon: Target,
    title: 'Adaptive Learning',
    description: 'Questions adjust based on your performance, ensuring you\'re always challenged appropriately.'
  },
  {
    icon: BarChart3,
    title: 'Detailed Analytics',
    description: 'Track your progress with comprehensive performance metrics and identify areas for improvement.'
  },
  {
    icon: FileText,
    title: 'Resume Analyzer',
    description: 'Get AI-powered suggestions to improve your resume and increase your chances of landing interviews.'
  },
  {
    icon: Zap,
    title: 'Instant Feedback',
    description: 'Receive real-time analysis of your answers including clarity, relevance, and keyword coverage.'
  },
  {
    icon: Users,
    title: 'Multiple Domains',
    description: 'Practice for HR, technical, and domain-specific interviews in React, Django, Java, and more.'
  },
]

const testimonials = [
  {
    quote: "InterviewAce helped me land my dream job at a top tech company. The feedback was incredibly detailed!",
    author: "Sarah K.",
    role: "Frontend Developer at Google"
  },
  {
    quote: "I went from failing interviews to receiving multiple offers. The adaptive questions really prepared me.",
    author: "Mike R.",
    role: "Software Engineer at Microsoft"
  },
  {
    quote: "The resume analyzer caught issues I never noticed. My callback rate doubled after making the changes.",
    author: "Priya M.",
    role: "Full Stack Developer at Stripe"
  },
]

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2">
              <Sparkles className="h-8 w-8 text-primary-600" />
              <span className="text-xl font-bold text-gradient">InterviewAce</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-gray-600 hover:text-gray-900 font-medium">
                Sign In
              </Link>
              <Link to="/register" className="btn-primary">
                Get Started Free
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" />
            AI-Powered Interview Preparation
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 tracking-tight">
            Ace Your Next
            <span className="block text-gradient">Job Interview</span>
          </h1>
          <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto">
            Practice with AI-powered mock interviews, get instant feedback on your answers, 
            and track your progress to become interview-ready in weeks, not months.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="btn-primary btn-lg">
              Start Free Practice
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link to="/login" className="btn-outline btn-lg">
              Watch Demo
            </Link>
          </div>
          <div className="mt-12 flex items-center justify-center gap-8 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              No credit card required
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              500+ practice questions
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Instant AI feedback
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Everything You Need to Succeed
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Our comprehensive platform covers all aspects of interview preparation
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card-hover">
                <div className="w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              How It Works
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Three simple steps to interview success
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary-600 text-white text-2xl font-bold flex items-center justify-center mx-auto mb-6">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Choose Your Interview
              </h3>
              <p className="text-gray-600">
                Select between HR or technical interviews, pick your domain, and set your difficulty level.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary-600 text-white text-2xl font-bold flex items-center justify-center mx-auto mb-6">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Practice & Answer
              </h3>
              <p className="text-gray-600">
                Respond to adaptive questions that adjust to your performance. Take your time to formulate thoughtful answers.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary-600 text-white text-2xl font-bold flex items-center justify-center mx-auto mb-6">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Get AI Feedback
              </h3>
              <p className="text-gray-600">
                Receive instant, detailed feedback on clarity, relevance, and areas for improvement.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Success Stories
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Join thousands who landed their dream jobs
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="card">
                <p className="text-gray-600 italic mb-6">"{testimonial.quote}"</p>
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.author}</p>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to Ace Your Interviews?
          </h2>
          <p className="text-xl text-primary-100 mb-10">
            Start practicing today and see improvement in your first session.
          </p>
          <Link to="/register" className="inline-flex items-center px-8 py-4 bg-white text-primary-600 font-semibold rounded-lg hover:bg-gray-50 transition-colors">
            Get Started Free
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Sparkles className="h-6 w-6 text-primary-500" />
              <span className="text-lg font-bold text-white">InterviewAce</span>
            </div>
            <div className="flex gap-8">
              <a href="#" className="hover:text-white transition-colors">About</a>
              <a href="#" className="hover:text-white transition-colors">Features</a>
              <a href="#" className="hover:text-white transition-colors">Pricing</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm">
            © 2026 InterviewAce. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}

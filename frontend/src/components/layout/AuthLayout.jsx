import { Outlet, Link } from 'react-router-dom'
import { Sparkles } from 'lucide-react'

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Logo */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2">
          <Sparkles className="h-10 w-10 text-primary-600" />
          <span className="text-2xl font-bold text-gradient">InterviewAce</span>
        </Link>
      </div>

      {/* Card */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-gray-200/50 sm:rounded-2xl sm:px-10 border border-gray-100">
          <Outlet />
        </div>
      </div>

      {/* Footer */}
      <p className="mt-8 text-center text-sm text-gray-500">
        © 2026 InterviewAce. Master your interview skills with AI.
      </p>
    </div>
  )
}

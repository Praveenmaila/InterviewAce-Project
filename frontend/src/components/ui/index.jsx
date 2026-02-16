import clsx from 'clsx'

export function ScoreGauge({ score, size = 'lg', label, showLabel = true }) {
  const radius = size === 'lg' ? 60 : size === 'md' ? 45 : 30
  const stroke = size === 'lg' ? 8 : size === 'md' ? 6 : 4
  const circumference = 2 * Math.PI * radius
  const progress = ((100 - score) / 100) * circumference

  const getColor = (score) => {
    if (score >= 80) return 'text-green-500'
    if (score >= 60) return 'text-yellow-500'
    if (score >= 40) return 'text-orange-500'
    return 'text-red-500'
  }

  const getStrokeColor = (score) => {
    if (score >= 80) return '#22c55e'
    if (score >= 60) return '#eab308'
    if (score >= 40) return '#f97316'
    return '#ef4444'
  }

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <svg
          className="transform -rotate-90"
          width={(radius + stroke) * 2}
          height={(radius + stroke) * 2}
        >
          {/* Background circle */}
          <circle
            cx={radius + stroke}
            cy={radius + stroke}
            r={radius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth={stroke}
          />
          {/* Progress circle */}
          <circle
            cx={radius + stroke}
            cy={radius + stroke}
            r={radius}
            fill="none"
            stroke={getStrokeColor(score)}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={progress}
            className="score-ring"
          />
        </svg>
        {/* Score text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={clsx(
            'font-bold',
            getColor(score),
            size === 'lg' ? 'text-3xl' : size === 'md' ? 'text-2xl' : 'text-lg'
          )}>
            {Math.round(score)}
          </span>
        </div>
      </div>
      {showLabel && label && (
        <p className="mt-2 text-sm text-gray-600 font-medium">{label}</p>
      )}
    </div>
  )
}

export function ProgressBar({ value, max = 100, label, showValue = true, color = 'primary' }) {
  const percentage = Math.min((value / max) * 100, 100)
  
  const colors = {
    primary: 'bg-primary-500',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    danger: 'bg-red-500',
  }

  return (
    <div className="w-full">
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && <span className="text-sm font-medium text-gray-700">{label}</span>}
          {showValue && <span className="text-sm text-gray-500">{Math.round(percentage)}%</span>}
        </div>
      )}
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={clsx('h-full rounded-full transition-all duration-500', colors[color])}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

export function StatCard({ title, value, subtitle, icon: Icon, trend, color = 'primary' }) {
  const colors = {
    primary: 'bg-primary-50 text-primary-600',
    success: 'bg-green-50 text-green-600',
    warning: 'bg-yellow-50 text-yellow-600',
    danger: 'bg-red-50 text-red-600',
    purple: 'bg-purple-50 text-purple-600',
  }

  return (
    <div className="card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">{value}</p>
          {subtitle && (
            <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
          )}
          {trend !== undefined && (
            <p className={clsx(
              'mt-2 text-sm font-medium',
              trend >= 0 ? 'text-green-600' : 'text-red-600'
            )}>
              {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% from last period
            </p>
          )}
        </div>
        {Icon && (
          <div className={clsx('p-3 rounded-lg', colors[color])}>
            <Icon className="h-6 w-6" />
          </div>
        )}
      </div>
    </div>
  )
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="text-center py-12">
      {Icon && (
        <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <Icon className="h-8 w-8 text-gray-400" />
        </div>
      )}
      <h3 className="text-lg font-medium text-gray-900">{title}</h3>
      {description && (
        <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">{description}</p>
      )}
      {action && (
        <div className="mt-6">{action}</div>
      )}
    </div>
  )
}

export function LoadingSpinner({ size = 'md' }) {
  const sizes = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-3',
    lg: 'h-12 w-12 border-4',
  }

  return (
    <div className={clsx(
      'animate-spin rounded-full border-primary-500 border-t-transparent',
      sizes[size]
    )} />
  )
}

export function Badge({ children, variant = 'default' }) {
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    primary: 'bg-primary-100 text-primary-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    easy: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    hard: 'bg-red-100 text-red-800',
  }

  return (
    <span className={clsx('badge', variants[variant])}>
      {children}
    </span>
  )
}

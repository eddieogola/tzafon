import { Calendar, FileText, Image, Activity, ChevronRight } from 'lucide-react';
import { TaskSummary } from '@/types';
import { VerificationStatus, VerificationStatusBadge } from './VerificationStatus';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/parseMarkdown';

interface TaskSummaryCardProps {
  task: TaskSummary;
  onClick?: () => void;
  selected?: boolean;
  className?: string;
}

export function TaskSummaryCard({
  task,
  onClick,
  selected = false,
  className,
}: TaskSummaryCardProps) {
  const completedSteps = task.taskSteps.filter(step => step.completed).length;
  const totalSteps = task.taskSteps.length;
  const completionPercentage = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

  return (
    <div
      onClick={onClick}
      className={cn(
        'group relative bg-white rounded-xl border shadow-sm transition-all duration-300 overflow-hidden',
        'hover:shadow-lg hover:border-gray-300 hover:-translate-y-1',
        onClick && 'cursor-pointer',
        selected && 'ring-2 ring-blue-500 border-blue-300 shadow-lg',
        'animate-slide-up',
        className
      )}
    >
      {/* Status Indicator Bar */}
      <div
        className={cn(
          'absolute top-0 left-0 right-0 h-1',
          task.verificationStatus === 'success' && 'bg-green-500',
          task.verificationStatus === 'failed' && 'bg-red-500',
          task.verificationStatus === 'warning' && 'bg-yellow-500',
          task.verificationStatus === 'inconclusive' && 'bg-gray-400'
        )}
      />

      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate mb-1">
              {task.id.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(task.date)}</span>
            </div>
          </div>
          <VerificationStatus status={task.verificationStatus} size="sm" />
        </div>

        {/* Progress Bar */}
        {totalSteps > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-700 font-medium">Task Progress</span>
              <span className="text-gray-600">
                {completedSteps}/{totalSteps} steps
              </span>
            </div>
            <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={cn(
                  'absolute inset-y-0 left-0 rounded-full transition-all duration-500',
                  task.verificationStatus === 'success' && 'bg-green-500',
                  task.verificationStatus === 'failed' && 'bg-red-500',
                  task.verificationStatus === 'warning' && 'bg-yellow-500',
                  task.verificationStatus === 'inconclusive' && 'bg-gray-400'
                )}
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
        )}

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
            <FileText className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="text-xs text-gray-500 mb-0.5">Instructions</div>
              <div className="text-sm text-gray-900 font-medium truncate">
                {task.instructionsFile.split('/').pop()}
              </div>
            </div>
          </div>
          <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
            <Activity className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="text-xs text-gray-500 mb-0.5">Events</div>
              <div className="text-sm text-gray-900 font-medium">
                {task.eventStats.totalEvents}
              </div>
            </div>
          </div>
        </div>

        {/* Task Steps Preview */}
        {totalSteps > 0 && (
          <div className="space-y-2 mb-4">
            {task.taskSteps.slice(0, 3).map((step, index) => (
              <div key={index} className="flex items-start gap-2 text-sm">
                <div
                  className={cn(
                    'mt-0.5 h-4 w-4 rounded-sm border flex items-center justify-center flex-shrink-0',
                    step.completed
                      ? 'bg-green-100 border-green-500 text-green-700'
                      : 'bg-gray-50 border-gray-300 text-gray-400'
                  )}
                >
                  {step.completed && (
                    <svg
                      className="h-3 w-3"
                      viewBox="0 0 12 12"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M2 6l3 3 5-6" />
                    </svg>
                  )}
                </div>
                <span className={cn(
                  'flex-1',
                  step.completed ? 'text-gray-700' : 'text-gray-500'
                )}>
                  {step.description}
                </span>
              </div>
            ))}
            {totalSteps > 3 && (
              <div className="text-xs text-gray-500 pl-6">
                +{totalSteps - 3} more steps
              </div>
            )}
          </div>
        )}

        {/* Status Badge */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <VerificationStatusBadge status={task.verificationStatus} />
          {onClick && (
            <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
          )}
        </div>
      </div>

      {/* Hover Effect Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent to-gray-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </div>
  );
}

export function TaskSummaryCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border shadow-sm p-6 animate-pulse">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1">
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-2" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
        </div>
        <div className="h-8 w-24 bg-gray-200 rounded-full" />
      </div>
      <div className="h-2 bg-gray-200 rounded-full mb-4" />
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="h-16 bg-gray-100 rounded-lg" />
        <div className="h-16 bg-gray-100 rounded-lg" />
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-5/6" />
        <div className="h-4 bg-gray-200 rounded w-4/6" />
      </div>
    </div>
  );
}

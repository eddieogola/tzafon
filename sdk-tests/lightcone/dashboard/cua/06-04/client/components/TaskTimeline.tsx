import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  MousePointer,
  Navigation,
  Eye,
  Clock,
  Activity
} from 'lucide-react';
import { TimelineEvent } from '@/types';
import { cn } from '@/lib/utils';

interface TaskTimelineProps {
  events: TimelineEvent[];
  className?: string;
}

const eventTypeConfig = {
  action: {
    icon: MousePointer,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-200',
  },
  navigation: {
    icon: Navigation,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    borderColor: 'border-purple-200',
  },
  verification: {
    icon: Eye,
    color: 'text-teal-600',
    bgColor: 'bg-teal-100',
    borderColor: 'border-teal-200',
  },
  error: {
    icon: XCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    borderColor: 'border-red-200',
  },
  completion: {
    icon: CheckCircle2,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-200',
  },
};

function formatTimestamp(timestamp: string): string {
  try {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch {
    return timestamp;
  }
}

export function TaskTimeline({ events, className }: TaskTimelineProps) {
  if (events.length === 0) {
    return (
      <div className={cn('bg-white rounded-xl border shadow-sm p-8', className)}>
        <div className="text-center text-gray-500">
          <Activity className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p className="text-sm">No timeline events available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('bg-white rounded-xl border shadow-sm p-6', className)}>
      <div className="flex items-center gap-2 mb-6">
        <Activity className="h-5 w-5 text-gray-700" />
        <h2 className="text-lg font-semibold text-gray-900">Task Timeline</h2>
        <span className="ml-auto text-sm text-gray-500">{events.length} events</span>
      </div>

      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" />

        {/* Timeline Events */}
        <div className="space-y-6">
          {events.map((event, index) => {
            const config = eventTypeConfig[event.type];
            const Icon = config.icon;
            const isLast = index === events.length - 1;

            return (
              <div
                key={event.id}
                className="relative pl-14 animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Icon Container */}
                <div
                  className={cn(
                    'absolute left-0 flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-200',
                    config.bgColor,
                    config.borderColor,
                    'hover:scale-110'
                  )}
                >
                  <Icon className={cn('h-5 w-5', config.color)} />
                </div>

                {/* Event Content */}
                <div
                  className={cn(
                    'bg-white border rounded-lg p-4 transition-all duration-200',
                    'hover:shadow-md hover:border-gray-300',
                    isLast && 'border-gray-300 shadow-sm'
                  )}
                >
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                          {event.type}
                        </span>
                        {event.status && (
                          <span
                            className={cn(
                              'px-2 py-0.5 rounded text-xs font-medium',
                              event.status === 'success' && 'bg-green-100 text-green-700',
                              event.status === 'failed' && 'bg-red-100 text-red-700',
                              event.status === 'warning' && 'bg-yellow-100 text-yellow-700'
                            )}
                          >
                            {event.status}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-900">{event.description}</p>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 flex-shrink-0">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{formatTimestamp(event.timestamp)}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function CompactTimeline({ events, maxEvents = 5 }: { events: TimelineEvent[]; maxEvents?: number }) {
  const displayEvents = events.slice(0, maxEvents);
  const hasMore = events.length > maxEvents;

  return (
    <div className="space-y-3">
      {displayEvents.map((event, index) => {
        const config = eventTypeConfig[event.type];
        const Icon = config.icon;

        return (
          <div key={event.id} className="flex items-start gap-3">
            <div
              className={cn(
                'flex items-center justify-center w-8 h-8 rounded-full border flex-shrink-0',
                config.bgColor,
                config.borderColor
              )}
            >
              <Icon className={cn('h-4 w-4', config.color)} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900 truncate">{event.description}</p>
              <p className="text-xs text-gray-500">{formatTimestamp(event.timestamp)}</p>
            </div>
          </div>
        );
      })}
      {hasMore && (
        <div className="text-xs text-gray-500 text-center pt-2">
          +{events.length - maxEvents} more events
        </div>
      )}
    </div>
  );
}

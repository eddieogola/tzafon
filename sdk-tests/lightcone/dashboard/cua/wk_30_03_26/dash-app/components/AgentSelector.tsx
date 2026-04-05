'use client';

import { useState } from 'react';
import { ChevronDown, Bot, Calendar, CheckCircle2, XCircle, Loader2, Search } from 'lucide-react';
import { TaskSummary } from '@/types';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/parseMarkdown';

interface AgentSelectorProps {
  tasks: TaskSummary[];
  selectedTask: TaskSummary | null;
  onSelectTask: (task: TaskSummary) => void;
  className?: string;
}

export function AgentSelector({
  tasks,
  selectedTask,
  onSelectTask,
  className,
}: AgentSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTasks = tasks.filter(task =>
    task.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.instructionsFile.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusIcon = (status: TaskSummary['verificationStatus']) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'warning':
        return <Loader2 className="h-4 w-4 text-yellow-600" />;
      default:
        return <Loader2 className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusCount = (status: TaskSummary['verificationStatus']) => {
    return tasks.filter(task => task.verificationStatus === status).length;
  };

  return (
    <div className={cn('relative', className)}>
      {/* Selector Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-full bg-white border rounded-xl p-4 flex items-center justify-between transition-all duration-200',
          'hover:border-gray-300 hover:shadow-md',
          isOpen && 'border-blue-300 shadow-lg ring-2 ring-blue-100'
        )}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Bot className="h-5 w-5 text-white" />
          </div>
          {selectedTask ? (
            <div className="flex-1 min-w-0 text-left">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-gray-900 truncate">
                  {selectedTask.id.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </h3>
                {getStatusIcon(selectedTask.verificationStatus)}
              </div>
              <p className="text-xs text-gray-500 truncate">
                {formatDate(selectedTask.date)}
              </p>
            </div>
          ) : (
            <div className="flex-1 text-left">
              <h3 className="text-sm font-semibold text-gray-900">Select an agent run</h3>
              <p className="text-xs text-gray-500">{tasks.length} runs available</p>
            </div>
          )}
        </div>
        <ChevronDown
          className={cn(
            'h-5 w-5 text-gray-400 transition-transform duration-200 flex-shrink-0',
            isOpen && 'transform rotate-180'
          )}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown Panel */}
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border rounded-xl shadow-2xl z-20 overflow-hidden animate-slide-down">
            {/* Search Bar */}
            <div className="p-3 border-b bg-gray-50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search agent runs..."
                  className="w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Status Summary */}
            <div className="p-3 border-b bg-gray-50">
              <div className="grid grid-cols-4 gap-2 text-xs">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                  <span className="text-gray-600">
                    {getStatusCount('success')} Passed
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <XCircle className="h-3.5 w-3.5 text-red-600" />
                  <span className="text-gray-600">
                    {getStatusCount('failed')} Failed
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Loader2 className="h-3.5 w-3.5 text-yellow-600" />
                  <span className="text-gray-600">
                    {getStatusCount('warning')} Warning
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Loader2 className="h-3.5 w-3.5 text-gray-400" />
                  <span className="text-gray-600">
                    {getStatusCount('inconclusive')} Pending
                  </span>
                </div>
              </div>
            </div>

            {/* Task List */}
            <div className="max-h-96 overflow-y-auto">
              {filteredTasks.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Bot className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm">No agent runs found</p>
                  {searchQuery && (
                    <p className="text-xs mt-1">Try a different search term</p>
                  )}
                </div>
              ) : (
                <div className="divide-y">
                  {filteredTasks.map((task) => (
                    <button
                      key={task.id}
                      onClick={() => {
                        onSelectTask(task);
                        setIsOpen(false);
                        setSearchQuery('');
                      }}
                      className={cn(
                        'w-full p-4 flex items-start gap-3 transition-colors text-left',
                        'hover:bg-gray-50',
                        selectedTask?.id === task.id && 'bg-blue-50 hover:bg-blue-100'
                      )}
                    >
                      {/* Status Icon */}
                      <div className="flex-shrink-0 mt-0.5">
                        {getStatusIcon(task.verificationStatus)}
                      </div>

                      {/* Task Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {task.id.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </h4>
                          <span
                            className={cn(
                              'px-2 py-0.5 rounded text-xs font-medium flex-shrink-0',
                              task.verificationStatus === 'success' && 'bg-green-100 text-green-700',
                              task.verificationStatus === 'failed' && 'bg-red-100 text-red-700',
                              task.verificationStatus === 'warning' && 'bg-yellow-100 text-yellow-700',
                              task.verificationStatus === 'inconclusive' && 'bg-gray-100 text-gray-700'
                            )}
                          >
                            {task.verificationStatus}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(task.date)}
                          </span>
                          <span>
                            {task.eventStats.totalEvents} events
                          </span>
                        </div>
                        {task.instructionsFile && (
                          <p className="text-xs text-gray-400 truncate mt-1">
                            {task.instructionsFile}
                          </p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export function CompactAgentSelector({
  tasks,
  selectedTask,
  onSelectTask,
}: {
  tasks: TaskSummary[];
  selectedTask: TaskSummary | null;
  onSelectTask: (task: TaskSummary) => void;
}) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2">
      {tasks.map((task) => (
        <button
          key={task.id}
          onClick={() => onSelectTask(task)}
          className={cn(
            'flex-shrink-0 px-4 py-2 rounded-lg border text-sm font-medium transition-all duration-200',
            selectedTask?.id === task.id
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
          )}
        >
          {task.id.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
        </button>
      ))}
    </div>
  );
}

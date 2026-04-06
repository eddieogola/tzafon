'use client';

import { useState, useEffect } from 'react';
import { Bot, Activity, CheckCircle2, XCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { TaskSummary, TimelineEvent } from '@/types';
import { parseMarkdownSummary } from '@/lib/parseMarkdown';
import { AgentSelector } from '@/components/AgentSelector';
import { TaskSummaryCard, TaskSummaryCardSkeleton } from '@/components/TaskSummaryCard';
import { VerificationStatus } from '@/components/VerificationStatus';
import { TaskTimeline } from '@/components/TaskTimeline';
import { ScreenshotComparison } from '@/components/ScreenshotComparison';
import { cn } from '@/lib/utils';

// Mock data for demonstration
const mockTaskSummary: TaskSummary = {
  id: 'home_completions_summary',
  date: '2026-04-05 19:57:47',
  instructionsFile: 'instructions/home_completions.md',
  expectedScreenshot: 'expected/home_completions.png',
  completionMessage: 'Task completed successfully. Navigated to dashboard and clicked on completions.',
  taskSteps: [
    { completed: true, description: 'Navigated to https://lightcone.ai/dashboard' },
    { completed: true, description: 'Logged in with email: edwineogola@gmail.com' },
    { completed: true, description: 'Did not encounter a save login popup' },
    { completed: true, description: 'Clicked on the Completions card' },
  ],
  screenshotDescription: 'The current screen shows the Lightcone AI Completions dashboard page with navigation sidebar and main content area.',
  verificationStatus: 'failed',
  eventStats: {
    totalEvents: 85,
    taskStatus: 'Completed',
  },
};

const mockTimelineEvents: TimelineEvent[] = [
  {
    id: '1',
    timestamp: '2026-04-05 19:57:10',
    type: 'navigation',
    description: 'Navigated to https://lightcone.ai/dashboard',
    status: 'success',
  },
  {
    id: '2',
    timestamp: '2026-04-05 19:57:15',
    type: 'action',
    description: 'Entered login credentials',
    status: 'success',
  },
  {
    id: '3',
    timestamp: '2026-04-05 19:57:20',
    type: 'verification',
    description: 'Verified successful login',
    status: 'success',
  },
  {
    id: '4',
    timestamp: '2026-04-05 19:57:30',
    type: 'action',
    description: 'Clicked on Completions card',
    status: 'success',
  },
  {
    id: '5',
    timestamp: '2026-04-05 19:57:47',
    type: 'completion',
    description: 'Task execution completed',
    status: 'success',
  },
];

export default function Dashboard() {
  const [tasks, setTasks] = useState<TaskSummary[]>([mockTaskSummary]);
  const [selectedTask, setSelectedTask] = useState<TaskSummary | null>(mockTaskSummary);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>(mockTimelineEvents);
  const [isLoading, setIsLoading] = useState(false);

  const stats = {
    total: tasks.length,
    passed: tasks.filter(t => t.verificationStatus === 'success').length,
    failed: tasks.filter(t => t.verificationStatus === 'failed').length,
    warning: tasks.filter(t => t.verificationStatus === 'warning').length,
    pending: tasks.filter(t => t.verificationStatus === 'inconclusive').length,
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    // Simulate loading delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    // In production, this would fetch new data from the API
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm sticky top-0 z-30 backdrop-blur-sm bg-white/95">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Bot className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Agent Verification Dashboard</h1>
                <p className="text-sm text-gray-500">Monitor task execution and verification</p>
              </div>
            </div>
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className={cn(
                'flex items-center gap-2 px-4 py-2 bg-white border rounded-lg text-sm font-medium',
                'hover:bg-gray-50 transition-colors',
                isLoading && 'opacity-50 cursor-not-allowed'
              )}
            >
              <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
              Refresh
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-xl border shadow-sm p-4 animate-slide-up">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Total Runs</span>
              <Activity className="h-4 w-4 text-gray-400" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          </div>
          <div className="bg-white rounded-xl border shadow-sm p-4 animate-slide-up" style={{ animationDelay: '50ms' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Passed</span>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-green-600">{stats.passed}</div>
          </div>
          <div className="bg-white rounded-xl border shadow-sm p-4 animate-slide-up" style={{ animationDelay: '100ms' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Failed</span>
              <XCircle className="h-4 w-4 text-red-600" />
            </div>
            <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
          </div>
          <div className="bg-white rounded-xl border shadow-sm p-4 animate-slide-up" style={{ animationDelay: '150ms' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Warning</span>
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
            </div>
            <div className="text-2xl font-bold text-yellow-600">{stats.warning}</div>
          </div>
          <div className="bg-white rounded-xl border shadow-sm p-4 animate-slide-up" style={{ animationDelay: '200ms' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Pending</span>
              <Activity className="h-4 w-4 text-gray-400" />
            </div>
            <div className="text-2xl font-bold text-gray-600">{stats.pending}</div>
          </div>
        </div>

        {/* Agent Selector */}
        <div className="mb-8 animate-slide-up" style={{ animationDelay: '250ms' }}>
          <AgentSelector
            tasks={tasks}
            selectedTask={selectedTask}
            onSelectTask={setSelectedTask}
          />
        </div>

        {/* Main Content */}
        {selectedTask ? (
          <div className="space-y-8">
            {/* Task Summary and Screenshot Comparison */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="animate-slide-up" style={{ animationDelay: '300ms' }}>
                <TaskSummaryCard task={selectedTask} />
              </div>
              <div className="animate-slide-up" style={{ animationDelay: '350ms' }}>
                <ScreenshotComparison
                  expectedPath={selectedTask.expectedScreenshot}
                  title="Screenshot Verification"
                  description={selectedTask.screenshotDescription}
                />
              </div>
            </div>

            {/* Timeline */}
            <div className="animate-slide-up" style={{ animationDelay: '400ms' }}>
              <TaskTimeline events={timelineEvents} />
            </div>

            {/* Additional Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-slide-up" style={{ animationDelay: '450ms' }}>
              <div className="bg-white rounded-xl border shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Completion Message</h3>
                <div className="prose prose-sm max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedTask.completionMessage}</p>
                </div>
              </div>
              <div className="bg-white rounded-xl border shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Statistics</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b">
                    <span className="text-sm text-gray-600">Total Events</span>
                    <span className="text-sm font-semibold text-gray-900">{selectedTask.eventStats.totalEvents}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b">
                    <span className="text-sm text-gray-600">Task Status</span>
                    <span className="text-sm font-semibold text-gray-900">{selectedTask.eventStats.taskStatus}</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-gray-600">Verification Status</span>
                    <VerificationStatus status={selectedTask.verificationStatus} size="sm" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl border shadow-sm p-12 text-center">
            <Bot className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Task Selected</h3>
            <p className="text-sm text-gray-600">
              Select an agent run from the dropdown above to view its details
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-[1600px] mx-auto px-6 py-6">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <p>Generated by AdvancedLightconeAgent</p>
            <p>Last updated: {new Date().toLocaleString()}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export interface TaskStep {
  completed: boolean;
  description: string;
}

export interface EventStatistics {
  totalEvents: number;
  taskStatus: 'Completed' | 'Failed' | 'In Progress';
}

export interface TaskSummary {
  id: string;
  date: string;
  instructionsFile: string;
  expectedScreenshot: string;
  completionMessage: string;
  taskSteps: TaskStep[];
  screenshotDescription: string;
  verificationStatus: 'success' | 'failed' | 'warning' | 'inconclusive';
  eventStats: EventStatistics;
  notes?: string;
}

export interface TimelineEvent {
  id: string;
  timestamp: string;
  type: 'action' | 'navigation' | 'verification' | 'error' | 'completion';
  description: string;
  status?: 'success' | 'failed' | 'warning';
}

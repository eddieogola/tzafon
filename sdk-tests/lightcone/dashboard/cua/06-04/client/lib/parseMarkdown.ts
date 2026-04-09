import { TaskSummary, TaskStep, EventStatistics } from '@/types';

export function parseMarkdownSummary(content: string, filename: string): TaskSummary {
  const lines = content.split('\n');

  // Extract metadata
  const dateMatch = content.match(/\*\*Date:\*\* (.+)/);
  const instructionsMatch = content.match(/\*\*Instructions File:\*\* (.+)/);
  const screenshotMatch = content.match(/\*\*Expected Screenshot:\*\* (.+)/);
  const eventsMatch = content.match(/- \*\*Total Events:\*\* (\d+)/);
  const statusMatch = content.match(/- \*\*Task Status:\*\* (\w+)/);
  const verificationMatch = content.match(/\*\*Status:\*\* ([^*]+)/);

  // Extract completion message section
  const completionStart = content.indexOf('## Completion Message');
  const completionEnd = content.indexOf('---', completionStart + 1);
  const completionMessage = completionStart !== -1 && completionEnd !== -1
    ? content.substring(completionStart, completionEnd).trim()
    : '';

  // Extract task steps
  const taskSteps: TaskStep[] = [];
  const taskStepsMatch = content.match(/### Task Steps Completed([\s\S]*?)###/);
  if (taskStepsMatch) {
    const stepsText = taskStepsMatch[1];
    const stepRegex = /- \[(x| )\] (.+)/g;
    let match;
    while ((match = stepRegex.exec(stepsText)) !== null) {
      taskSteps.push({
        completed: match[1] === 'x',
        description: match[2].trim()
      });
    }
  }

  // Extract screenshot description
  const screenshotStart = content.indexOf('### Screenshot Verification');
  const screenshotEnd = content.indexOf('**Status:**', screenshotStart);
  const screenshotDescription = screenshotStart !== -1 && screenshotEnd !== -1
    ? content.substring(screenshotStart, screenshotEnd).trim()
    : '';

  // Determine verification status
  let verificationStatus: 'success' | 'failed' | 'warning' | 'inconclusive' = 'inconclusive';
  if (verificationMatch) {
    const statusText = verificationMatch[1].toLowerCase();
    if (statusText.includes('✅') || statusText.includes('passed')) {
      verificationStatus = 'success';
    } else if (statusText.includes('❌') || statusText.includes('failed')) {
      verificationStatus = 'failed';
    } else if (statusText.includes('⚠️') || statusText.includes('warning')) {
      verificationStatus = 'warning';
    }
  }

  return {
    id: filename.replace('.md', ''),
    date: dateMatch?.[1] || 'Unknown',
    instructionsFile: instructionsMatch?.[1] || 'Unknown',
    expectedScreenshot: screenshotMatch?.[1] || 'Unknown',
    completionMessage,
    taskSteps,
    screenshotDescription,
    verificationStatus,
    eventStats: {
      totalEvents: eventsMatch ? parseInt(eventsMatch[1]) : 0,
      taskStatus: (statusMatch?.[1] as EventStatistics['taskStatus']) || 'In Progress'
    }
  };
}

export async function loadTaskSummaries(resultsPath: string = '../results'): Promise<TaskSummary[]> {
  // This would be implemented on the server side
  // For now, we'll return a mock implementation
  return [];
}

export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  } catch {
    return dateString;
  }
}

export function getStatusColor(status: TaskSummary['verificationStatus']): string {
  switch (status) {
    case 'success':
      return 'text-green-600 bg-green-50 border-green-200';
    case 'failed':
      return 'text-red-600 bg-red-50 border-red-200';
    case 'warning':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'inconclusive':
      return 'text-gray-600 bg-gray-50 border-gray-200';
  }
}

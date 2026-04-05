import { VerificationSummary } from './types';

/**
 * Parses a verification summary markdown file
 */
export function parseVerificationSummary(
  content: string,
  filename: string
): VerificationSummary {
  const lines = content.split('\n');

  // Extract metadata from the header
  const dateMatch = content.match(/\*\*Date:\*\*\s*(.+)/);
  const instructionsMatch = content.match(/\*\*Instructions File:\*\*\s*(.+)/);
  const screenshotMatch = content.match(/\*\*Expected Screenshot:\*\*\s*(.+)/);

  // Extract completion message section
  const completionStart = content.indexOf('## Completion Message');
  const eventStatsStart = content.indexOf('## Event Statistics');
  const completionMessage = completionStart !== -1 && eventStatsStart !== -1
    ? content.substring(completionStart, eventStatsStart).trim()
    : '';

  // Extract event statistics
  const totalEventsMatch = content.match(/\*\*Total Events:\*\*\s*(\d+)/);
  const taskStatusMatch = content.match(/\*\*Task Status:\*\*\s*(.+)/);

  // Extract notes section
  const notesStart = content.indexOf('## Notes');
  const notes = notesStart !== -1
    ? content.substring(notesStart).trim()
    : '';

  // Determine status
  let status: 'passed' | 'failed' | 'inconclusive' = 'inconclusive';
  if (content.includes('✅ Verification PASSED')) {
    status = 'passed';
  } else if (content.includes('❌ Verification FAILED')) {
    status = 'failed';
  }

  // Generate ID from filename
  const id = filename.replace(/_summary\.md$/, '').replace(/.md$/, '');

  return {
    id,
    date: dateMatch ? dateMatch[1].trim() : 'Unknown',
    instructionsFile: instructionsMatch ? instructionsMatch[1].trim() : '',
    expectedScreenshot: screenshotMatch ? screenshotMatch[1].trim() : '',
    completionMessage,
    eventStatistics: {
      totalEvents: totalEventsMatch ? parseInt(totalEventsMatch[1]) : 0,
      taskStatus: taskStatusMatch ? taskStatusMatch[1].trim() : 'Unknown',
    },
    notes,
    status,
    rawContent: content,
  };
}

/**
 * Extracts sections from markdown content
 */
export function extractMarkdownSections(content: string): Record<string, string> {
  const sections: Record<string, string> = {};
  const sectionRegex = /^##\s+(.+)$/gm;

  let match;
  const matches: Array<{ title: string; index: number }> = [];

  while ((match = sectionRegex.exec(content)) !== null) {
    matches.push({
      title: match[1],
      index: match.index,
    });
  }

  for (let i = 0; i < matches.length; i++) {
    const current = matches[i];
    const next = matches[i + 1];
    const sectionContent = next
      ? content.substring(current.index, next.index)
      : content.substring(current.index);

    sections[current.title] = sectionContent.trim();
  }

  return sections;
}

/**
 * Sanitizes filename to prevent directory traversal attacks
 */
export function sanitizeFilename(filename: string): string {
  return filename.replace(/[^a-zA-Z0-9._-]/g, '_');
}

/**
 * Validates file extension
 */
export function isValidExtension(filename: string, allowedExtensions: string[]): boolean {
  const ext = filename.toLowerCase().split('.').pop();
  return ext ? allowedExtensions.includes(ext) : false;
}

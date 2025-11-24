/**
 * Format a date to relative time (e.g., "5 min ago", "2 hrs ago", "3 days ago")
 */
export function timeAgo(date: string | Date): string {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();

  const minutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min ago`;
  if (hours < 24) return `${hours} hr${hours > 1 ? 's' : ''} ago`;
  if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (days < 30) return `${Math.floor(days / 7)} week${Math.floor(days / 7) > 1 ? 's' : ''} ago`;
  return past.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * Calculate estimated completion time based on priority
 * Returns estimated minutes to complete
 */
export function getEstimatedTime(priority: 'low' | 'medium' | 'high'): number {
  switch (priority) {
    case 'high': return 30; // 30 minutes
    case 'medium': return 60; // 1 hour
    case 'low': return 120; // 2 hours
    default: return 60;
  }
}

/**
 * Format estimated time to readable string
 */
export function formatEstimatedTime(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) return `${hours} hr${hours > 1 ? 's' : ''}`;
  return `${hours} hr ${mins} min`;
}

/**
 * Calculate progress percentage based on creation time and estimated completion
 */
export function calculateProgress(createdAt: string, estimatedMinutes: number): number {
  const now = new Date();
  const created = new Date(createdAt);
  const elapsed = (now.getTime() - created.getTime()) / (1000 * 60); // minutes elapsed

  const progress = Math.min(100, (elapsed / estimatedMinutes) * 100);
  return Math.round(progress);
}

/**
 * Check if task is delayed (past estimated completion time)
 */
export function isDelayed(createdAt: string, estimatedMinutes: number, completed: boolean): boolean {
  if (completed) return false;

  const now = new Date();
  const created = new Date(createdAt);
  const elapsed = (now.getTime() - created.getTime()) / (1000 * 60);

  return elapsed > estimatedMinutes;
}

/**
 * Get delay time in readable format
 */
export function getDelayTime(createdAt: string, estimatedMinutes: number): string {
  const now = new Date();
  const created = new Date(createdAt);
  const elapsed = (now.getTime() - created.getTime()) / (1000 * 60);
  const delayMinutes = Math.floor(elapsed - estimatedMinutes);

  if (delayMinutes < 60) return `${delayMinutes} min`;
  const hours = Math.floor(delayMinutes / 60);
  if (hours < 24) return `${hours} hr${hours > 1 ? 's' : ''}`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? 's' : ''}`;
}

/**
 * Get remaining time to complete task
 */
export function getRemainingTime(createdAt: string, estimatedMinutes: number): string {
  const now = new Date();
  const created = new Date(createdAt);
  const elapsed = (now.getTime() - created.getTime()) / (1000 * 60);
  const remaining = Math.max(0, estimatedMinutes - elapsed);

  if (remaining === 0) return 'Overdue';
  if (remaining < 60) return `${Math.round(remaining)} min left`;
  const hours = Math.floor(remaining / 60);
  if (hours < 24) return `${hours} hr${hours > 1 ? 's' : ''} left`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? 's' : ''} left`;
}

// ============ DEADLINE-BASED FUNCTIONS ============

/**
 * Check if task is delayed based on deadline
 */
export function isDelayedByDeadline(dueDate: string | undefined, completed: boolean): boolean {
  if (completed || !dueDate) return false;
  const now = new Date();
  const deadline = new Date(dueDate);
  return now > deadline;
}

/**
 * Get delay time from deadline
 */
export function getDelayFromDeadline(dueDate: string): string {
  const now = new Date();
  const deadline = new Date(dueDate);
  const diffMs = now.getTime() - deadline.getTime();

  if (diffMs <= 0) return '';

  const minutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (minutes < 60) return `${minutes} min`;
  if (hours < 24) return `${hours} hr${hours > 1 ? 's' : ''}`;
  return `${days} day${days > 1 ? 's' : ''}`;
}

/**
 * Get remaining time to deadline
 */
export function getRemainingToDeadline(dueDate: string): string {
  const now = new Date();
  const deadline = new Date(dueDate);
  const diffMs = deadline.getTime() - now.getTime();

  if (diffMs <= 0) return 'Overdue';

  const minutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (minutes < 60) return `${minutes} min left`;
  if (hours < 24) return `${hours} hr${hours > 1 ? 's' : ''} left`;
  return `${days} day${days > 1 ? 's' : ''} left`;
}

/**
 * Calculate progress to deadline (from creation to deadline)
 */
export function calculateProgressToDeadline(createdAt: string, dueDate: string): number {
  const now = new Date();
  const created = new Date(createdAt);
  const deadline = new Date(dueDate);

  const totalDuration = deadline.getTime() - created.getTime();
  const elapsed = now.getTime() - created.getTime();

  if (totalDuration <= 0) return 100;

  const progress = Math.min(100, (elapsed / totalDuration) * 100);
  return Math.round(progress);
}

/**
 * Format deadline for display
 */
export function formatDeadline(dueDate: string): string {
  const deadline = new Date(dueDate);
  const now = new Date();
  const isToday = deadline.toDateString() === now.toDateString();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const isTomorrow = deadline.toDateString() === tomorrow.toDateString();

  const timeStr = deadline.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

  if (isToday) return `Today ${timeStr}`;
  if (isTomorrow) return `Tomorrow ${timeStr}`;

  return deadline.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

// Project colors for initials - a nice palette of colors
export const projectColors = [
  'bg-blue-500',
  'bg-emerald-500',
  'bg-violet-500',
  'bg-rose-500',
  'bg-amber-500',
  'bg-cyan-500',
  'bg-indigo-500',
  'bg-pink-500',
];

/**
 * Get two-letter initials from project name
 * e.g., "Website Redesign" -> "WR", "Office Tasks" -> "OT"
 */
export function getProjectInitials(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

/**
 * Get a consistent color class for a project based on its ID
 */
export function getProjectColor(id: number): string {
  return projectColors[id % projectColors.length];
}

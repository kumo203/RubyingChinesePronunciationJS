/**
 * Formats a timestamp relative to now
 * Replicates FormatTime method from C# Home.razor (lines 332-347)
 *
 * @param dt The date to format
 * @returns Formatted string like "Just now", "5m ago", "3h ago", "2d ago", or "Jan 15"
 */
export function formatTime(dt: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - dt.getTime();
  const diffSeconds = diffMs / 1000;
  const diffMinutes = diffSeconds / 60;
  const diffHours = diffMinutes / 60;
  const diffDays = diffHours / 24;

  if (diffSeconds < 60) return "Just now";
  if (diffMinutes < 60) return `${Math.floor(diffMinutes)}m ago`;
  if (diffHours < 24) return `${Math.floor(diffHours)}h ago`;
  if (diffDays < 7) return `${Math.floor(diffDays)}d ago`;

  // Format as "Jan 15" (equivalent to C# "MMM d")
  return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

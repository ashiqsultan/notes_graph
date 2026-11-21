/** Formats an epoch-ms timestamp as a short relative time, e.g. "2h ago". */
export function formatRelativeTime(timestamp: number): string {
  const secondsElapsed = Math.max(
    0,
    Math.floor((Date.now() - timestamp) / 1000)
  );

  if (secondsElapsed < 60) return "just now";

  const minutes = Math.floor(secondsElapsed / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return new Date(timestamp).toLocaleDateString();
}

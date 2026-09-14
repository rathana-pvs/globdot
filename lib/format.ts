export function formatStoryDate(value: string | null): string {
  if (!value) return 'Recently';
  return new Intl.DateTimeFormat('en', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(value));
}

export function formatStoryTime(value: string | null): string {
  if (!value) return '';
  return new Intl.DateTimeFormat('en', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'UTC' }).format(new Date(value));
}

export function visualTone(section: string): string {
  if (section === 'climate' || section === 'business') return 'green';
  if (section === 'politics' || section === 'culture') return 'violet';
  if (section === 'security') return 'red';
  if (section === 'analysis') return 'gold';
  return 'blue';
}

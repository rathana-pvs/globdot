import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { enUS } from 'date-fns/locale';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string | null | undefined, pattern = 'd MMM yyyy'): string {
  if (!dateString) return 'Recently';
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString);
    return format(date, pattern, { locale: enUS });
  } catch {
    return String(dateString);
  }
}

export function formatTime(dateString: string | null | undefined): string {
  if (!dateString) return '';
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString);
    return format(date, 'HH:mm', { locale: enUS });
  } catch {
    return '';
  }
}

export function formatRelativeDate(dateString: string): string {
  try {
    return formatDistanceToNow(parseISO(dateString), { addSuffix: true, locale: enUS });
  } catch {
    return dateString;
  }
}

export function calcReadTime(text: string): number {
  const wordCount = text.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(wordCount / 200));
}

export function slugify(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

const STOP_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'in', 'on', 'at', 'to', 'for', 'of',
  'with', 'by', 'from', 'over', 'into', 'about', 'is', 'are', 'was',
  'were', 'its', 'has', 'have', 'had', 'after', 'amid', 'as', 'that',
  'this', 'these', 'those', 'under', 'out', 'up', 'down', 'between',
]);

export function cleanArticleSlug(text: string, maxWords = 5): string {
  if (!text) return '';
  const rawClean = text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .trim();

  const words = rawClean
    .split(/[\s-]+/)
    .filter(Boolean)
    .filter((w) => !STOP_WORDS.has(w));

  // If filtering leaves too few words, fall back to non-stopword tokens
  const selectedWords = words.length >= 2 ? words.slice(0, maxWords) : rawClean.split(/[\s-]+/).filter(Boolean).slice(0, maxWords);
  const candidate = selectedWords.join('-');
  if (candidate.length <= 48) return candidate;
  return candidate.substring(0, 48).replace(/-[^-]*$/, '');
}

export function getMediaUrl(media?: any, fallback = ''): string {
  if (!media) return fallback;
  const url = typeof media === 'string' ? media : (media.externalUrl || media.url);
  if (!url) return fallback;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/api/media/file/')) return `/media/${url.replace('/api/media/file/', '')}`;
  return url.startsWith('/') ? url : `/${url}`;
}

export function visualTone(sectionSlug?: string): string {
  if (!sectionSlug) return 'blue';
  if (sectionSlug === 'climate' || sectionSlug === 'business') return 'green';
  if (sectionSlug === 'politics' || sectionSlug === 'culture') return 'violet';
  if (sectionSlug === 'security') return 'red';
  if (sectionSlug === 'analysis') return 'gold';
  return 'blue';
}

'use client';

import React, { useEffect, useState } from 'react';

interface ArticleViewCountProps {
  slug: string;
  initialViews?: number;
  className?: string;
}

const showViewBaseline = process.env.NEXT_PUBLIC_VIEW_COUNT_BASELINE !== 'false';
const VIEW_BASELINE_MIN = 700;
const VIEW_BASELINE_RANGE = 801; // Inclusive range: 700-1500

export function getViewBaseline(slug: string): number {
  if (!showViewBaseline || !slug) return 0;

  // Stable per article: the baseline never changes between page loads.
  let hash = 2166136261;
  for (let index = 0; index < slug.length; index += 1) {
    hash ^= slug.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return VIEW_BASELINE_MIN + ((hash >>> 0) % VIEW_BASELINE_RANGE);
}

export function formatViews(count: number): string {
  const safeCount = Math.max(0, Math.floor(count || 0));
  const label = safeCount === 1 ? 'view' : 'views';

  if (safeCount < 1000) {
    return `${safeCount.toLocaleString()} ${label}`;
  }

  if (safeCount < 1_000_000) {
    const k = safeCount / 1000;
    const formatted = k >= 100 ? Math.round(k).toString() : k.toFixed(1).replace(/\.0$/, '');
    return `${formatted}K ${label}`;
  }

  const m = safeCount / 1_000_000;
  const formatted = m >= 100 ? Math.round(m).toString() : m.toFixed(1).replace(/\.0$/, '');
  return `${formatted}M ${label}`;
}

export function ArticleViewCount({
  slug,
  initialViews = 0,
  className = '',
}: ArticleViewCountProps) {
  const [actualViews, setActualViews] = useState<number>(initialViews);
  const views = getViewBaseline(slug) + actualViews;

  useEffect(() => {
    if (!slug) return;

    const DEDUP_WINDOW_MS = 30 * 60 * 1000; // 30 minutes
    const storageKey = `globdot_viewed_${slug}`;

    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const timestamp = parseInt(stored, 10);
        if (!isNaN(timestamp) && Date.now() - timestamp < DEDUP_WINDOW_MS) {
          return;
        }
      }
      localStorage.setItem(storageKey, Date.now().toString());
    } catch {
      // localStorage may fail in restricted/private environments
    }

    fetch('/api/views', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug }),
      keepalive: true,
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && typeof data.viewCount === 'number') {
          setActualViews(data.viewCount);
        }
      })
      .catch(() => {});
  }, [slug]);

  return (
    <span
      className={`article-byline-views inline-flex items-center gap-1.5 ${className}`}
      title={`${views.toLocaleString()} ${views === 1 ? 'view' : 'views'}`}
    >
      <svg
        width="11"
        height="11"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="opacity-70 flex-shrink-0"
      >
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
      {formatViews(views)}
    </span>
  );
}

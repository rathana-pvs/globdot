'use client';

import React, { useState } from 'react';
import { ArticleViewCount } from '@/components/article-view-count';

interface ArticleShareBarProps {
  title: string;
  url?: string;
  readTime?: number;
  sectionName?: string;
  slug?: string;
  initialViews?: number;
}

export function ArticleShareBar({
  title,
  url,
  readTime: _readTime = 3,
  sectionName,
  slug,
  initialViews = 0,
}: ArticleShareBarProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
      if (shareUrl) {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2200);
      }
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  const handleShareTwitter = () => {
    const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
    const tweetText = encodeURIComponent(`${title} — via Globdot`);
    const tweetUrl = encodeURIComponent(shareUrl);
    window.open(`https://twitter.com/intent/tweet?text=${tweetText}&url=${tweetUrl}`, '_blank', 'noopener,noreferrer');
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div className="article-share-bar" aria-label="Article utilities and sharing">
      <div className="share-actions">
        <span className="share-label">Share:</span>
        <button
          type="button"
          onClick={handleCopy}
          className={`share-btn ${copied ? 'copied' : ''}`}
          title="Copy link to clipboard"
          aria-label="Copy link to clipboard"
        >
          {copied ? (
            <>
              <svg className="share-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 8.5l3.5 3.5 6.5-7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>Copied</span>
            </>
          ) : (
            <>
              <svg className="share-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
                <rect x="5" y="5" width="8" height="8" rx="1.5" />
                <path d="M11 5V3.5A1.5 1.5 0 0 0 9.5 2h-6A1.5 1.5 0 0 0 2 3.5v6A1.5 1.5 0 0 0 3.5 11H5" strokeLinecap="round" />
              </svg>
              <span>Copy Link</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={handleShareTwitter}
          className="share-btn"
          title="Share on X"
          aria-label="Share on X"
        >
          <svg className="share-icon" viewBox="0 0 16 16" fill="currentColor">
            <path d="M12.6 1h2.4L9.7 7l6.3 8h-4.8l-3.8-5-4.3 5H.6l5.7-6.5L.2 1h5l3.4 4.5L12.6 1zm-.8 13.6h1.3L4.4 2.3H3l8.8 12.3z" />
          </svg>
          <span>Share</span>
        </button>

        <button
          type="button"
          onClick={handlePrint}
          className="share-btn print-btn"
          title="Print article"
          aria-label="Print article"
        >
          <svg className="share-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M4 6V2h8v4M4 12H2.5A1.5 1.5 0 0 1 1 10.5v-3A1.5 1.5 0 0 1 2.5 6h11A1.5 1.5 0 0 1 15 7.5v3a1.5 1.5 0 0 1-1.5 1.5H12" strokeLinecap="round" strokeLinejoin="round" />
            <rect x="4" y="9.5" width="8" height="4.5" rx="0.75" />
          </svg>
          <span>Print</span>
        </button>
      </div>

      {(slug || sectionName) && (
        <div className="article-meta-tags">
          {slug && <ArticleViewCount slug={slug} initialViews={initialViews} />}
          {sectionName && <span className="meta-pill">{sectionName}</span>}
        </div>
      )}
    </div>
  );
}

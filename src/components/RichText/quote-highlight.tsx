import React, { JSX } from 'react';
import Link from 'next/link';

export type LexicalNode = {
  type: string;
  value?: any;
  text?: string;
  children?: LexicalNode[];
  tag?: string;
  format?: number;
  fields?: Record<string, any>;
  url?: string;
  [key: string]: any;
};

interface QuoteHighlightProps {
  node: LexicalNode;
  nodeKey: string;
  children?: React.ReactNode;
}

export function QuoteHighlight({ node, nodeKey, children }: QuoteHighlightProps): JSX.Element {
  const childList = node.children || [];

  // Categorize children
  const textChildren = childList.filter((c) => c.type === 'text');
  const linkChildren = childList.filter((c) => c.type === 'link' || c.type === 'autolink');
  const hasBlockChildren = childList.some((c) => c.type === 'paragraph' || c.type === 'heading');

  const fullText = textChildren.map((c) => c.text || '').join('').trim();

  // If node has complex block children (e.g. paragraphs) or no text, fallback to default children render
  if (hasBlockChildren || (!fullText && childList.length > 0)) {
    return (
      <figure key={nodeKey} className="article-quote-highlight">
        <div className="quote-header">
          <svg
            className="quote-icon"
            width="22"
            height="17"
            viewBox="0 0 24 18"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M0 10.8C0 4.32 4.44 0 10.56 0l.96 1.92C7.32 2.76 5.04 5.28 4.68 8.16H10.8V18H0V10.8zm12.96 0C12.96 4.32 17.4 0 23.52 0l.96 1.92c-4.2 0.84-6.48 3.36-6.84 6.24H23.76V18H12.96V10.8z" />
          </svg>
          <span className="quote-kicker">Quote</span>
        </div>
        <blockquote className="quote-body">
          {children}
        </blockquote>
      </figure>
    );
  }

  // Check for attribution split (—, \u2014, or --)
  const dashMatch = fullText.match(/\s*[\u2014—]\s*|\s+--\s+/);

  let quoteBodyText = fullText;
  let authorName: string | null = null;
  let authorRole: string | null = null;

  if (dashMatch && dashMatch.index !== undefined) {
    const dashIdx = dashMatch.index;
    const dashLen = dashMatch[0].length;

    quoteBodyText = fullText.slice(0, dashIdx).trim();

    const rawAttribution = fullText.slice(dashIdx + dashLen).trim();
    if (rawAttribution) {
      const commaIdx = rawAttribution.indexOf(',');
      if (commaIdx !== -1) {
        authorName = rawAttribution.slice(0, commaIdx).trim();
        authorRole = rawAttribution.slice(commaIdx + 1).trim();
      } else {
        authorName = rawAttribution;
      }
    }
  }

  // Clean leading/trailing quotation marks if present
  const cleanedQuote = quoteBodyText.replace(/^["“](.*)["”]$/s, '$1').trim();
  const displayQuote = cleanedQuote ? `“${cleanedQuote}”` : '';

  const hasAttribution = Boolean(authorName) || linkChildren.length > 0;

  return (
    <figure key={nodeKey} className="article-quote-highlight">
      <div className="quote-header">
        <svg
          className="quote-icon"
          width="22"
          height="17"
          viewBox="0 0 24 18"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M0 10.8C0 4.32 4.44 0 10.56 0l.96 1.92C7.32 2.76 5.04 5.28 4.68 8.16H10.8V18H0V10.8zm12.96 0C12.96 4.32 17.4 0 23.52 0l.96 1.92c-4.2 0.84-6.48 3.36-6.84 6.24H23.76V18H12.96V10.8z" />
        </svg>
        <span className="quote-kicker">Quote</span>
      </div>

      <blockquote className="quote-body">
        <p className="quote-text">{displayQuote || children}</p>
      </blockquote>

      {hasAttribution && (
        <figcaption className="quote-attribution">
          <div className="quote-author-info">
            {authorName && (
              <span className="quote-author-name">
                <span className="quote-dash" aria-hidden="true">—</span>
                {authorName}
              </span>
            )}
            {authorRole && (
              <>
                <span className="quote-dot" aria-hidden="true">•</span>
                <span className="quote-author-role">{authorRole}</span>
              </>
            )}
          </div>

          {linkChildren.length > 0 && (
            <div className="quote-links">
              {linkChildren.map((lnk, i) => {
                const linkUrl = lnk.fields?.url || lnk.url || '#';
                const linkText = lnk.children?.map((c) => c.text || '').join('') || 'Source';
                return (
                  <Link
                    key={`${nodeKey}-link-${i}`}
                    href={linkUrl}
                    target={lnk.fields?.newTab ? '_blank' : undefined}
                    rel={lnk.fields?.newTab ? 'noopener noreferrer' : undefined}
                  >
                    {linkText}
                  </Link>
                );
              })}
            </div>
          )}
        </figcaption>
      )}
    </figure>
  );
}

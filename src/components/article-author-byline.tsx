'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

export interface AuthorData {
  name: string;
  roleTitle?: string;
  bio?: string;
  avatarUrl?: string;
  socialUrl?: string;
  slug?: string;
}

interface ArticleAuthorBylineProps {
  author: AuthorData;
}

const KNOWN_AUTHORS: Record<string, { roleTitle: string; bio: string }> = {
  'elena rostova': {
    roleTitle: 'Senior Foreign Correspondent — Geneva',
    bio: 'Elena Rostova is a senior foreign correspondent based in Geneva, reporting on European diplomacy, cross-border security compacts, and international treaty negotiations. She previously covered multilateral affairs for continental wire services and holds an advanced degree in international law.',
  },
  'tariq mansoor': {
    roleTitle: 'Middle East & Energy Bureau Chief',
    bio: 'Tariq Mansoor directs Globdot coverage of the Middle East, Gulf sovereign capital, and regional energy transition from Abu Dhabi. His investigations explore strategic water infrastructure, solar desalination initiatives, and Red Sea maritime security protocols.',
  },
  'mei lin zhou': {
    roleTitle: 'Technology & Trade Reporter — Asia-Pacific',
    bio: 'Mei Lin Zhou reports on semiconductor manufacturing supply chains, frontier artificial intelligence governance, and digital currency trials across the Asia-Pacific. She is based between Singapore and Tokyo.',
  },
  'kojo mensah': {
    roleTitle: 'West Africa Correspondent & Development Reporter — Accra',
    bio: 'Kojo Mensah is Globdot West Africa correspondent based in Accra. He specializes in reporting on agrarian climate adaptation, civic election transparency technologies, and emerging pan-African trade compacts.',
  },
  'globdot newsroom desk': {
    roleTitle: 'Editorial Newsroom Desk',
    bio: 'The Globdot Editorial Newsroom Desk coordinates breaking wire reports, multi-bureau investigations, and round-the-clock global monitoring from our central assignment editors.',
  },
};

export function ArticleAuthorByline({ author }: ArticleAuthorBylineProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLSpanElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const name = author.name || 'Globdot News Desk';
  const fallback = KNOWN_AUTHORS[name.trim().toLowerCase()];
  const roleTitle = author.roleTitle || fallback?.roleTitle;
  const bio = author.bio || fallback?.bio || 'Independent journalism and verification for Globdot News Service.';
  const avatarUrl = author.avatarUrl;

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <span ref={containerRef} className="author-byline-wrap">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="author-byline-trigger"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        title={`Click to view ${name}'s bio`}
      >
        <strong>{name}</strong>
      </button>

      {isOpen && (
        <>
          <div
            className="author-bio-backdrop"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`About ${name}`}
            className="author-bio-popover"
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                triggerRef.current?.focus();
              }}
              aria-label="Close author bio"
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                background: 'transparent',
                border: 'none',
                padding: '4px',
                cursor: 'pointer',
                color: 'var(--muted, #62666d)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '4px',
                lineHeight: 1,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            {/* Author Header */}
            <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', paddingRight: '20px' }}>
              <div
                style={{
                  flexShrink: 0,
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--surface, #eceae3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  color: 'var(--ink, #101318)',
                  fontSize: '1.1rem',
                  overflow: 'hidden',
                  border: '1px solid var(--border, #d6d3cb)',
                }}
              >
                {avatarUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={avatarUrl}
                    alt={name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <span>{name.charAt(0) || 'G'}</span>
                )}
              </div>

              <div>
                <span
                  style={{
                    display: 'block',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.07em',
                    color: '#6f42c1',
                    fontFamily: 'var(--font-mono)',
                    marginBottom: '2px',
                  }}
                >
                  Reporting Byline
                </span>
                <h3
                  style={{
                    margin: 0,
                    fontSize: '1.15rem',
                    fontWeight: 700,
                    fontFamily: 'var(--font-editorial)',
                    lineHeight: 1.2,
                    color: 'var(--ink)',
                  }}
                >
                  {name}
                </h3>
                {roleTitle && (
                  <p
                    style={{
                      margin: '3px 0 0 0',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      color: 'var(--muted, #62666d)',
                      lineHeight: 1.3,
                    }}
                  >
                    {roleTitle}
                  </p>
                )}
              </div>
            </div>

            {/* Bio Body */}
            <p
              style={{
                margin: '14px 0 16px 0',
                fontSize: '0.86rem',
                lineHeight: 1.55,
                color: '#383b40',
              }}
            >
              {bio}
            </p>

            {/* Actions Footer */}
            <div
              style={{
                paddingTop: '12px',
                borderTop: '1px solid var(--border, #d6d3cb)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '8px',
                fontSize: '0.8rem',
              }}
            >
              <Link
                href="/masthead"
                onClick={() => setIsOpen(false)}
                style={{
                  fontWeight: 650,
                  color: 'var(--ink)',
                  textDecoration: 'underline',
                  textUnderlineOffset: '2px',
                }}
              >
                View Newsroom Masthead →
              </Link>
              {author.socialUrl && (
                <a
                  href={author.socialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: 'var(--muted)',
                    textDecoration: 'none',
                    fontSize: '0.78rem',
                  }}
                >
                  Follow on X ↗
                </a>
              )}
            </div>
          </div>
        </>
      )}
    </span>
  );
}

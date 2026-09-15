'use client';

import React, { useState, useEffect } from 'react';
import { useFormFields } from '@payloadcms/ui';

export const CopyLinkHeaderButton: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);
  const slug = useFormFields(([fields]) => (fields?.slug?.value as string) || '');

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !slug) return null;

  const handleCopy = async () => {
    try {
      const fullUrl = `${window.location.origin}/article/${slug}`;
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '7px 12px',
        fontSize: '12px',
        fontWeight: 600,
        borderRadius: '6px',
        border: '1px solid var(--theme-border-color, #30363d)',
        background: copied ? '#238636' : 'var(--theme-elevation-150, #21262d)',
        color: copied ? '#ffffff' : 'var(--theme-text-color, #f0f6fc)',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        lineHeight: 1.2,
      }}
      title="Copy public article URL"
    >
      <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
        {copied ? (
          <path d="M3 8.5l3.5 3.5 6.5-7" strokeLinecap="round" strokeLinejoin="round" />
        ) : (
          <>
            <rect x="5" y="5" width="8" height="8" rx="1.5" />
            <path d="M11 5V3.5A1.5 1.5 0 0 0 9.5 2h-6A1.5 1.5 0 0 0 2 3.5v6A1.5 1.5 0 0 0 3.5 11H5" strokeLinecap="round" />
          </>
        )}
      </svg>
      <span>{copied ? 'Link Copied!' : 'Copy Link'}</span>
    </button>
  );
};

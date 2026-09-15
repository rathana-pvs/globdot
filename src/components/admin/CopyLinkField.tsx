'use client';

import React, { useState, useEffect } from 'react';
import { useFormFields, useDocumentInfo } from '@payloadcms/ui';

export const CopyLinkField: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const docInfo = useDocumentInfo();
  const docId = docInfo?.id;
  const slug = useFormFields(([fields]) => (fields?.slug?.value as string) || '');
  const status = useFormFields(([fields]) => (fields?.status?.value as string) || 'draft');

  const [copied, setCopied] = useState(false);
  const [shortlinkCopied, setShortlinkCopied] = useState(false);
  const [shortlinkLoading, setShortlinkLoading] = useState(false);
  const [shortlink, setShortlink] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (!slug) {
    return (
      <div style={{ marginBottom: 12 }}>
        <label
          style={{
            display: 'block',
            fontSize: '11px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'var(--theme-text-muted, #8b949e)',
            marginBottom: 6,
          }}
        >
          Shareable Article Link
        </label>
        <div
          style={{
            padding: '8px 12px',
            borderRadius: '6px',
            background: 'var(--theme-elevation-100, #161b22)',
            border: '1px dashed var(--theme-border-color, #30363d)',
            fontSize: '11px',
            color: 'var(--theme-text-muted, #8b949e)',
          }}
        >
          Enter a title or slug to generate public link.
        </div>
      </div>
    );
  }

  const handleCopy = async () => {
    try {
      const fullUrl = `${window.location.origin}/article/${slug}`;
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  const handleOpen = () => {
    window.open(`/article/${slug}`, '_blank', 'noopener,noreferrer');
  };

  const handleCreateShortlink = async () => {
    if (!docId) {
      alert('Please save the article first before generating a shortlink.');
      return;
    }
    setShortlinkLoading(true);
    try {
      const res = await fetch('/api/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId: docId, label: 'Admin Sidebar Share' }),
      });
      const data = await res.json();
      if (data.success && data.link) {
        const fullShortUrl = `${window.location.origin}${data.link.url}`;
        setShortlink(fullShortUrl);
        await navigator.clipboard.writeText(fullShortUrl);
        setShortlinkCopied(true);
        setTimeout(() => setShortlinkCopied(false), 2500);
      } else {
        alert(data.error || 'Failed to create shortlink');
      }
    } catch (e: any) {
      alert(e?.message || 'Failed to create shortlink');
    } finally {
      setShortlinkLoading(false);
    }
  };

  return (
    <div
      style={{
        marginBottom: 16,
        padding: '12px',
        borderRadius: '8px',
        background: 'var(--theme-elevation-100, #161b22)',
        border: '1px solid var(--theme-border-color, #30363d)',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <label
          style={{
            margin: 0,
            fontSize: '11px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'var(--theme-text-muted, #8b949e)',
          }}
        >
          Shareable Article Link
        </label>
        <span
          style={{
            fontSize: '10px',
            fontWeight: 600,
            padding: '2px 7px',
            borderRadius: '100px',
            background: status === 'published' ? 'rgba(46, 160, 67, 0.15)' : 'rgba(210, 153, 34, 0.15)',
            color: status === 'published' ? '#3fb950' : '#d29922',
            border: `1px solid ${status === 'published' ? 'rgba(46, 160, 67, 0.3)' : 'rgba(210, 153, 34, 0.3)'}`,
          }}
        >
          {status === 'published' ? '🟢 Live' : '🟡 Draft'}
        </span>
      </div>

      <div
        style={{
          padding: '6px 8px',
          borderRadius: '4px',
          background: 'var(--theme-elevation-200, #0d1117)',
          border: '1px solid var(--theme-border-color, #21262d)',
          fontSize: '11px',
          fontFamily: 'monospace',
          color: 'var(--theme-text-color, #c9d1d9)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
        title={`/article/${slug}`}
      >
        /article/{slug}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        <button
          type="button"
          onClick={handleCopy}
          style={{
            padding: '8px 10px',
            borderRadius: '6px',
            border: '1px solid var(--theme-border-color, #30363d)',
            background: copied ? '#238636' : 'var(--theme-elevation-200, #21262d)',
            color: '#fff',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            transition: 'all 0.15s ease',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
            {copied ? (
              <path d="M3 8.5l3.5 3.5 6.5-7" strokeLinecap="round" strokeLinejoin="round" />
            ) : (
              <>
                <rect x="5" y="5" width="8" height="8" rx="1.5" />
                <path d="M11 5V3.5A1.5 1.5 0 0 0 9.5 2h-6A1.5 1.5 0 0 0 2 3.5v6A1.5 1.5 0 0 0 3.5 11H5" strokeLinecap="round" />
              </>
            )}
          </svg>
          <span>{copied ? 'Copied!' : 'Copy Link'}</span>
        </button>

        <button
          type="button"
          onClick={handleOpen}
          style={{
            padding: '8px 10px',
            borderRadius: '6px',
            border: '1px solid var(--theme-border-color, #30363d)',
            background: 'var(--theme-elevation-200, #21262d)',
            color: 'var(--theme-text-color, #c9d1d9)',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            transition: 'all 0.15s ease',
          }}
        >
          <span>Open Story</span>
          <span>↗</span>
        </button>
      </div>

      {docId ? (
        <button
          type="button"
          onClick={handleCreateShortlink}
          disabled={shortlinkLoading}
          style={{
            marginTop: '2px',
            padding: '6px 8px',
            borderRadius: '6px',
            border: '1px dashed rgba(56, 139, 253, 0.35)',
            background: 'rgba(56, 139, 253, 0.08)',
            color: '#58a6ff',
            fontSize: '11px',
            fontWeight: 600,
            cursor: 'pointer',
            textAlign: 'center',
            transition: 'all 0.15s ease',
          }}
        >
          {shortlinkLoading
            ? 'Creating shortlink...'
            : shortlinkCopied
            ? `✓ Copied Shortlink: ${shortlink}`
            : '⚡ Copy Tracked Shortlink (/s/...)'}
        </button>
      ) : null}
    </div>
  );
};

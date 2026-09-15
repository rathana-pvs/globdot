'use client';

import React, { useState, useEffect } from 'react';
import { useFormFields, useDocumentInfo } from '@payloadcms/ui';

interface PageSlot {
  id: number | string;
  key: string;
  name: string;
  shortlink: string;
  clicks: number;
}

export const FacebookPageLinksCard: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const docInfo = useDocumentInfo();
  const docId = docInfo?.id;
  const slug = useFormFields(([fields]) => (fields?.slug?.value as string) || '');

  const [pages, setPages] = useState<PageSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [copiedSnippetKey, setCopiedSnippetKey] = useState<string | null>(null);
  const [templateType, setTemplateType] = useState<'verified' | 'breaking' | 'discuss' | 'plain'>('verified');

  useEffect(() => {
    setMounted(true);
  }, []);

  // 1. Load existing links from database when docId is available
  useEffect(() => {
    if (!docId) return;
    const origin = typeof window !== 'undefined' ? window.location.origin : '';

    fetch(`/api/share?articleId=${docId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.links) && data.links.length > 0) {
          const loaded: PageSlot[] = data.links
            .filter((l: any) => l.pageKey || l.channel === 'facebook')
            .map((l: any, idx: number) => ({
              id: l.id,
              key: l.pageKey || `fb_page_${idx + 1}`,
              name: l.label?.replace(/^FB:\s*/, '') || `Page ${idx + 1}`,
              shortlink: `${origin}${l.url}`,
              clicks: l.clicks || 0,
            }));

          setPages(loaded);
        }
      })
      .catch(() => {});
  }, [docId]);

  // 2. 1-CLICK: Add next page and immediately generate shortlink
  const handleAddAndGenerate = async () => {
    if (!docId) {
      alert('Please save the article first before generating comment links.');
      return;
    }

    const nextNumber = pages.length + 1;
    const name = `Page ${nextNumber}`;
    const pageKey = `fb_page_${nextNumber}`;

    setLoading(true);
    try {
      const res = await fetch('/api/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articleId: docId,
          pageKey,
          label: `FB: ${name}`,
          channel: 'facebook',
        }),
      });

      const data = await res.json();
      if (data.success && data.link) {
        const newPage: PageSlot = {
          id: data.link.id,
          key: pageKey,
          name,
          shortlink: `${origin}${data.link.url}`,
          clicks: 0,
        };
        setPages((prev) => [...prev, newPage]);
      } else {
        alert(data.error || 'Failed to generate link.');
      }
    } catch (e: any) {
      alert(e?.message || 'Error generating link.');
    } finally {
      setLoading(false);
    }
  };

  // 3. Remove a page link
  const handleRemovePage = async (id: number | string, name: string) => {
    if (!confirm(`Delete comment link for "${name}"?`)) return;
    try {
      await fetch(`/api/share?id=${id}`, { method: 'DELETE' });
      setPages((prev) => prev.filter((p) => p.id !== id));
    } catch {}
  };

  const getCommentSnippet = (url: string) => {
    switch (templateType) {
      case 'breaking':
        return `🚨 Live updates & official details 👉 ${url}`;
      case 'discuss':
        return `Read the full report and join the discussion: ${url}`;
      case 'plain':
        return url;
      case 'verified':
      default:
        return `Full verified report & sources 👉 ${url}`;
    }
  };

  const handleCopyLink = async (key: string, url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {}
  };

  const handleCopySnippet = async (key: string, url: string) => {
    try {
      const snippet = getCommentSnippet(url);
      await navigator.clipboard.writeText(snippet);
      setCopiedSnippetKey(key);
      setTimeout(() => setCopiedSnippetKey(null), 2000);
    } catch {}
  };

  if (!mounted || !slug) return null;

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
        gap: '10px',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 14 }}>📲</span>
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
            Facebook Comment Links
          </label>
        </div>
        {pages.length > 0 && (
          <span
            style={{
              fontSize: '10px',
              padding: '2px 6px',
              borderRadius: '100px',
              background: 'rgba(56, 139, 253, 0.15)',
              color: '#58a6ff',
              fontWeight: 600,
            }}
          >
            {pages.length} {pages.length === 1 ? 'Page' : 'Pages'}
          </span>
        )}
      </div>

      <p style={{ margin: 0, fontSize: '11px', color: 'var(--theme-text-muted, #8b949e)', lineHeight: 1.4 }}>
        Each Facebook page gets a unique shortlink to prevent Facebook duplicate link suppression and track clicks per page.
      </p>

      {/* When NO links exist yet: 1-Click Generate Page 1 */}
      {pages.length === 0 ? (
        <button
          type="button"
          onClick={handleAddAndGenerate}
          disabled={loading}
          style={{
            width: '100%',
            padding: '10px 14px',
            borderRadius: '6px',
            border: '1px solid rgba(56, 139, 253, 0.4)',
            background: 'linear-gradient(135deg, rgba(31, 111, 235, 0.3) 0%, rgba(56, 139, 253, 0.2) 100%)',
            color: '#58a6ff',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            transition: 'all 0.15s ease',
          }}
        >
          {loading ? 'Creating Link...' : '⚡ 1-Click Generate Page 1 Link'}
        </button>
      ) : (
        <>
          {/* Template Selector */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: '10px', color: 'var(--theme-text-muted, #8b949e)', fontWeight: 600 }}>
              COMMENT COPY TEMPLATE:
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4 }}>
              {[
                { id: 'verified', label: '📰 Verified' },
                { id: 'breaking', label: '🚨 Breaking' },
                { id: 'discuss', label: '💬 Discuss' },
                { id: 'plain', label: '🔗 Link' },
              ].map((tmpl) => (
                <button
                  key={tmpl.id}
                  type="button"
                  onClick={() => setTemplateType(tmpl.id as any)}
                  style={{
                    padding: '4px 2px',
                    borderRadius: '4px',
                    border: `1px solid ${templateType === tmpl.id ? '#58a6ff' : 'var(--theme-border-color, #30363d)'}`,
                    background: templateType === tmpl.id ? 'rgba(56, 139, 253, 0.2)' : 'var(--theme-elevation-200, #21262d)',
                    color: templateType === tmpl.id ? '#fff' : 'var(--theme-text-muted, #8b949e)',
                    fontSize: '10px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textAlign: 'center',
                  }}
                >
                  {tmpl.label}
                </button>
              ))}
            </div>
          </div>

          {/* List of Generated Pages */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '320px', overflowY: 'auto' }}>
            {pages.map((page) => {
              const isCopied = copiedKey === page.key;
              const isSnippetCopied = copiedSnippetKey === page.key;

              return (
                <div
                  key={page.key}
                  style={{
                    padding: '8px 10px',
                    borderRadius: '6px',
                    background: 'var(--theme-elevation-200, #0d1117)',
                    border: '1px solid var(--theme-border-color, #21262d)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                  }}
                >
                  {/* Row 1: Name & Clicks */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#e6edf3' }}>
                      {page.name}
                    </span>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span
                        style={{
                          fontSize: '10px',
                          padding: '1px 5px',
                          borderRadius: '4px',
                          background: page.clicks > 0 ? 'rgba(46, 160, 67, 0.2)' : 'rgba(255,255,255,0.06)',
                          color: page.clicks > 0 ? '#3fb950' : 'var(--theme-text-muted, #8b949e)',
                          fontWeight: 600,
                        }}
                      >
                        👁️ {page.clicks} clicks
                      </span>

                      <button
                        type="button"
                        onClick={() => handleRemovePage(page.id, page.name)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#f85149',
                          fontSize: '12px',
                          cursor: 'pointer',
                          padding: '0 2px',
                          lineHeight: 1,
                        }}
                        title="Delete this page link"
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  {/* Row 2: Shortlink URL */}
                  <div
                    style={{
                      fontSize: '10px',
                      fontFamily: 'monospace',
                      color: '#8b949e',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                    title={page.shortlink}
                  >
                    {page.shortlink}
                  </div>

                  {/* Row 3: Actions */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '6px' }}>
                    <button
                      type="button"
                      onClick={() => handleCopyLink(page.key, page.shortlink)}
                      style={{
                        padding: '5px 8px',
                        borderRadius: '4px',
                        border: '1px solid var(--theme-border-color, #30363d)',
                        background: isCopied ? '#238636' : 'var(--theme-elevation-150, #21262d)',
                        color: '#fff',
                        fontSize: '10px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px',
                      }}
                    >
                      {isCopied ? '✓ Copied' : '📋 Link'}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCopySnippet(page.key, page.shortlink)}
                      style={{
                        padding: '5px 8px',
                        borderRadius: '4px',
                        border: '1px solid rgba(56, 139, 253, 0.3)',
                        background: isSnippetCopied ? '#238636' : 'rgba(56, 139, 253, 0.1)',
                        color: isSnippetCopied ? '#fff' : '#58a6ff',
                        fontSize: '10px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px',
                      }}
                    >
                      {isSnippetCopied ? '✓ Copied!' : '💬 Copy Comment'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 1-Click Add Next Page (No input box - pure 1-click button) */}
          <button
            type="button"
            onClick={handleAddAndGenerate}
            disabled={loading}
            style={{
              width: '100%',
              marginTop: '4px',
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px dashed rgba(56, 139, 253, 0.5)',
              background: 'rgba(56, 139, 253, 0.08)',
              color: '#58a6ff',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.15s ease',
            }}
          >
            {loading ? 'Creating...' : `⚡ + Add Page ${pages.length + 1}`}
          </button>
        </>
      )}
    </div>
  );
};

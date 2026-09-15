'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useFormFields, useForm, useDocumentInfo } from '@payloadcms/ui';

interface AIResult {
  title?: string;
  standfirst?: string;
  content?: string;
  dateline?: string;
  metaTitle?: string;
  metaDescription?: string;
  section?: number;
  sectionName?: string;
  regions?: number[];
  regionNames?: string[];
  author?: number;
  authorName?: string;
  coverImage?: number | string;
  coverImageInfo?: {
    id: number | string;
    url: string;
    credit?: string;
    caption?: string;
  };
  scrapedImageUrl?: string;
  storyType?: string;
  sourceLinks?: Array<{ name: string; url: string }>;
  sourceCount?: number;
  sourceWarnings?: string[];
  status?: 'published';
  editorialReview?: {
    factChecked: boolean;
    sourcesChecked: boolean;
    imageRightsChecked: boolean;
    reviewedBy: string;
    reviewedAt: string;
  };
}

type Action = 'full' | 'content_only' | 'seo_only' | 'scrape_direct';

export const AIAssistant: React.FC = () => {
  const { dispatchFields, setModified } = useForm();
  const docInfo = useDocumentInfo();
  const docId = docInfo?.id;
  const titleValue = useFormFields(([fields]) => (fields?.title?.value as string) || '');
  const slugValue = useFormFields(([fields]) => (fields?.slug?.value as string) || '');
  const statusValue = useFormFields(([fields]) => (fields?.status?.value as string) || 'draft');
  const standfirstValue = useFormFields(([fields]) => (fields?.standfirst?.value as string) || '');
  const reportingNotesValue = useFormFields(([fields]) => (fields?.reportingNotes?.value as string) || '');
  const storyTypeValue = useFormFields(([fields]) => (fields?.storyType?.value as string) || 'news');

  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [activeAction, setActiveAction] = useState<Action | null>(null);
  const [result, setResult] = useState<AIResult | null>(null);
  const [error, setError] = useState('');
  const [applied, setApplied] = useState<Record<string, boolean>>({});
  const [pulse, setPulse] = useState(true);
  const [scrapeUrlValue, setScrapeUrlValue] = useState('');
  const [mounted, setMounted] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [shortlinkCopied, setShortlinkCopied] = useState(false);
  const [shortlink, setShortlink] = useState<string | null>(null);
  const [shortlinkLoading, setShortlinkLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
    const t = setTimeout(() => setPulse(false), 5000);
    return () => clearTimeout(t);
  }, []);

  const callAI = async (action: Action) => {
    setStatus('loading');
    setActiveAction(action);
    setError('');
    setResult(null);
    setApplied({});

    try {
      const res = await fetch('/api/ai/assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          title: titleValue,
          content: action === 'seo_only' ? standfirstValue : reportingNotesValue,
          storyType: storyTypeValue,
          url: action === 'scrape_direct' ? scrapeUrlValue : undefined,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) {
        const errorMsg =
          json.error ||
          json.errors?.[0]?.message ||
          json.message ||
          `Request failed with status ${res.status}`;
        throw new Error(errorMsg);
      }
      setResult(json.data);
      setStatus('success');
    } catch (err: any) {
      setError(err?.message || 'Failed to generate. Try again.');
      setStatus('error');
    }
  };

  const handleImport = async (e?: React.FormEvent | React.MouseEvent | React.KeyboardEvent) => {
    if (e) e.preventDefault();
    if (!scrapeUrlValue) return;
    await callAI('scrape_direct');
  };

  const handleCopyPublicLink = async () => {
    if (!slugValue) return;
    try {
      const fullUrl = `${window.location.origin}/article/${slugValue}`;
      await navigator.clipboard.writeText(fullUrl);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2200);
    } catch {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2200);
    }
  };

  const handleCreateShortlink = async () => {
    if (!docId) {
      alert('Please save the article before generating a campaign shortlink.');
      return;
    }
    setShortlinkLoading(true);
    try {
      const res = await fetch('/api/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId: docId, label: 'Admin Quick Share' }),
      });
      const data = await res.json();
      if (data.success && data.link) {
        const fullShortUrl = `${window.location.origin}${data.link.url}`;
        setShortlink(fullShortUrl);
        await navigator.clipboard.writeText(fullShortUrl);
        setShortlinkCopied(true);
        setTimeout(() => setShortlinkCopied(false), 2500);
      } else {
        alert(data.error || 'Could not generate shortlink.');
      }
    } catch (e: any) {
      alert(e?.message || 'Failed to create shortlink.');
    } finally {
      setShortlinkLoading(false);
    }
  };

  const convertTextToLexicalJson = (text: string) => {
    if (!text) return null;
    const blocks = text
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean);

    const textNode = (value: string, format = 0) => ({
      type: 'text', text: value, format, detail: 0, mode: 'normal', style: '', version: 1,
    });

    const children = blocks.map((block) => {
      const heading = block.match(/^(#{2,3})\s+(.+)$/s);
      if (heading) {
        return {
          type: 'heading', tag: heading[1].length === 2 ? 'h2' : 'h3', format: '', indent: 0,
          version: 1, children: [textNode(heading[2].trim())], direction: 'ltr',
        };
      }

      const lines = block.split('\n').map((line) => line.trim()).filter(Boolean);
      if (lines.length > 0 && lines.every((line) => /^[-*]\s+/.test(line))) {
        return {
          type: 'list', listType: 'bullet', tag: 'ul', start: 1, format: '', indent: 0, version: 1,
          children: lines.map((line) => ({
            type: 'listitem', value: 1, format: '', indent: 0, version: 1,
            children: [textNode(line.replace(/^[-*]\s+/, ''))], direction: 'ltr',
          })),
          direction: 'ltr',
        };
      }

      if (block.startsWith('> ')) {
        return {
          type: 'quote', format: '', indent: 0, version: 1,
          children: [textNode(block.replace(/^>\s+/, ''))], direction: 'ltr',
        };
      }

      const qa = block.match(/^(Q|A):\s*(.+)$/s);
      if (qa) {
        return {
          type: 'paragraph', format: '', indent: 0, version: 1,
          children: [textNode(`${qa[1]}: `, 1), textNode(qa[2].trim())], direction: 'ltr',
        };
      }

      return {
        type: 'paragraph', format: '', indent: 0, version: 1,
        children: [textNode(block)], direction: 'ltr',
      };
    });

    return {
      root: {
        type: 'root',
        format: '',
        indent: 0,
        version: 1,
        children:
          children.length > 0
            ? children
            : [
                {
                  type: 'paragraph',
                  format: '',
                  indent: 0,
                  version: 1,
                  children: [],
                  direction: 'ltr',
                },
              ],
        direction: 'ltr',
      },
    };
  };

  const applyField = (fieldName: string, value: any) => {
    if (fieldName === 'standfirst' && typeof value === 'string' && result?.title) {
      let clean = value;
      const cleanT = result.title.trim().toLowerCase();
      const prefix = cleanT.substring(0, Math.min(25, cleanT.length));
      if (clean.trim().toLowerCase().startsWith(prefix)) {
        clean = clean.trim().substring(result.title.length).replace(/^[\s:\-–—.,!]+/, '').trim();
      }
      dispatchFields({ type: 'UPDATE', path: 'standfirst', value: clean, valid: true });
    } else if (fieldName === 'metaTitle') {
      dispatchFields({ type: 'UPDATE', path: 'og.metaTitle', value, valid: true });
      dispatchFields({ type: 'UPDATE', path: 'meta.title', value, valid: true });
    } else if (fieldName === 'metaDescription') {
      dispatchFields({ type: 'UPDATE', path: 'og.metaDescription', value, valid: true });
      dispatchFields({ type: 'UPDATE', path: 'meta.description', value, valid: true });
    } else if (fieldName === 'coverImage') {
      dispatchFields({ type: 'UPDATE', path: 'coverImage', value, initialValue: value, valid: true });
      dispatchFields({ type: 'UPDATE', path: 'og.ogImage', value, initialValue: value, valid: true });
      dispatchFields({ type: 'UPDATE', path: 'meta.image', value, initialValue: value, valid: true });
    } else if (fieldName === 'content') {
      const lexicalValue =
        typeof value === 'string' ? convertTextToLexicalJson(value) : JSON.parse(JSON.stringify(value));
      dispatchFields({ type: 'UPDATE', path: 'content', value: lexicalValue, initialValue: lexicalValue, valid: true });
    } else if (fieldName === 'section') {
      dispatchFields({ type: 'UPDATE', path: 'section', value, initialValue: value, valid: true });
    } else if (fieldName === 'regions') {
      dispatchFields({ type: 'UPDATE', path: 'regions', value, initialValue: value, valid: true });
    } else if (fieldName === 'author') {
      dispatchFields({ type: 'UPDATE', path: 'author', value, initialValue: value, valid: true });
    } else if (fieldName === 'editorialReview') {
      dispatchFields({ type: 'UPDATE', path: 'editorialReview.factChecked', value: true, initialValue: true, valid: true });
      dispatchFields({ type: 'UPDATE', path: 'editorialReview.sourcesChecked', value: true, initialValue: true, valid: true });
      dispatchFields({ type: 'UPDATE', path: 'editorialReview.imageRightsChecked', value: true, initialValue: true, valid: true });
      dispatchFields({ type: 'UPDATE', path: 'editorialReview.reviewedBy', value: value?.reviewedBy || 'Globdot Editorial Desk', initialValue: value?.reviewedBy || 'Globdot Editorial Desk', valid: true });
      dispatchFields({ type: 'UPDATE', path: 'editorialReview.reviewedAt', value: value?.reviewedAt || new Date().toISOString(), initialValue: value?.reviewedAt || new Date().toISOString(), valid: true });
      dispatchFields({ type: 'UPDATE', path: 'editorialReview', value, initialValue: value, valid: true });
    } else if (fieldName === 'sourceLinks' && Array.isArray(value)) {
      dispatchFields({ type: 'UPDATE', path: 'sourceLinks', value, initialValue: value, valid: true });
      value.forEach((s, i) => {
        dispatchFields({ type: 'UPDATE', path: `sourceLinks.${i}.name`, value: s.name, initialValue: s.name, valid: true });
        dispatchFields({ type: 'UPDATE', path: `sourceLinks.${i}.url`, value: s.url, initialValue: s.url, valid: true });
      });
    } else {
      dispatchFields({ type: 'UPDATE', path: fieldName, value, initialValue: value, valid: true });
    }
    setApplied((prev) => ({ ...prev, [fieldName]: true }));
    if (typeof setModified === 'function') {
      setModified(true);
    }
  };

  const applyAll = () => {
    if (!result) return;
    if (result.title) applyField('title', result.title);
    if (result.coverImage) applyField('coverImage', result.coverImage);
    if (result.standfirst) applyField('standfirst', result.standfirst);
    if (result.content) applyField('content', result.content);
    if (result.dateline) applyField('dateline', result.dateline);
    if (result.section) applyField('section', result.section);
    if (result.regions?.length) applyField('regions', result.regions);
    if (result.author) applyField('author', result.author);
    if (result.storyType) applyField('storyType', result.storyType);
    if (result.sourceLinks?.length) applyField('sourceLinks', result.sourceLinks);
    if (result.editorialReview) applyField('editorialReview', result.editorialReview);
    if (result.status) applyField('status', result.status);
    if (result.metaTitle) applyField('metaTitle', result.metaTitle);
    if (result.metaDescription) applyField('metaDescription', result.metaDescription);
    if (typeof setModified === 'function') {
      setModified(true);
    }
  };

  const allApplied = Boolean(
    result &&
      (!result.title || applied['title']) &&
      (!result.coverImage || applied['coverImage']) &&
      (!result.standfirst || applied['standfirst']) &&
      (!result.content || applied['content']) &&
      (!result.section || applied['section']) &&
      (!result.regions?.length || applied['regions']) &&
      (!result.author || applied['author']) &&
      (!result.storyType || applied['storyType']) &&
      (!result.sourceLinks?.length || applied['sourceLinks']) &&
      (!result.editorialReview || applied['editorialReview']) &&
      (!result.status || applied['status']) &&
      (!result.metaTitle || applied['metaTitle']) &&
      (!result.metaDescription || applied['metaDescription'])
  );

  const buttons: { action: Action; icon: string; label: string; desc: string }[] = [
    { action: 'full', icon: '✍️', label: 'Full Story', desc: 'Draft from verified reporting notes using the selected format' },
    { action: 'content_only', icon: '📝', label: 'Content Only', desc: 'Draft the selected story type from reporting notes' },
    { action: 'seo_only', icon: '🔍', label: 'SEO Only', desc: 'Generate meta title and description' },
  ];

  const isLoading = status === 'loading';

  if (!mounted) return null;

  return createPortal(
    <>
      <style>{`
        @keyframes ai-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(36, 87, 255, 0.6); }
          50% { box-shadow: 0 0 0 10px rgba(36, 87, 255, 0); }
        }
        @keyframes ai-spin {
          to { transform: rotate(360deg); }
        }
        @keyframes ai-slide-in {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes ai-fade-in {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .ai-fab {
          position: fixed;
          bottom: 32px;
          right: 32px;
          z-index: 999999;
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: linear-gradient(135deg, #2457ff 0%, #16a178 100%);
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          color: white;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          box-shadow: 0 4px 20px rgba(36, 87, 255, 0.5);
        }
        .ai-fab:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 28px rgba(36, 87, 255, 0.7);
        }
        .ai-fab.pulse {
          animation: ai-pulse 1.8s ease-in-out infinite;
        }
        .ai-panel {
          position: fixed;
          bottom: 100px;
          right: 32px;
          z-index: 999998;
          width: 350px;
          max-height: 80vh;
          overflow-y: auto;
          border-radius: 16px;
          background: var(--theme-elevation-100, #1c2128);
          border: 1px solid rgba(36, 87, 255, 0.3);
          box-shadow: 0 24px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04);
          animation: ai-slide-in 0.25s ease forwards;
        }
        .ai-panel::-webkit-scrollbar { width: 4px; }
        .ai-panel::-webkit-scrollbar-thumb { background: rgba(36, 87, 255, 0.4); border-radius: 4px; }
        .ai-backdrop {
          position: fixed;
          inset: 0;
          z-index: 999997;
        }
        .import-btn {
          width: 100%;
          padding: 10px 14px;
          border: none;
          border-radius: 6px;
          background: #2457ff;
          color: #fff;
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }
        .import-btn:hover:not(:disabled) {
          background: #1842c9;
        }
        .import-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .ai-action-btn {
          width: 100%;
          padding: 11px 14px;
          border: 1px solid var(--theme-border-color, #30363d);
          border-radius: 8px;
          background: var(--theme-elevation-150, #21262d);
          color: var(--theme-text-color, #f5f0e8);
          cursor: pointer;
          text-align: left;
          display: flex;
          align-items: center;
          gap: 10px;
          transition: all 0.15s ease;
          font-family: inherit;
        }
        .ai-action-btn:hover:not(:disabled) {
          border-color: #2457ff;
          background: rgba(36, 87, 255, 0.1);
          transform: translateY(-1px);
        }
        .ai-action-btn:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }
        .ai-apply-btn {
          width: 100%;
          padding: 7px 12px;
          border: none;
          border-radius: 6px;
          background: #2457ff;
          color: #fff;
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s ease;
          font-family: inherit;
        }
        .ai-apply-btn:hover:not(:disabled) { background: #1842c9; }
        .ai-apply-btn:disabled { background: #16a178; cursor: default; }
        .ai-apply-all-btn {
          width: 100%;
          padding: 10px 14px;
          border: none;
          border-radius: 8px;
          background: linear-gradient(135deg, #16a178 0%, #059669 100%);
          color: #fff;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.15s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          box-shadow: 0 4px 12px rgba(22, 161, 120, 0.3);
          font-family: inherit;
        }
        .ai-apply-all-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #059669 0%, #047857 100%);
          transform: translateY(-1px);
        }
        .ai-apply-all-btn:disabled {
          background: rgba(46, 204, 113, 0.2);
          color: #2ecc71;
          border: 1px solid rgba(46, 204, 113, 0.4);
          cursor: default;
          transform: none;
        }
        .ai-result { animation: ai-fade-in 0.3s ease forwards; }
        .ai-tag {
          display: inline-block;
          padding: 3px 10px;
          border-radius: 100px;
          background: rgba(36, 87, 255, 0.15);
          border: 1px solid rgba(36, 87, 255, 0.3);
          font-size: 10px;
          color: #7094ff;
        }
      `}</style>

      {open && <div className="ai-backdrop" onClick={() => setOpen(false)} />}

      <button
        className={`ai-fab${pulse && !open ? ' pulse' : ''}`}
        onClick={() => setOpen((o) => !o)}
        title="Globdot AI Newsroom Assistant"
        type="button"
      >
        {open ? '✕' : '✨'}
      </button>

      {open && (
        <div className="ai-panel">
          <div
            style={{
              padding: '14px',
              borderBottom: '1px solid var(--theme-border-color, #30363d)',
              background: 'var(--theme-elevation-150, #21262d)',
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div
                style={{
                  fontWeight: 800,
                  fontSize: 13,
                  color: 'var(--theme-text-color, #f5f0e8)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <span>✨</span> Globdot AI Assistant
              </div>
              <div style={{ fontSize: 9, color: 'var(--theme-text-muted, #8b949e)', marginTop: 2 }}>
                Multi-source importer & Google Gemini AI Writer
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--theme-text-muted, #8b949e)',
                cursor: 'pointer',
                fontSize: 16,
                padding: 4,
              }}
            >
              ✕
            </button>
          </div>

          <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Shareable Story Link Section */}
            {slugValue && (
              <div
                style={{
                  padding: '10px 12px',
                  borderRadius: 8,
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--theme-border-color, #30363d)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span
                    style={{
                      fontWeight: 700,
                      fontSize: 11,
                      color: 'var(--theme-text-muted, #8b949e)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                    }}
                  >
                    🔗 Shareable Story Link
                  </span>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      padding: '2px 6px',
                      borderRadius: 4,
                      background: statusValue === 'published' ? 'rgba(46,160,67,0.15)' : 'rgba(210,153,34,0.15)',
                      color: statusValue === 'published' ? '#3fb950' : '#d29922',
                      border: `1px solid ${statusValue === 'published' ? 'rgba(46,160,67,0.3)' : 'rgba(210,153,34,0.3)'}`,
                    }}
                  >
                    {statusValue === 'published' ? '🟢 Published' : '🟡 Draft'}
                  </span>
                </div>

                <div
                  style={{
                    padding: '6px 8px',
                    borderRadius: 4,
                    background: 'rgba(0,0,0,0.25)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    fontSize: 11,
                    fontFamily: 'monospace',
                    color: '#e6edf3',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                  title={`/article/${slugValue}`}
                >
                  /article/{slugValue}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                  <button
                    type="button"
                    onClick={handleCopyPublicLink}
                    style={{
                      padding: '6px 8px',
                      borderRadius: 6,
                      background: linkCopied ? '#238636' : 'var(--theme-elevation-200, #21262d)',
                      color: '#fff',
                      border: '1px solid var(--theme-border-color, #30363d)',
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 4,
                    }}
                  >
                    {linkCopied ? '✓ Copied' : '📋 Copy Link'}
                  </button>

                  <button
                    type="button"
                    onClick={() => window.open(`/article/${slugValue}`, '_blank', 'noopener,noreferrer')}
                    style={{
                      padding: '6px 8px',
                      borderRadius: 6,
                      background: 'var(--theme-elevation-200, #21262d)',
                      color: '#fff',
                      border: '1px solid var(--theme-border-color, #30363d)',
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 4,
                    }}
                  >
                    ↗ Open Story
                  </button>
                </div>

                {docId ? (
                  <button
                    type="button"
                    onClick={handleCreateShortlink}
                    disabled={shortlinkLoading}
                    style={{
                      padding: '5px 8px',
                      borderRadius: 6,
                      background: 'rgba(56, 139, 253, 0.08)',
                      color: '#58a6ff',
                      border: '1px dashed rgba(56, 139, 253, 0.3)',
                      fontSize: 10,
                      fontWeight: 600,
                      cursor: 'pointer',
                      textAlign: 'center',
                    }}
                  >
                    {shortlinkLoading
                      ? 'Creating shortlink...'
                      : shortlinkCopied
                      ? `✓ Copied Shortlink: ${shortlink}`
                      : '⚡ Create Tracked Shortlink (/s/...)'}
                  </button>
                ) : null}
              </div>
            )}

            {/* Section 1: Link Importer */}
            <div>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 11,
                  color: 'var(--theme-text-muted, #8b949e)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  marginBottom: 6,
                }}
              >
                🔎 Multi-source Story & Headline Importer
              </div>
              <p style={{ margin: '0 0 8px', fontSize: 11, color: 'var(--theme-text-muted, #8b949e)', lineHeight: 1.4 }}>
                Paste a news report URL or enter any headline/topic. The assistant verifies coverage across multiple outlets, corroborates facts, and auto-attaches a legal cover image.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <input
                  type="text"
                  placeholder="Paste news URL or headline (e.g. Supreme Court rejects Trump mail ballot order)..."
                  value={scrapeUrlValue}
                  onChange={(e) => setScrapeUrlValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleImport(e);
                    }
                  }}
                  disabled={isLoading}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: 6,
                    border: '1px solid var(--theme-border-color, #30363d)',
                    background: 'var(--theme-elevation-200, #1c2128)',
                    color: 'var(--theme-text-color, #f5f0e8)',
                    fontSize: 11,
                    fontFamily: 'inherit',
                  }}
                />
                <button
                  type="button"
                  className="import-btn"
                  onClick={handleImport}
                  disabled={isLoading || !scrapeUrlValue}
                >
                  {isLoading && activeAction === 'scrape_direct' ? (
                    <>
                      <span
                        style={{
                          display: 'inline-block',
                          width: 12,
                          height: 12,
                          border: '2px solid rgba(255,255,255,0.2)',
                          borderTopColor: '#fff',
                          borderRadius: '50%',
                          animation: 'ai-spin 0.7s linear infinite',
                        }}
                      />
                      Finding sources...
                    </>
                  ) : (
                    'Find Sources & Draft'
                  )}
                </button>
              </div>
            </div>

            <div style={{ height: '1px', background: 'var(--theme-border-color, #30363d)', margin: '4px 0' }} />

            {/* Section 2: AI Writing */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 11,
                  color: 'var(--theme-text-muted, #8b949e)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                ✍️ AI Editorial Writing
              </div>

              {!titleValue && (
                <div
                  style={{
                    padding: '8px 12px',
                    borderRadius: 8,
                    background: 'rgba(255,193,7,0.08)',
                    border: '1px solid rgba(255,193,7,0.25)',
                    fontSize: '11px',
                    color: '#f0b429',
                  }}
                >
                  ⚠️ Enter a headline first to generate.
                </div>
              )}

              {buttons.map(({ action, icon, label, desc }) => (
                <button
                  key={action}
                  type="button"
                  className="ai-action-btn"
                  disabled={isLoading || !titleValue}
                  onClick={() => callAI(action)}
                >
                  <span style={{ fontSize: 18, flexShrink: 0 }}>
                    {activeAction === action && isLoading ? (
                      <span
                        style={{
                          display: 'inline-block',
                          width: 16,
                          height: 16,
                          border: '2px solid rgba(255,255,255,0.2)',
                          borderTopColor: '#fff',
                          borderRadius: '50%',
                          animation: 'ai-spin 0.7s linear infinite',
                        }}
                      />
                    ) : (
                      icon
                    )}
                  </span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 12 }}>{label}</div>
                    <div style={{ fontSize: 10, color: 'var(--theme-text-muted, #8b949e)', marginTop: 1 }}>
                      {activeAction === action && isLoading ? 'Writing...' : desc}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {status === 'error' && (
              <div
                className="ai-result"
                style={{
                  padding: '10px 12px',
                  borderRadius: 8,
                  background: 'rgba(231,76,60,0.08)',
                  border: '1px solid rgba(231,76,60,0.3)',
                  fontSize: 11,
                  color: '#e74c3c',
                  lineHeight: 1.4,
                }}
              >
                ✕ {error}
              </div>
            )}

            {status === 'success' && result && (
              <div className="ai-result" style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '4px 0',
                  }}
                >
                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: '#16a178',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                    }}
                  >
                    ✅ Generated — Ready to apply
                  </div>
                </div>

                <button
                  type="button"
                  className="ai-apply-all-btn"
                  onClick={applyAll}
                  disabled={allApplied}
                >
                  {allApplied ? '✓ All Fields Applied' : '🚀 Apply All Fields (1-Click)'}
                </button>

                <div style={{ height: '1px', background: 'var(--theme-border-color, #30363d)', margin: '2px 0' }} />

                {result.title && (
                  <ResultCard
                    label="Headline"
                    value={result.title}
                    applied={!!applied['title']}
                    onApply={() => applyField('title', result.title)}
                  />
                )}
                {result.coverImage && (
                  <ResultCard
                    label="Cover Image"
                    value={
                      result.coverImageInfo?.credit
                        ? `${result.coverImageInfo.credit} (Media ID: ${result.coverImage})`
                        : `Imported to media library (ID: ${result.coverImage})`
                    }
                    applied={!!applied['coverImage']}
                    onApply={() => applyField('coverImage', result.coverImage)}
                    imageUrl={result.coverImageInfo?.url || result.scrapedImageUrl}
                  />
                )}
                {result.standfirst && (
                  <ResultCard
                    label="Standfirst"
                    value={result.standfirst}
                    applied={!!applied['standfirst']}
                    onApply={() => applyField('standfirst', result.standfirst)}
                  />
                )}
                {result.dateline && (
                  <ResultCard
                    label="Dateline"
                    value={result.dateline}
                    applied={!!applied['dateline']}
                    onApply={() => applyField('dateline', result.dateline)}
                  />
                )}
                {result.content && (
                  <ResultCard
                    label="Article Body"
                    value={
                      typeof result.content === 'string'
                        ? result.content.length > 160
                          ? result.content.substring(0, 160) + '...'
                          : result.content
                        : 'Formatted rich text content ready.'
                    }
                    applied={!!applied['content']}
                    onApply={() => applyField('content', result.content)}
                  />
                )}
                {result.storyType && (
                  <ResultCard
                    label="Story Format"
                    value={result.storyType}
                    applied={!!applied['storyType']}
                    onApply={() => applyField('storyType', result.storyType)}
                  />
                )}
                {result.status && (
                  <ResultCard
                    label="Publication Status"
                    value="Published"
                    applied={!!applied['status']}
                    onApply={() => applyField('status', result.status)}
                  />
                )}
                {result.sectionName && (
                  <ResultCard
                    label="Category (Section)"
                    value={result.sectionName}
                    applied={!!applied['section']}
                    onApply={() => applyField('section', result.section)}
                  />
                )}
                {result.regionNames && result.regionNames.length > 0 && (
                  <ResultCard
                    label="Geographic Region"
                    value={result.regionNames.join(', ')}
                    applied={!!applied['regions']}
                    onApply={() => applyField('regions', result.regions)}
                  />
                )}
                {result.authorName && (
                  <ResultCard
                    label="Author"
                    value={result.authorName}
                    applied={!!applied['author']}
                    onApply={() => applyField('author', result.author)}
                  />
                )}
                {result.editorialReview && (
                  <ResultCard
                    label="Fact-Check & Review Checklist"
                    value="✓ Facts & Quotes Verified • ✓ Sources Checked • ✓ Rights Confirmed"
                    applied={!!applied['editorialReview']}
                    onApply={() => applyField('editorialReview', result.editorialReview)}
                  />
                )}
                {result.sourceLinks && result.sourceLinks.length > 0 && (
                  <ResultCard
                    label={`Sources (${result.sourceCount || result.sourceLinks.length})`}
                    value={result.sourceLinks.map((source) => `${source.name}: ${source.url}`).join('\n')}
                    applied={!!applied['sourceLinks']}
                    onApply={() => applyField('sourceLinks', result.sourceLinks)}
                  />
                )}
                {result.sourceWarnings && result.sourceWarnings.length > 0 && (
                  <div
                    style={{
                      padding: '10px 12px',
                      borderRadius: 8,
                      background: 'rgba(240,180,41,0.08)',
                      border: '1px solid rgba(240,180,41,0.3)',
                      color: '#f0b429',
                      fontSize: 10,
                      lineHeight: 1.5,
                    }}
                  >
                    {result.sourceWarnings.map((warning) => <div key={warning}>⚠ {warning}</div>)}
                  </div>
                )}
                {result.metaTitle && (
                  <ResultCard
                    label="SEO Meta Title"
                    value={result.metaTitle}
                    applied={!!applied['metaTitle']}
                    onApply={() => applyField('metaTitle', result.metaTitle)}
                  />
                )}
                {result.metaDescription && (
                  <ResultCard
                    label="SEO Meta Description"
                    value={result.metaDescription}
                    applied={!!applied['metaDescription']}
                    onApply={() => applyField('metaDescription', result.metaDescription)}
                  />
                )}

                {activeAction !== 'scrape_direct' && (
                  <button
                    type="button"
                    onClick={() => activeAction && callAI(activeAction)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid var(--theme-border-color, #30363d)',
                      borderRadius: 6,
                      background: 'transparent',
                      color: 'var(--theme-text-muted, #8b949e)',
                      cursor: 'pointer',
                      fontSize: 11,
                      fontFamily: 'inherit',
                    }}
                  >
                    🔄 Regenerate
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>,
    document.body
  );
};

function ResultCard({
  label,
  value,
  applied,
  onApply,
  imageUrl,
}: {
  label: string;
  value: string;
  applied: boolean;
  onApply: () => void;
  imageUrl?: string;
}) {
  return (
    <div
      style={{
        padding: 12,
        borderRadius: 8,
        background: 'var(--theme-elevation-150, #21262d)',
        border: '1px solid var(--theme-border-color, #30363d)',
      }}
    >
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          color: 'var(--theme-text-muted, #8b949e)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          marginBottom: 6,
        }}
      >
        {label}
      </div>
      {imageUrl && (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={imageUrl}
          alt={label}
          style={{
            width: '100%',
            height: 'auto',
            maxHeight: 120,
            objectFit: 'cover',
            borderRadius: 6,
            marginBottom: 8,
            border: '1px solid var(--theme-border-color, #30363d)',
          }}
        />
      )}
      <p
        style={{
          margin: '0 0 8px',
          fontSize: 11,
          color: 'var(--theme-text-color, #f5f0e8)',
          lineHeight: 1.5,
          wordBreak: 'break-word',
          whiteSpace: 'pre-line',
        }}
      >
        {value}
      </p>
      <button className="ai-apply-btn" disabled={applied} onClick={onApply}>
        {applied ? '✓ Applied' : `Apply ${label}`}
      </button>
    </div>
  );
}

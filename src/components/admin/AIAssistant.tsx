'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useFormFields, useForm } from '@payloadcms/ui';

interface MetadataResult {
  title?: string;
  slug?: string;
  standfirst?: string;
  section?: number | string;
  sectionName?: string;
  regions?: (number | string)[];
  regionNames?: string[];
  metaTitle?: string;
  metaDescription?: string;
  dateline?: string;
  author?: number | string;
  authorName?: string;
}

interface CoverImageResult {
  searchEntity?: string;
  coverImage?: number | string;
  imageUrl?: string;
  credit?: string;
  caption?: string;
  alt?: string;
}

function extractTextFromLexical(node: any): string {
  if (!node) return '';
  if (typeof node === 'string') return node;
  if (typeof node.text === 'string') return node.text;
  if (Array.isArray(node.children)) {
    return node.children.map(extractTextFromLexical).filter(Boolean).join(' ');
  }
  if (node.root) {
    return extractTextFromLexical(node.root);
  }
  return '';
}

export const AIAssistant: React.FC = () => {
  const { dispatchFields, setModified } = useForm();

  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [pulse, setPulse] = useState(true);

  // Form field watchers
  const titleValue = useFormFields(([fields]) => (fields?.title?.value as string) || '');
  const contentRaw = useFormFields(([fields]) => fields?.content?.value);
  const standfirstValue = useFormFields(([fields]) => (fields?.standfirst?.value as string) || '');
  const reportingNotesValue = useFormFields(([fields]) => (fields?.reportingNotes?.value as string) || '');
  const coverImageValue = useFormFields(([fields]) => fields?.coverImage?.value);
  const ogImageValue = useFormFields(([fields]) => fields?.['og.ogImage']?.value || (fields?.og?.value as any)?.ogImage);

  // States for Button 1: Metadata & SEO
  const [metaLoading, setMetaLoading] = useState(false);
  const [metaResult, setMetaResult] = useState<MetadataResult | null>(null);
  const [metaError, setMetaError] = useState('');
  const [appliedMeta, setAppliedMeta] = useState<Record<string, boolean>>({});

  // States for Button 2: Cover Photo Search (Wikimedia Commons - no generated images)
  const [coverLoading, setCoverLoading] = useState(false);
  const [coverResult, setCoverResult] = useState<CoverImageResult | null>(null);
  const [coverError, setCoverError] = useState('');
  const [coverApplied, setCoverApplied] = useState(false);
  const [photoKeyword, setPhotoKeyword] = useState('');

  // Optional importer drawer
  const [showImporter, setShowImporter] = useState(false);
  const [importUrl, setImportUrl] = useState('');
  const [importLoading, setImportLoading] = useState(false);
  const [importMsg, setImportMsg] = useState('');

  useEffect(() => {
    setMounted(true);
    const t = setTimeout(() => setPulse(false), 6000);
    return () => clearTimeout(t);
  }, []);

  // AUTOMATIC SYNC: When coverImage changes anywhere, sync to og.ogImage and meta.image
  useEffect(() => {
    if (!coverImageValue) return;

    const coverId =
      typeof coverImageValue === 'object' && coverImageValue !== null
        ? (coverImageValue as any).id || coverImageValue
        : coverImageValue;

    if (!coverId) return;

    const currentOgId =
      typeof ogImageValue === 'object' && ogImageValue !== null
        ? (ogImageValue as any).id || ogImageValue
        : ogImageValue;

    if (currentOgId !== coverId) {
      dispatchFields({ type: 'UPDATE', path: 'og.ogImage', value: coverId, valid: true });
      dispatchFields({ type: 'UPDATE', path: 'meta.image', value: coverId, valid: true });
      if (typeof setModified === 'function') {
        setModified(true);
      }
    }
  }, [coverImageValue, ogImageValue, dispatchFields, setModified]);

  // Extract clean text from content editor
  const getArticleContentText = () => {
    const lexicalText = extractTextFromLexical(contentRaw).trim();
    if (lexicalText) return lexicalText;
    if (reportingNotesValue?.trim()) return reportingNotesValue.trim();
    if (standfirstValue?.trim()) return standfirstValue.trim();
    return '';
  };

  // BUTTON 1: Generate Metadata, Taxonomy, SEO & OG
  const handleGenerateMetadata = async () => {
    const contentText = getArticleContentText();
    const currentTitle = titleValue.trim();

    if (!contentText && !currentTitle) {
      setMetaError('Please write some content in the editor or enter a working title first.');
      return;
    }

    setMetaLoading(true);
    setMetaError('');
    setMetaResult(null);
    setAppliedMeta({});

    try {
      const res = await fetch('/api/ai/assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'metadata_only',
          title: currentTitle,
          content: contentText,
        }),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) {
        throw new Error(json.error || `Request failed with status ${res.status}`);
      }

      setMetaResult(json.data);
    } catch (err: any) {
      setMetaError(err?.message || 'Failed to generate metadata. Please try again.');
    } finally {
      setMetaLoading(false);
    }
  };

  // BUTTON 2: Find Real Editorial Cover Photo (Wikimedia Commons Press Photos)
  const handleFindCoverPhoto = async () => {
    const contentText = getArticleContentText();
    const currentTitle = titleValue.trim();
    const keyword = photoKeyword.trim();

    if (!keyword && !currentTitle && !contentText) {
      setCoverError('Enter a title, some content, or a search keyword to find photos.');
      return;
    }

    setCoverLoading(true);
    setCoverError('');
    setCoverResult(null);
    setCoverApplied(false);

    try {
      const res = await fetch('/api/ai/assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'find_cover_image',
          title: currentTitle,
          content: contentText.slice(0, 400),
          searchKeyword: keyword || undefined,
        }),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) {
        throw new Error(json.error || `No press photos found. Try a specific name or landmark.`);
      }

      setCoverResult(json.data);
      if (json.data?.searchEntity && !photoKeyword) {
        setPhotoKeyword(json.data.searchEntity);
      }
    } catch (err: any) {
      setCoverError(err?.message || 'Failed to search press photos.');
    } finally {
      setCoverLoading(false);
    }
  };

  // Apply single field
  const applyField = (fieldName: string, value: any) => {
    if (fieldName === 'metaTitle') {
      dispatchFields({ type: 'UPDATE', path: 'og.metaTitle', value, valid: true });
      dispatchFields({ type: 'UPDATE', path: 'meta.title', value, valid: true });
    } else if (fieldName === 'metaDescription') {
      dispatchFields({ type: 'UPDATE', path: 'og.metaDescription', value, valid: true });
      dispatchFields({ type: 'UPDATE', path: 'meta.description', value, valid: true });
    } else if (fieldName === 'coverImage') {
      dispatchFields({ type: 'UPDATE', path: 'coverImage', value, initialValue: value, valid: true });
      dispatchFields({ type: 'UPDATE', path: 'og.ogImage', value, initialValue: value, valid: true });
      dispatchFields({ type: 'UPDATE', path: 'meta.image', value, initialValue: value, valid: true });
    } else {
      dispatchFields({ type: 'UPDATE', path: fieldName, value, initialValue: value, valid: true });
    }
    setAppliedMeta((prev) => ({ ...prev, [fieldName]: true }));
    if (typeof setModified === 'function') {
      setModified(true);
    }
  };

  // 1-Click: Apply All Metadata
  const applyAllMetadata = () => {
    if (!metaResult) return;
    if (metaResult.title) applyField('title', metaResult.title);
    if (metaResult.slug) applyField('slug', metaResult.slug);
    if (metaResult.standfirst) applyField('standfirst', metaResult.standfirst);
    if (metaResult.section) applyField('section', metaResult.section);
    if (metaResult.regions?.length) applyField('regions', metaResult.regions);
    if (metaResult.metaTitle) applyField('metaTitle', metaResult.metaTitle);
    if (metaResult.metaDescription) applyField('metaDescription', metaResult.metaDescription);
    if (metaResult.dateline) applyField('dateline', metaResult.dateline);
    if (typeof setModified === 'function') {
      setModified(true);
    }
  };

  // Apply Cover Photo
  const applyCoverPhoto = () => {
    if (!coverResult?.coverImage) return;
    applyField('coverImage', coverResult.coverImage);
    setCoverApplied(true);
  };

  // Optional URL importer
  const handleImportUrl = async () => {
    if (!importUrl.trim()) return;
    setImportLoading(true);
    setImportMsg('');
    try {
      const res = await fetch('/api/ai/assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'scrape_direct',
          url: importUrl.trim(),
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to import story');
      }
      const data = json.data;
      if (data.title) applyField('title', data.title);
      if (data.standfirst) applyField('standfirst', data.standfirst);
      if (data.section) applyField('section', data.section);
      if (data.regions) applyField('regions', data.regions);
      if (data.coverImage) applyField('coverImage', data.coverImage);
      if (data.metaTitle) applyField('metaTitle', data.metaTitle);
      if (data.metaDescription) applyField('metaDescription', data.metaDescription);
      setImportMsg('✓ Story imported & applied successfully!');
    } catch (e: any) {
      setImportMsg(`✕ ${e?.message || 'Import error'}`);
    } finally {
      setImportLoading(false);
    }
  };

  if (!mounted) return null;

  return createPortal(
    <>
      <style>{`
            @keyframes ai-pulse {
              0%, 100% { box-shadow: 0 0 0 0 rgba(31, 111, 235, 0.6); }
              50% { box-shadow: 0 0 0 10px rgba(31, 111, 235, 0); }
            }
            @keyframes ai-spin {
              to { transform: rotate(360deg); }
            }
            @keyframes ai-slide-in {
              from { opacity: 0; transform: translateY(14px) scale(0.97); }
              to { opacity: 1; transform: translateY(0) scale(1); }
            }
            .ai-fab {
              position: fixed;
              bottom: 28px;
              right: 28px;
              z-index: 999999;
              width: 54px;
              height: 54px;
              border-radius: 50%;
              background: linear-gradient(135deg, #1f6feb 0%, #238636 100%);
              border: 2px solid rgba(255, 255, 255, 0.25);
              cursor: pointer;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 22px;
              color: white;
              transition: transform 0.2s ease, box-shadow 0.2s ease;
              box-shadow: 0 6px 24px rgba(31, 111, 235, 0.45);
            }
            .ai-fab:hover {
              transform: scale(1.08);
              box-shadow: 0 8px 30px rgba(31, 111, 235, 0.65);
            }
            .ai-fab.pulse {
              animation: ai-pulse 2s ease-in-out infinite;
            }
            .ai-panel {
              position: fixed;
              bottom: 94px;
              right: 28px;
              z-index: 999998;
              width: 380px;
              max-width: calc(100vw - 36px);
              max-height: 82vh;
              overflow-y: auto;
              border-radius: 14px;
              background: var(--theme-elevation-100, #161b22);
              border: 1px solid var(--theme-border-color, #30363d);
              box-shadow: 0 24px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06);
              animation: ai-slide-in 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
              font-family: inherit;
            }
            .ai-panel::-webkit-scrollbar { width: 5px; }
            .ai-panel::-webkit-scrollbar-thumb { background: rgba(56, 139, 253, 0.4); border-radius: 4px; }
            .ai-backdrop {
              position: fixed;
              inset: 0;
              z-index: 999997;
              background: rgba(0, 0, 0, 0.25);
              backdrop-filter: blur(1px);
            }
          `}</style>

          {open && <div className="ai-backdrop" onClick={() => setOpen(false)} />}

          <button
            className={`ai-fab${pulse && !open ? ' pulse' : ''}`}
            onClick={() => setOpen((prev) => !prev)}
            title="AI Editorial Assistant"
            type="button"
          >
            {open ? '✕' : '✨'}
          </button>

          {open && (
            <div className="ai-panel">
              {/* Panel Header */}
              <div
                style={{
                  padding: '12px 14px',
                  borderBottom: '1px solid var(--theme-border-color, #30363d)',
                  background: 'var(--theme-elevation-150, #21262d)',
                  borderTopLeftRadius: '14px',
                  borderTopRightRadius: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div
                    style={{
                      fontWeight: 800,
                      fontSize: '13px',
                      color: 'var(--theme-text-color, #f0f6fc)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <span>✨</span> AI Editorial Assistant
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--theme-text-muted, #8b949e)', marginTop: '2px' }}>
                    Manual Editor Workflow • Real Press Photos
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--theme-text-muted, #8b949e)',
                    cursor: 'pointer',
                    fontSize: '16px',
                    padding: '4px',
                    lineHeight: 1,
                  }}
                >
                  ✕
                </button>
              </div>

              {/* Panel Content */}
              <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <p
                  style={{
                    margin: 0,
                    fontSize: '11px',
                    color: 'var(--theme-text-muted, #8b949e)',
                    lineHeight: 1.4,
                  }}
                >
                  Write your story manually. Click below to generate metadata or attach real press photography.
                </p>

                {/* BUTTON 1: GENERATE METADATA & SEO */}
                <div
                  style={{
                    padding: '10px',
                    borderRadius: '8px',
                    background: 'var(--theme-elevation-150, #21262d)',
                    border: '1px solid var(--theme-border-color, #30363d)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        color: '#58a6ff',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      ⚡ 1. Metadata & SEO
                    </span>
                    <span style={{ fontSize: '10px', color: 'var(--theme-text-muted, #8b949e)' }}>
                      Title • Slug • SEO • OG
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleGenerateMetadata}
                    disabled={metaLoading}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: 'none',
                      background: metaLoading
                        ? '#1f3557'
                        : 'linear-gradient(135deg, #1f6feb 0%, #238636 100%)',
                      color: '#ffffff',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: metaLoading ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      transition: 'opacity 0.15s ease',
                    }}
                  >
                    {metaLoading ? (
                      <>
                        <span
                          style={{
                            display: 'inline-block',
                            width: '12px',
                            height: '12px',
                            border: '2px solid rgba(255,255,255,0.3)',
                            borderTopColor: '#ffffff',
                            borderRadius: '50%',
                            animation: 'ai-spin 0.7s linear infinite',
                          }}
                        />
                        Analyzing Content...
                      </>
                    ) : (
                      'Generate Metadata & SEO'
                    )}
                  </button>

                  {metaError && (
                    <div
                      style={{
                        padding: '6px 8px',
                        borderRadius: '5px',
                        background: 'rgba(248, 81, 73, 0.12)',
                        border: '1px solid rgba(248, 81, 73, 0.3)',
                        color: '#f85149',
                        fontSize: '10px',
                        lineHeight: 1.4,
                      }}
                    >
                      ✕ {metaError}
                    </div>
                  )}

                  {metaResult && (
                    <div
                      style={{
                        marginTop: '4px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                        padding: '8px',
                        borderRadius: '6px',
                        background: 'rgba(0,0,0,0.2)',
                        border: '1px solid rgba(56, 139, 253, 0.25)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '10px', fontWeight: 700, color: '#3fb950' }}>
                          ✓ Generated Suggestions
                        </span>
                        <button
                          type="button"
                          onClick={applyAllMetadata}
                          style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            border: 'none',
                            background: '#238636',
                            color: '#fff',
                            fontSize: '10px',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          🚀 Apply All
                        </button>
                      </div>

                      {metaResult.title && (
                        <FieldChip
                          label="Headline"
                          value={metaResult.title}
                          applied={!!appliedMeta['title']}
                          onApply={() => applyField('title', metaResult.title)}
                        />
                      )}
                      {metaResult.slug && (
                        <FieldChip
                          label="Slug"
                          value={metaResult.slug}
                          applied={!!appliedMeta['slug']}
                          onApply={() => applyField('slug', metaResult.slug)}
                        />
                      )}
                      {metaResult.standfirst && (
                        <FieldChip
                          label="Excerpt"
                          value={metaResult.standfirst}
                          applied={!!appliedMeta['standfirst']}
                          onApply={() => applyField('standfirst', metaResult.standfirst)}
                        />
                      )}
                      {metaResult.sectionName && (
                        <FieldChip
                          label="Category"
                          value={metaResult.sectionName}
                          applied={!!appliedMeta['section']}
                          onApply={() => applyField('section', metaResult.section)}
                        />
                      )}
                      {metaResult.regionNames && metaResult.regionNames.length > 0 && (
                        <FieldChip
                          label="Region"
                          value={metaResult.regionNames.join(', ')}
                          applied={!!appliedMeta['regions']}
                          onApply={() => applyField('regions', metaResult.regions)}
                        />
                      )}
                      {metaResult.metaTitle && (
                        <FieldChip
                          label="SEO Title"
                          value={metaResult.metaTitle}
                          applied={!!appliedMeta['metaTitle']}
                          onApply={() => applyField('metaTitle', metaResult.metaTitle)}
                        />
                      )}
                      {metaResult.metaDescription && (
                        <FieldChip
                          label="SEO Description"
                          value={metaResult.metaDescription}
                          applied={!!appliedMeta['metaDescription']}
                          onApply={() => applyField('metaDescription', metaResult.metaDescription)}
                        />
                      )}
                    </div>
                  )}
                </div>

                {/* BUTTON 2: FIND COVER PHOTO (WIKIMEDIA COMMONS - NO GENERATED IMAGES) */}
                <div
                  style={{
                    padding: '10px',
                    borderRadius: '8px',
                    background: 'var(--theme-elevation-150, #21262d)',
                    border: '1px solid var(--theme-border-color, #30363d)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        color: '#3fb950',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      🖼️ 2. Get Cover Photo
                    </span>
                    <span style={{ fontSize: '10px', color: 'var(--theme-text-muted, #8b949e)' }}>
                      Real Press Photo (Wikimedia)
                    </span>
                  </div>

                  {/* Search Keyword override input */}
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <input
                      type="text"
                      placeholder={
                        photoKeyword
                          ? `Subject: ${photoKeyword}`
                          : 'Search subject (e.g. person, landmark, company)'
                      }
                      value={photoKeyword}
                      onChange={(e) => setPhotoKeyword(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleFindCoverPhoto();
                        }
                      }}
                      disabled={coverLoading}
                      style={{
                        flex: 1,
                        padding: '6px 8px',
                        borderRadius: '5px',
                        border: '1px solid var(--theme-border-color, #30363d)',
                        background: 'var(--theme-elevation-200, #0d1117)',
                        color: 'var(--theme-text-color, #f0f6fc)',
                        fontSize: '11px',
                      }}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleFindCoverPhoto}
                    disabled={coverLoading}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: 'none',
                      background: coverLoading ? '#1a4731' : '#238636',
                      color: '#ffffff',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: coverLoading ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      transition: 'opacity 0.15s ease',
                    }}
                  >
                    {coverLoading ? (
                      <>
                        <span
                          style={{
                            display: 'inline-block',
                            width: '12px',
                            height: '12px',
                            border: '2px solid rgba(255,255,255,0.3)',
                            borderTopColor: '#ffffff',
                            borderRadius: '50%',
                            animation: 'ai-spin 0.7s linear infinite',
                          }}
                        />
                        Searching Press Photos...
                      </>
                    ) : (
                      'Find Real Cover Photo'
                    )}
                  </button>

                  {coverError && (
                    <div
                      style={{
                        padding: '6px 8px',
                        borderRadius: '5px',
                        background: 'rgba(248, 81, 73, 0.12)',
                        border: '1px solid rgba(248, 81, 73, 0.3)',
                        color: '#f85149',
                        fontSize: '10px',
                        lineHeight: 1.4,
                      }}
                    >
                      ✕ {coverError}
                    </div>
                  )}

                  {coverResult && (
                    <div
                      style={{
                        marginTop: '4px',
                        padding: '8px',
                        borderRadius: '6px',
                        background: 'rgba(0,0,0,0.2)',
                        border: '1px solid rgba(46, 160, 67, 0.3)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                      }}
                    >
                      {coverResult.imageUrl && (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={coverResult.imageUrl}
                          alt={coverResult.alt || 'Cover photo preview'}
                          style={{
                            width: '100%',
                            maxHeight: '130px',
                            objectFit: 'cover',
                            borderRadius: '5px',
                            border: '1px solid var(--theme-border-color, #30363d)',
                          }}
                        />
                      )}
                      <div style={{ fontSize: '10px', color: 'var(--theme-text-muted, #8b949e)', lineHeight: 1.3 }}>
                        {coverResult.credit || 'Wikimedia Commons Press Photo'}
                      </div>

                      <button
                        type="button"
                        onClick={applyCoverPhoto}
                        disabled={coverApplied}
                        style={{
                          padding: '6px 10px',
                          borderRadius: '5px',
                          border: 'none',
                          background: coverApplied ? '#2ea043' : '#1f6feb',
                          color: '#fff',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: coverApplied ? 'default' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px',
                        }}
                      >
                        {coverApplied ? '✓ Attached to Cover & OG Image' : '🖼️ Attach to Cover & OG Image'}
                      </button>
                    </div>
                  )}
                </div>

                {/* Optional URL Scraper Collapsible */}
                <div style={{ borderTop: '1px solid var(--theme-border-color, #30363d)', paddingTop: '6px' }}>
                  <button
                    type="button"
                    onClick={() => setShowImporter((prev) => !prev)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--theme-text-muted, #8b949e)',
                      fontSize: '10px',
                      cursor: 'pointer',
                      padding: 0,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <span>{showImporter ? '▾' : '▸'}</span>
                    <span>Optional: Import from external news URL</span>
                  </button>

                  {showImporter && (
                    <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <input
                        type="text"
                        placeholder="Paste article URL to import..."
                        value={importUrl}
                        onChange={(e) => setImportUrl(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '6px 8px',
                          borderRadius: '5px',
                          border: '1px solid var(--theme-border-color, #30363d)',
                          background: 'var(--theme-elevation-200, #0d1117)',
                          color: 'var(--theme-text-color, #f0f6fc)',
                          fontSize: '11px',
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleImportUrl}
                        disabled={importLoading || !importUrl.trim()}
                        style={{
                          padding: '6px 10px',
                          borderRadius: '5px',
                          border: 'none',
                          background: '#21262d',
                          color: '#c9d1d9',
                          fontSize: '10px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        {importLoading ? 'Importing...' : 'Fetch & Populate'}
                      </button>
                      {importMsg && (
                        <div
                          style={{
                            fontSize: '10px',
                            color: importMsg.startsWith('✓') ? '#3fb950' : '#f85149',
                          }}
                        >
                          {importMsg}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </>,
        document.body,
      );
};

function FieldChip({
  label,
  value,
  applied,
  onApply,
}: {
  label: string;
  value: string;
  applied: boolean;
  onApply: () => void;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: '6px',
        padding: '5px 7px',
        borderRadius: '4px',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: '9px',
            fontWeight: 700,
            textTransform: 'uppercase',
            color: 'var(--theme-text-muted, #8b949e)',
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontSize: '11px',
            color: 'var(--theme-text-color, #f0f6fc)',
            wordBreak: 'break-word',
            lineHeight: 1.3,
            marginTop: '2px',
          }}
        >
          {value}
        </div>
      </div>
      <button
        type="button"
        onClick={onApply}
        disabled={applied}
        style={{
          padding: '3px 6px',
          borderRadius: '4px',
          border: 'none',
          background: applied ? 'rgba(46, 160, 67, 0.2)' : '#1f6feb',
          color: applied ? '#3fb950' : '#fff',
          fontSize: '10px',
          fontWeight: 600,
          cursor: applied ? 'default' : 'pointer',
          flexShrink: 0,
        }}
      >
        {applied ? '✓' : 'Apply'}
      </button>
    </div>
  );
}

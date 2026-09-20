import React, { Fragment, JSX } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getMediaUrl } from '@/lib/utils';
import { QuoteHighlight } from './quote-highlight';

type Node = {
  type: string;
  value?: any;
  text?: string;
  children?: Node[];
  tag?: string;
  format?: number;
  [key: string]: any;
};

export function getYouTubeVideoId(url: string): string | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  const match = trimmed.match(
    /(?:https?:\/\/)?(?:www\.|m\.)?(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i,
  );
  return match ? match[1] : null;
}

function YouTubeEmbed({ videoId, keyName }: { videoId: string; keyName: string }) {
  return (
    <figure key={keyName} className="my-8 rounded-xl overflow-hidden shadow-lg border border-[var(--border)] bg-black">
      <div className="relative w-full aspect-video" style={{ aspectRatio: '16 / 9' }}>
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${videoId}`}
          title="YouTube video player"
          className="absolute inset-0 w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          loading="lazy"
        />
      </div>
    </figure>
  );
}

export function serializeLexical(nodes: Node[], keyPrefix = 'node'): JSX.Element[] {
  return nodes.map((node, i) => {
    const nodeKey = `${keyPrefix}-${i}`;

    if (!node) return null as any;

    if (node.type === 'text') {
      let text = <Fragment key={nodeKey}>{node.text}</Fragment>;

      if ((node.format || 0) & 1) {
        text = <strong key={nodeKey}>{text}</strong>;
      }
      if ((node.format || 0) & 2) {
        text = <em key={nodeKey}>{text}</em>;
      }
      if ((node.format || 0) & 4) {
        text = <u key={nodeKey}>{text}</u>;
      }
      if ((node.format || 0) & 8) {
        text = <s key={nodeKey}>{text}</s>;
      }
      if ((node.format || 0) & 16) {
        text = <code key={nodeKey}>{text}</code>;
      }

      return text as any;
    }

    // Check if the paragraph represents a standalone YouTube video embed
    if (node.type === 'paragraph') {
      // 1. Single link or autolink child with YouTube URL
      if (node.children?.length === 1 && (node.children[0].type === 'link' || node.children[0].type === 'autolink')) {
        const linkUrl = node.children[0].fields?.url || node.children[0].url || '';
        const videoId = getYouTubeVideoId(linkUrl);
        if (videoId) {
          return <YouTubeEmbed key={nodeKey} videoId={videoId} keyName={nodeKey} />;
        }
      }

      // 2. Plain text child containing solely a YouTube URL
      const textOnly = node.children?.map((c) => c.text || '').join('').trim() || '';
      if (textOnly && /^https?:\/\/[^\s]+$/.test(textOnly)) {
        const directVideoId = getYouTubeVideoId(textOnly);
        if (directVideoId) {
          return <YouTubeEmbed key={nodeKey} videoId={directVideoId} keyName={nodeKey} />;
        }
      }
    }

    const children = node.children ? serializeLexical(node.children, `${nodeKey}-c`) : null;

    const headingTag = node.type === 'heading' ? node.tag : node.type;

    switch (headingTag) {
      case 'h1':
      case 'h2':
        return (
          <h2 key={nodeKey} className="font-serif font-bold text-2xl sm:text-3xl mb-3 mt-8 text-[var(--ink)]">
            {children}
          </h2>
        );
      case 'h3':
        return (
          <h3 key={nodeKey} className="font-serif font-bold text-xl sm:text-2xl mb-3 mt-6 text-[var(--ink)]">
            {children}
          </h3>
        );
      case 'h4':
        return (
          <h4 key={nodeKey} className="font-serif font-bold text-lg sm:text-xl mb-2 mt-5 text-[var(--ink)]">
            {children}
          </h4>
        );
      case 'quote':
        return (
          <QuoteHighlight key={nodeKey} node={node} nodeKey={nodeKey}>
            {children}
          </QuoteHighlight>
        );
      case 'autolink':
      case 'link': {
        const linkUrl = node.fields?.url || node.url || '#';
        return (
          <Link
            key={nodeKey}
            href={linkUrl}
            className="underline underline-offset-3 font-medium text-[var(--global)]"
            target={node.fields?.newTab ? '_blank' : undefined}
            rel={node.fields?.newTab ? 'noopener noreferrer' : undefined}
          >
            {children}
          </Link>
        );
      }
      case 'upload': {
        const media = node.value;
        if (!media || node.relationTo !== 'media') return null as any;
        const mediaUrl = getMediaUrl(media, '');
        if (!mediaUrl) return null as any;

        return (
          <figure key={nodeKey} className="my-8">
            <Image
              src={mediaUrl}
              alt={media.alt || 'Globdot media'}
              width={media.width || 1200}
              height={media.height || 800}
              className="w-full h-auto object-cover"
            />
            {media.caption && (
              <figcaption className="text-sm mt-2 text-[var(--muted)] font-serif italic">
                {media.caption} {media.credit && <span>(Credit: {media.credit})</span>}
              </figcaption>
            )}
          </figure>
        );
      }
      case 'list': {
        const ListTag = node.tag === 'ol' ? 'ol' : 'ul';
        return (
          <ListTag
            key={nodeKey}
            className={`${node.tag === 'ol' ? 'list-decimal' : 'list-disc'} pl-6 mb-5 space-y-2 text-[var(--ink)]`}
          >
            {children}
          </ListTag>
        );
      }
      case 'listitem':
        return (
          <li key={nodeKey} className="leading-relaxed">
            {children}
          </li>
        );
      case 'horizontalrule':
        return <hr key={nodeKey} className="my-8 border-t border-[var(--border)]" />;
      case 'linebreak':
        return <br key={nodeKey} />;
      case 'tab':
        return <span key={nodeKey}>&emsp;</span>;
      case 'paragraph': {
        const paragraphText = node.children?.map((child) => child.text || '').join('').trim() || '';
        const paragraphClass = paragraphText.startsWith('Q:')
          ? 'article-paragraph qa-question'
          : paragraphText.startsWith('A:')
            ? 'article-paragraph qa-answer'
            : 'article-paragraph';
        return (
          <p key={nodeKey} className={paragraphClass}>
            {children}
          </p>
        );
      }
      default:
        return <Fragment key={nodeKey}>{children}</Fragment>;
    }
  }) as any;
}

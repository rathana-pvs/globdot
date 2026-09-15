import React, { Fragment, JSX } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getMediaUrl } from '@/lib/utils';

type Node = {
  type: string;
  value?: any;
  text?: string;
  children?: Node[];
  tag?: string;
  format?: number;
  [key: string]: any;
};

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
          <blockquote
            key={nodeKey}
            className="border-l-4 pl-4 py-2.5 my-6 text-lg leading-relaxed italic bg-[var(--surface)] border-[var(--signal)] text-[#222]"
          >
            {children}
          </blockquote>
        );
      case 'link':
        return (
          <Link
            key={nodeKey}
            href={node.fields?.url || '#'}
            className="underline underline-offset-3 font-medium text-[var(--global)]"
          >
            {children}
          </Link>
        );
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
      case 'paragraph':
      default: {
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
    }
  }) as any;
}

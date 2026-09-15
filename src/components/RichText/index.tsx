import React from 'react';
import { serializeLexical } from './serialize';

export type RichTextProps = {
  content: any;
  className?: string;
};

export const RichText = ({ content, className }: RichTextProps) => {
  if (!content) return null;

  // Lexical content structure: { root: { children: [...] } }
  const rawNodes = content.root?.children || [];
  if (!rawNodes || rawNodes.length === 0) return null;

  return (
    <div className={`article-prose ${className || ''}`}>
      {serializeLexical(rawNodes, 'article')}
    </div>
  );
};

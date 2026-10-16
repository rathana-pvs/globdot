export type ArticleRichTextNode = {
  type: string;
  children?: ArticleRichTextNode[];
  text?: string;
  [key: string]: any;
};

export function hasParagraphText(node: ArticleRichTextNode): boolean {
  return Boolean(node.text?.trim()) || Boolean(node.children?.some(hasParagraphText));
}

/** Repair pasted paragraphs separated by blank lines without changing stored nodes. */
export function normalizeArticleParagraphs<T extends ArticleRichTextNode>(nodes: T[]): T[] {
  return nodes.flatMap((node): T[] => {
    if (node?.type !== 'paragraph' || !node.children) return [node];

    const groups: ArticleRichTextNode[][] = [];
    let group: ArticleRichTextNode[] = [];
    let foundSeparator = false;

    for (let i = 0; i < node.children.length; i += 1) {
      const child = node.children[i];
      if (child.type !== 'linebreak') {
        group.push(child);
        continue;
      }

      // Editors may put empty text nodes or spaces between consecutive breaks.
      let end = i;
      let breaks = 0;
      while (end < node.children.length) {
        const candidate = node.children[end];
        if (candidate.type === 'linebreak') breaks += 1;
        else if (candidate.type !== 'text' || candidate.text?.trim()) break;
        end += 1;
      }

      if (breaks < 2) {
        group.push(child);
        continue;
      }

      foundSeparator = true;
      if (group.some(hasParagraphText)) groups.push(group);
      group = [];
      i = end - 1;
    }

    if (!foundSeparator) return [node];
    if (group.some(hasParagraphText)) groups.push(group);
    // Retain an intentionally empty editor paragraph instead of deleting it.
    if (groups.length === 0) return [node];
    return groups.map((children) => ({ ...node, children }));
  });
}

import assert from 'node:assert/strict';
import { serializeLexical } from '../src/components/RichText/serialize';
import { AdskeeperWidget } from '../src/components/adskeeper-widget';
import {
  normalizeArticleParagraphs,
  type ArticleRichTextNode,
} from '../src/lib/normalize-article-paragraphs';

const text = (value: string, format = 0): ArticleRichTextNode => ({ type: 'text', text: value, format });
const br: ArticleRichTextNode = { type: 'linebreak' };
const paragraph = (...children: ArticleRichTextNode[]): ArticleRichTextNode => ({
  type: 'paragraph', version: 1, format: '', indent: 0, direction: null, children,
});
const options = { enableAds: true, isTopLevel: true };
const adIds = (nodes: ArticleRichTextNode[], enableAds = true) => serializeLexical(
  nodes, 'article', { ...options, enableAds }
).filter((el) => el.type === AdskeeperWidget).map((el) => (el.props as any).widgetId);

// Reproduce the affected article: several visual paragraphs in one Lexical node.
const link = { type: 'link', fields: { url: 'https://example.com' }, children: [text('source')] };
const imported = [paragraph(
  text('First paragraph'), br, br,
  text('Second ', 1), link, br, text('single line break'), br, br,
  text('Third paragraph'), br, br,
  text('Fourth paragraph'),
)];
const original = JSON.stringify(imported);
const normalized = normalizeArticleParagraphs(imported);
assert.equal(normalized.length, 4);
assert.equal(JSON.stringify(imported), original, 'Normalization must not mutate content');
assert.deepEqual(normalizeArticleParagraphs(normalized), normalized, 'Normalization is idempotent');
assert.equal(normalized[1].children?.[0].format, 1, 'Keep bold formatting');
assert.equal(normalized[1].children?.[1], link, 'Keep links and their metadata');
assert.equal(normalized[1].children?.[2], br, 'Keep single line breaks');
assert.deepEqual(adIds(imported), ['2092312', '2092316']);

const rendered = serializeLexical(imported, 'article', options);
assert.deepEqual(rendered.map((el) => el.type === AdskeeperWidget ? 'ad' : el.type),
  ['p', 'ad', 'p', 'p', 'ad', 'p']);
assert.deepEqual(adIds(imported, false), [], 'Respect disabled ads');
assert.deepEqual(adIds([paragraph(text('Only paragraph'))]), [], 'Do not stack with the bottom feed');
assert.deepEqual(adIds(normalized.slice(0, 3)), ['2092312'], 'Keep the second ad before remaining text');
assert.deepEqual(adIds([paragraph(), ...normalized]), ['2092312', '2092316'], 'Skip empty paragraphs');

const spaced = [paragraph(br, br, text('First'), br, text(' '), br, br, text('Second'), br, br)];
assert.equal(normalizeArticleParagraphs(spaced).length, 2, 'Handle whitespace and repeated breaks');
const quote = { type: 'quote', children: imported };
assert.equal(normalizeArticleParagraphs([quote])[0], quote, 'Leave nested structures alone');
assert.equal(normalizeArticleParagraphs([paragraph(br, br)]).length, 1, 'Keep empty editor nodes');

const video = paragraph(text('https://www.youtube.com/watch?v=dQw4w9WgXcQ'));
assert.deepEqual(adIds([video, ...normalized]), ['2092312', '2092316'], 'Videos do not count as paragraphs');

console.log('Article normalization and ad placement checks passed.');

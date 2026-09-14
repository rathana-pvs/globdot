import { getPublishedStories } from '@/lib/content';

const escapeXml = (value: string) => value.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&apos;');
export async function GET() {
  const stories = await getPublishedStories(50);
  const items = stories.map((story) => `<item><title>${escapeXml(story.title)}</title><link>https://globdot.com/article/${escapeXml(story.slug)}</link><guid>https://globdot.com/article/${escapeXml(story.slug)}</guid><description>${escapeXml(story.standfirst)}</description>${story.publishedAt ? `<pubDate>${new Date(story.publishedAt).toUTCString()}</pubDate>` : ''}<category>${escapeXml(story.section.name)}</category></item>`).join('');
  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Globdot</title><link>https://globdot.com</link><description>One world. Every angle.</description><language>en</language>${items}</channel></rss>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8', 'Cache-Control': 'public, max-age=300' } });
}

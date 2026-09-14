import { and, asc, desc, eq, like, or } from 'drizzle-orm';
import { getDb } from '@/db';
import { articleAuthors, articleRegions, articles, authors, liveBlogs, liveUpdates, regions, sections } from '@/db/schema';

export type Story = {
  id: number;
  slug: string;
  title: string;
  standfirst: string;
  body: string[];
  section: { name: string; slug: string; color: string };
  author: string;
  dateline: string | null;
  publishedAt: string | null;
  readTime: number;
  isBreaking: boolean;
  isFeatured: boolean;
  homepageSlot: string | null;
  keyPoints: string[];
  correctionNote: string | null;
};

type StoryRow = {
  article: typeof articles.$inferSelect;
  section: Pick<typeof sections.$inferSelect, 'name' | 'slug' | 'color'>;
  author: string | null;
};

function parseStringArray(value: string | null): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed.filter((item): item is string => typeof item === 'string');
    if (Array.isArray(parsed?.paragraphs)) return parsed.paragraphs.filter((item: unknown): item is string => typeof item === 'string');
  } catch {}
  return [];
}

function toStory(row: StoryRow): Story {
  return {
    id: row.article.id,
    slug: row.article.slug,
    title: row.article.title,
    standfirst: row.article.standfirst,
    body: parseStringArray(row.article.bodyJson),
    section: row.section,
    author: row.author || 'Globdot News Desk',
    dateline: row.article.dateline,
    publishedAt: row.article.publishedAt,
    readTime: row.article.readTimeMinutes,
    isBreaking: row.article.isBreaking,
    isFeatured: row.article.isFeatured,
    homepageSlot: row.article.homepageSlot,
    keyPoints: parseStringArray(row.article.keyPointsJson),
    correctionNote: row.article.correctionNote,
  };
}

const storySelection = {
  article: articles,
  section: { name: sections.name, slug: sections.slug, color: sections.color },
  author: authors.name,
};

export async function getPublishedStories(limit = 20): Promise<Story[]> {
  const db = getDb();
  const rows = await db.select(storySelection).from(articles)
    .innerJoin(sections, eq(articles.sectionId, sections.id))
    .leftJoin(articleAuthors, and(eq(articleAuthors.articleId, articles.id), eq(articleAuthors.position, 0)))
    .leftJoin(authors, eq(articleAuthors.authorId, authors.id))
    .where(eq(articles.status, 'published')).orderBy(desc(articles.publishedAt)).limit(limit);
  return rows.map(toStory);
}

export async function getStoryBySlug(slug: string): Promise<Story | null> {
  const db = getDb();
  const rows = await db.select(storySelection).from(articles)
    .innerJoin(sections, eq(articles.sectionId, sections.id))
    .leftJoin(articleAuthors, and(eq(articleAuthors.articleId, articles.id), eq(articleAuthors.position, 0)))
    .leftJoin(authors, eq(articleAuthors.authorId, authors.id))
    .where(and(eq(articles.slug, slug), eq(articles.status, 'published'))).limit(1);
  return rows[0] ? toStory(rows[0]) : null;
}

export async function getStoriesBySection(slug: string, limit = 24): Promise<{ name: string; description: string | null; stories: Story[] } | null> {
  const db = getDb();
  const section = await db.select().from(sections).where(and(eq(sections.slug, slug), eq(sections.isVisible, true))).limit(1);
  if (!section[0]) return null;
  const rows = await db.select(storySelection).from(articles)
    .innerJoin(sections, eq(articles.sectionId, sections.id))
    .leftJoin(articleAuthors, and(eq(articleAuthors.articleId, articles.id), eq(articleAuthors.position, 0)))
    .leftJoin(authors, eq(articleAuthors.authorId, authors.id))
    .where(and(eq(articles.status, 'published'), eq(sections.slug, slug))).orderBy(desc(articles.publishedAt)).limit(limit);
  return { name: section[0].name, description: section[0].description, stories: rows.map(toStory) };
}

export async function getStoriesByRegion(slug: string, limit = 24): Promise<{ name: string; stories: Story[] } | null> {
  const db = getDb();
  const region = await db.select().from(regions).where(and(eq(regions.slug, slug), eq(regions.isVisible, true))).limit(1);
  if (!region[0]) return null;
  const rows = await db.select(storySelection).from(articles)
    .innerJoin(sections, eq(articles.sectionId, sections.id))
    .innerJoin(articleRegions, eq(articleRegions.articleId, articles.id))
    .leftJoin(articleAuthors, and(eq(articleAuthors.articleId, articles.id), eq(articleAuthors.position, 0)))
    .leftJoin(authors, eq(articleAuthors.authorId, authors.id))
    .where(and(eq(articles.status, 'published'), eq(articleRegions.regionId, region[0].id))).orderBy(desc(articles.publishedAt)).limit(limit);
  return { name: region[0].name, stories: rows.map(toStory) };
}

export async function searchStories(query: string, limit = 30): Promise<Story[]> {
  const db = getDb();
  const term = `%${query.trim().replaceAll('%', '').replaceAll('_', '')}%`;
  if (term === '%%') return [];
  const rows = await db.select(storySelection).from(articles)
    .innerJoin(sections, eq(articles.sectionId, sections.id))
    .leftJoin(articleAuthors, and(eq(articleAuthors.articleId, articles.id), eq(articleAuthors.position, 0)))
    .leftJoin(authors, eq(articleAuthors.authorId, authors.id))
    .where(and(eq(articles.status, 'published'), or(like(articles.title, term), like(articles.standfirst, term))))
    .orderBy(desc(articles.publishedAt)).limit(limit);
  return rows.map(toStory);
}

export async function getLiveCoverage() {
  const db = getDb();
  const blog = await db.select().from(liveBlogs).where(eq(liveBlogs.status, 'live')).orderBy(desc(liveBlogs.startedAt)).limit(1);
  if (!blog[0]) return null;
  const updates = await db.select({ update: liveUpdates, author: authors.name }).from(liveUpdates)
    .leftJoin(authors, eq(liveUpdates.authorId, authors.id))
    .where(eq(liveUpdates.liveBlogId, blog[0].id)).orderBy(desc(liveUpdates.isPinned), desc(liveUpdates.publishedAt));
  return { ...blog[0], updates: updates.map(({ update, author }) => ({ ...update, author: author || 'Globdot News Desk', body: parseStringArray(update.bodyJson) })) };
}

export async function getNavigation() {
  const db = getDb();
  return db.select({ name: sections.name, slug: sections.slug }).from(sections)
    .where(eq(sections.isVisible, true)).orderBy(asc(sections.sortOrder));
}

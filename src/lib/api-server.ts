import { getPayloadClient } from './payload';
import { unstable_cache } from 'next/cache';

export type ArticleDoc = any;

const publicationWhere: any = { status: { equals: 'published' } };

export const getPublishedArticles = unstable_cache(
  async (limit = 20): Promise<ArticleDoc[]> => {
    try {
      const payload = await getPayloadClient();
      const result = await payload.find({
        collection: 'articles',
        where: publicationWhere,
        limit,
        depth: 2,
        sort: '-publishedAt',
      });
      return result.docs;
    } catch (e) {
      console.warn('Postgres connection failed in getPublishedArticles:', e);
      return [];
    }
  },
  ['published-articles'],
  { tags: ['articles'], revalidate: 60 }
);

export const getArticleBySlug = unstable_cache(
  async (slug: string): Promise<ArticleDoc | null> => {
    try {
      const payload = await getPayloadClient();
      const result = await payload.find({
        collection: 'articles',
        where: { and: [{ slug: { equals: slug } }, publicationWhere] },
        limit: 1,
        depth: 2,
      });
      return result.docs[0] || null;
    } catch (e) {
      console.warn(`Failed to fetch article slug=${slug}:`, e);
      return null;
    }
  },
  ['article-by-slug'],
  { tags: ['articles'], revalidate: 60 }
);

export const getArticlesBySection = unstable_cache(
  async (sectionSlug: string, limit = 24) => {
    try {
      const payload = await getPayloadClient();
      const sectionRes = await payload.find({
        collection: 'sections',
        where: { slug: { equals: sectionSlug }, isVisible: { equals: true } },
        limit: 1,
      });
      const section = sectionRes.docs[0];
      if (!section) return null;

      const articlesRes = await payload.find({
        collection: 'articles',
        where: { and: [{ section: { equals: section.id } }, publicationWhere] },
        limit,
        depth: 2,
        sort: '-publishedAt',
      });

      return {
        name: section.name,
        description: section.description,
        color: section.color,
        stories: articlesRes.docs,
      };
    } catch (e) {
      console.warn(`Failed to fetch section=${sectionSlug}:`, e);
      return null;
    }
  },
  ['articles-by-section'],
  { tags: ['articles', 'sections'], revalidate: 60 }
);

export const getArticlesByRegion = unstable_cache(
  async (regionSlug: string, limit = 24) => {
    try {
      const payload = await getPayloadClient();
      const regionRes = await payload.find({
        collection: 'regions',
        where: { slug: { equals: regionSlug }, isVisible: { equals: true } },
        limit: 1,
      });
      const region = regionRes.docs[0];
      if (!region) return null;

      const articlesRes = await payload.find({
        collection: 'articles',
        where: { and: [{ regions: { contains: region.id } }, publicationWhere] },
        limit,
        depth: 2,
        sort: '-publishedAt',
      });

      return {
        name: region.name,
        description: region.description,
        stories: articlesRes.docs,
      };
    } catch (e) {
      console.warn(`Failed to fetch region=${regionSlug}:`, e);
      return null;
    }
  },
  ['articles-by-region'],
  { tags: ['articles', 'regions'], revalidate: 60 }
);

export const searchArticles = async (query: string, limit = 30): Promise<ArticleDoc[]> => {
  if (!query.trim()) return [];
  try {
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: 'articles',
      where: {
        and: [
          publicationWhere,
          {
            or: [
              { title: { contains: query } },
              { standfirst: { contains: query } },
            ],
          },
        ],
      },
      limit,
      depth: 2,
      sort: '-publishedAt',
    });
    return result.docs;
  } catch (e) {
    console.warn(`Failed search query=${query}:`, e);
    return [];
  }
};

export const getLiveCoverage = async () => {
  try {
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: 'live-blogs',
      where: { status: { equals: 'live' } },
      limit: 1,
      depth: 2,
      sort: '-startedAt',
    });
    return result.docs[0] || null;
  } catch (e) {
    console.warn('Failed to fetch live coverage:', e);
    return null;
  }
};

export const getNavigationSections = unstable_cache(
  async () => {
    try {
      const payload = await getPayloadClient();
      const res = await payload.find({
        collection: 'sections',
        where: { isVisible: { equals: true } },
        sort: 'sortOrder',
        limit: 20,
      });
      return res.docs.map((d: any) => ({ name: d.name, slug: d.slug }));
    } catch {
      return [
        { name: 'Politics', slug: 'politics' },
        { name: 'War & Tension', slug: 'war-tension' },
        { name: 'Climate', slug: 'climate' },
        { name: 'Tech', slug: 'tech' },
        { name: 'Other', slug: 'other' },
      ];
    }
  },
  ['navigation-sections'],
  { tags: ['sections'], revalidate: 300 }
);

export const getAllRegions = unstable_cache(
  async () => {
    try {
      const payload = await getPayloadClient();
      const res = await payload.find({
        collection: 'regions',
        where: { isVisible: { equals: true } },
        sort: 'sortOrder',
        limit: 20,
      });
      return res.docs;
    } catch (e) {
      console.warn('Failed to fetch regions:', e);
      return [
        { id: 1, name: 'Americas', slug: 'americas', description: 'Dispatches, governance, and policy from North, Central, and South America.' },
        { id: 2, name: 'Asia', slug: 'asia', description: 'Technological shifts, supply chain economics, and geopolitical dynamics across the Asia-Pacific.' },
        { id: 3, name: 'Europe', slug: 'europe', description: 'Institutional developments, diplomatic treaties, and cross-border security across Europe.' },
        { id: 4, name: 'Middle East', slug: 'middle-east', description: 'Energy transition, regional security pacts, and economic diversification across the Gulf and Levant.' },
        { id: 5, name: 'Africa', slug: 'africa', description: 'Ecosystem adaptation, emerging digital infrastructure, and trade agreements across the African continent.' },
        { id: 6, name: 'Oceania', slug: 'oceania', description: 'Pacific maritime boundaries, ecological resilience, and resource governance.' },
      ];
    }
  },
  ['all-regions'],
  { tags: ['regions'], revalidate: 300 }
);


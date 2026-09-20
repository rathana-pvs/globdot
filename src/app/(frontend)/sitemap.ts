import type { MetadataRoute } from 'next';
import { getPublishedArticles } from '@/lib/api-server';

export const dynamic = 'force-dynamic';
const origin = process.env.NEXT_PUBLIC_SITE_URL || 'https://globdot.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const stories = await getPublishedArticles(1000);
  const staticPaths = [
    '',
    '/about',
    '/masthead',
    '/regions',
    '/contact',
    '/corrections',
    '/editorial-standards',
    '/privacy',
    '/search',
    '/terms',
  ];
  const sectionPaths = [
    'politics',
    'war-tension',
    'climate',
    'tech',
    'other',
  ].map((slug) => `/section/${slug}`);
  const regionPaths = [
    'americas',
    'asia',
    'europe',
    'middle-east',
    'africa',
    'oceania',
  ].map((slug) => `/region/${slug}`);

  const pages: MetadataRoute.Sitemap = [
    ...staticPaths,
    ...sectionPaths,
    ...regionPaths,
  ].map((path) => ({
    url: `${origin}${path}`,
    changeFrequency: path === '' ? 'hourly' : 'daily',
    priority: path === '' ? 1 : 0.7,
  }));

  const cleanStories = stories.filter(
    (story) =>
      story?.slug &&
      !story.slug.endsWith('-test') &&
      !story.slug.includes('-test-') &&
      !story.title?.toLowerCase().includes('[test]')
  );

  return pages.concat(
    cleanStories.map((story) => ({
      url: `${origin}/article/${story.slug}`,
      lastModified: story.publishedAt ? new Date(story.publishedAt) : undefined,
      changeFrequency: 'daily' as const,
      priority: 0.8,
    }))
  );
}

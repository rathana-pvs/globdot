import type { MetadataRoute } from 'next';
import { getPublishedStories } from '@/lib/content';

export const dynamic = 'force-dynamic';
const origin = 'https://globdot.com';
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const stories = await getPublishedStories(1000);
  const staticPaths = ['', '/about', '/contact', '/corrections', '/editorial-standards', '/live', '/privacy', '/search'];
  const sectionPaths = ['world','politics','business','technology','climate','culture','security','analysis','video'].map((slug) => `/section/${slug}`);
  const regionPaths = ['africa','americas','asia','europe','middle-east','oceania'].map((slug) => `/region/${slug}`);
  const pages: MetadataRoute.Sitemap = [...staticPaths, ...sectionPaths, ...regionPaths].map((path) => ({ url: `${origin}${path}`, changeFrequency: path === '' ? 'hourly' : 'daily', priority: path === '' ? 1 : .7 }));
  return pages.concat(stories.map((story) => ({ url: `${origin}/article/${story.slug}`, lastModified: story.publishedAt ? new Date(story.publishedAt) : undefined, changeFrequency: 'daily' as const, priority: .8 })));
}

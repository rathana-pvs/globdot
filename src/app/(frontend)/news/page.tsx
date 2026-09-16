import type { Metadata } from 'next';
import Link from 'next/link';
import { StoryCard } from '@/components/story-card';
import { getPublishedArticles } from '@/lib/api-server';

export const dynamic = 'force-static';
export const revalidate = 60;

export const metadata: Metadata = {
  title: 'All news — Globdot',
  description: 'Browse the latest reporting, context, and analysis from every Globdot desk.',
};

const sections = [
  ['Politics', 'politics'],
  ['War & Tension', 'war-tension'],
  ['Climate', 'climate'],
  ['Tech', 'tech'],
  ['Other', 'other'],
];

export default async function NewsPage() {
  const stories = await getPublishedArticles(60);

  return (
    <main id="content" className="shell channel-page news-page">
      <header className="channel-header news-header">
        <span>Every desk · Every region</span>
        <h1>All news</h1>
        <p>The latest reporting, context, and analysis from across the Globdot newsroom.</p>
      </header>

      <nav className="section-links news-section-links" aria-label="Browse news categories">
        <Link className="active" href="/news">All news</Link>
        {sections.map(([name, slug]) => (
          <Link href={`/section/${slug}`} key={slug}>{name}</Link>
        ))}
      </nav>

      {stories.length > 0 ? (
        <section className="all-news-grid" aria-label="All published news">
          {stories.map((story: any) => (
            <StoryCard story={story} key={story.id} />
          ))}
        </section>
      ) : (
        <div className="empty-state">
          <h2>The newsroom is preparing today&apos;s report.</h2>
          <p>Check back shortly for the latest global coverage.</p>
        </div>
      )}
    </main>
  );
}

import type { Metadata } from 'next';
import { StoryCard } from '@/components/story-card';
import { searchArticles } from '@/lib/api-server';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'Search — Globdot',
  description: 'Search Globdot reporting, investigation, and analysis.',
};

type Props = { searchParams: Promise<{ q?: string }> };

export default async function SearchPage({ searchParams }: Props) {
  const query = (await searchParams).q?.trim() || '';
  const results = query ? await searchArticles(query) : [];

  return (
    <main id="content" className="shell search-page">
      <header className="channel-header">
        <span>Discover</span>
        <h1>Search Globdot</h1>
        <p>Find global reporting by subject, place, treaty, or event.</p>
      </header>

      <form className="search-form" action="/search">
        <label htmlFor="q">Search the newsroom</label>
        <div>
          <input
            id="q"
            name="q"
            defaultValue={query}
            placeholder="Try “climate”, “markets”, “water”, or “Pacific”"
          />
          <button type="submit">Search</button>
        </div>
      </form>

      {query && (
        <section className="search-results">
          <div className="section-title">
            <p>{results.length} results</p>
            <h2>Results for “{query}”</h2>
          </div>
          {results.length ? (
            results.map((story) => (
              <StoryCard story={story} horizontal key={story.id} />
            ))
          ) : (
            <div className="empty-state">
              <h2>No matching stories found</h2>
              <p>Try a broader place, topic, or keyword.</p>
            </div>
          )}
        </section>
      )}
    </main>
  );
}

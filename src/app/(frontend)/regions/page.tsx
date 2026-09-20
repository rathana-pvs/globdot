import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllRegions, getArticlesByRegion } from '@/lib/api-server';

export const dynamic = 'force-static';
export const revalidate = 60;

export const metadata: Metadata = {
  title: 'World Regions — Globdot Global Coverage',
  description: 'Explore regional news, investigative dispatches, and cross-border analysis across Americas, Asia, Europe, Middle East, Africa, and Oceania.',
};

export default async function RegionsIndexPage() {
  const regions = await getAllRegions();

  // Fetch top 2 articles for each region in parallel
  const regionCards = await Promise.all(
    regions.map(async (reg: any) => {
      const regionData = await getArticlesByRegion(reg.slug, 3);
      return {
        ...reg,
        stories: regionData?.stories || [],
      };
    })
  );

  return (
    <main id="content" className="shell channel-page">
      <header className="channel-header">
        <span>Global Coverage</span>
        <h1>World Regions</h1>
        <p>
          Select a geographic region to explore independent dispatches, investigative reporting,
          and regional policy analysis from our correspondents worldwide.
        </p>
      </header>

      <section className="channel-feed" style={{ marginTop: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '28px' }}>
          {regionCards.map((reg) => (
            <article
              key={reg.id || reg.slug}
              style={{
                border: '1px solid #e5e5e5',
                borderRadius: '8px',
                padding: '24px',
                backgroundColor: '#fff',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#6f42c1' }}>
                    Region
                  </span>
                  <span style={{ fontSize: '0.85rem', color: '#777' }}>
                    {reg.stories.length} {reg.stories.length === 1 ? 'dispatch' : 'dispatches'}
                  </span>
                </div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 10px 0', letterSpacing: '-0.01em' }}>
                  <Link href={`/region/${reg.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                    {reg.name}
                  </Link>
                </h2>
                <p style={{ color: '#555', fontSize: '0.95rem', lineHeight: 1.5, margin: '0 0 20px 0' }}>
                  {reg.description || `Field dispatches, security developments, and economic shifts across ${reg.name}.`}
                </p>

                {reg.stories.length > 0 && (
                  <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '16px', marginBottom: '20px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '8px' }}>
                      Recent Coverage:
                    </span>
                    <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.9rem', color: '#333' }}>
                      {reg.stories.slice(0, 2).map((story: any) => (
                        <li key={story.id} style={{ marginBottom: '6px', lineHeight: 1.4 }}>
                          <Link href={`/article/${story.slug}`} style={{ color: '#111', textDecoration: 'none' }}>
                            {story.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div>
                <Link
                  href={`/region/${reg.slug}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    color: '#111',
                    textDecoration: 'none',
                    borderBottom: '2px solid #111',
                    paddingBottom: '2px',
                  }}
                >
                  Explore {reg.name} Coverage →
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

import Link from 'next/link';
import Image from 'next/image';
import { StoryCard } from '@/components/story-card';
import { StoryVisual } from '@/components/story-visual';
import { getPublishedArticles } from '@/lib/api-server';
import { formatTime, formatDate, getMediaUrl } from '@/lib/utils';

export const dynamic = 'force-static';
export const revalidate = 60;

function getPrimaryRegionName(story: any): string {
  const regions = Array.isArray(story?.regions) ? story.regions : [];
  return regions.find((region: any) => region && typeof region === 'object')?.name || 'Global';
}

export default async function Home() {
  const stories = await getPublishedArticles(36);
  const breaking = stories.find((s: any) => s.isBreaking);

  /* ── Slot allocation ──────────────────────────────────── */
  const lead = stories.find((s: any) => s.homepageSlot === 'lead') || stories[0];
  const usedIds = new Set<string | number>([lead?.id].filter(Boolean));
  const pool = () => stories.filter((s: any) => !usedIds.has(s.id));

  // Briefing: 3 curated stories to balance the lead column height
  const secondaryTagged = stories.filter((s: any) => s.homepageSlot === 'secondary' && s.id !== lead?.id);
  const secondaryPool = pool().filter((s: any) => !secondaryTagged.some((t: any) => t.id === s.id));
  const secondary = [...secondaryTagged, ...secondaryPool].slice(0, 3);
  secondary.forEach((s: any) => usedIds.add(s.id));

  // Latest updates wire
  const latest = pool().slice(0, 3);
  latest.forEach((s: any) => usedIds.add(s.id));

  // In Depth: deep reporting / analysis / politics
  const inDepthPool = pool();
  const inDepth = [
    ...inDepthPool.filter((s: any) =>
      ['analysis', 'politics', 'world'].includes(s.section?.slug),
    ),
    ...inDepthPool.filter(
      (s: any) => !['analysis', 'politics', 'world'].includes(s.section?.slug),
    ),
  ].slice(0, 2);
  inDepth.forEach((s: any) => usedIds.add(s.id));

  // Prefer explicitly labelled analysis, explainers and opinion pieces.
  const contextPool = pool();
  const perspectives = [
    ...contextPool.filter((s: any) =>
      ['analysis', 'explainer', 'opinion'].includes(s.storyType),
    ),
    ...contextPool.filter(
      (s: any) => !['analysis', 'explainer', 'opinion'].includes(s.storyType),
    ),
  ].slice(0, 3);
  perspectives.forEach((s: any) => usedIds.add(s.id));

  // Regional field dispatches
  const dispatch = pool().slice(0, 6);
  dispatch.forEach((s: any) => usedIds.add(s.id));

  // News desk coverage
  const moreStories = pool().slice(0, 6);

  /* ── Lead helpers ─────────────────────────────────────── */
  const leadImage = lead?.coverImage ? getMediaUrl(lead.coverImage, '') : '';
  const leadAuthor = lead?.author?.name || lead?.author || 'Globdot News Desk';
  const leadSection = lead?.section?.name || 'Politics';
  const leadSectionSlug = lead?.section?.slug || 'politics';

  const todayDate = formatDate(new Date().toISOString(), 'EEEE, d MMMM yyyy');

  return (
    <main id="content">
      {/* ── Breaking strip ────────────────────────────────── */}
      {breaking && (
        <section className="breaking-strip" aria-label="Breaking news">
          <div className="shell breaking-inner">
            <strong>Breaking</strong>
            <Link href={`/article/${breaking.slug}`} className="breaking-title">{breaking.title}</Link>
            <Link href={`/article/${breaking.slug}`} className="breaking-cta">Read now →</Link>
          </div>
        </section>
      )}

      <div className="shell">
        {/* ── Newspaper dateline / edition bar ─────────────── */}
        <section className="dateline-bar" aria-label="Edition and regions">
          <div className="dateline-meta">
            <time className="dateline-date">{todayDate}</time>
            <span className="dateline-sep">/</span>
            <span className="dateline-label">Global Edition</span>
          </div>
          <div className="region-links">
            <Link className="active" href="/">Global</Link>
            {[
              ['Americas', 'americas'],
              ['Asia', 'asia'],
              ['Europe', 'europe'],
              ['Middle East', 'middle-east'],
            ].map(([name, slug]) => (
              <Link href={`/region/${slug}`} key={slug}>{name}</Link>
            ))}
          </div>
        </section>

        {/* ── Front Page Broadsheet Hero ───────────────────── */}
        {lead ? (
          <section className="home-hero" aria-labelledby="lead-headline">
            {/* Lead Story: Paper-grounded broadsheet presentation */}
            <article className="lead-story home-lead">
              <Link href={`/article/${lead.slug}`} className="lead-visual-wrap">
                {leadImage ? (
                  <div className="lead-visual relative overflow-hidden">
                    <Image
                      src={leadImage}
                      alt={lead.coverImage?.alt || ''}
                      fill
                      priority
                      sizes="(max-width: 820px) calc(100vw - 32px), (max-width: 1050px) 60vw, 900px"
                      className="object-cover transition-transform duration-500 hover:scale-102"
                    />
                  </div>
                ) : (
                  <StoryVisual section={leadSectionSlug} />
                )}
              </Link>
              <div className="lead-copy">
                <span className="kicker">{leadSection}</span>
                <Link href={`/article/${lead.slug}`}>
                  <h1 id="lead-headline">{lead.title}</h1>
                </Link>
                {lead.standfirst && <p className="lead-standfirst">{lead.standfirst}</p>}
                <div className="story-meta">
                  <span>By {leadAuthor}</span>
                  {lead.dateline && <span>{lead.dateline}</span>}
                  <span>{formatTime(lead.publishedAt)}</span>
                </div>
              </div>
            </article>

            {/* Editor's Briefing Sidebar */}
            <aside className="home-briefing" aria-label="Editor's briefing">
              <div className="briefing-heading">
                <span>Editor&apos;s briefing</span>
                <h2>What matters now</h2>
              </div>

              <div className="briefing-stories">
                {secondary.map((story: any, index: number) => {
                  const imageUrl = story?.coverImage ? getMediaUrl(story.coverImage, '') : '';

                  return (
                  <article className="briefing-story" key={story.id}>
                    <Link href={`/article/${story.slug}`} className="briefing-visual-link">
                      <div className="briefing-visual">
                        {imageUrl ? (
                          <Image
                            src={imageUrl}
                            alt={story.coverImage?.alt || ''}
                            fill
                            sizes="(max-width: 820px) 38vw, 320px"
                            className="object-cover"
                          />
                        ) : (
                          <StoryVisual section={story.section?.slug || 'world'} compact />
                        )}
                        {index === 0 && <span className="briefing-image-label">Top story</span>}
                      </div>
                    </Link>
                    <div className="briefing-copy">
                      <span className="kicker">{story.section?.name || 'World'}</span>
                      <Link href={`/article/${story.slug}`}>
                        <h3>{story.title}</h3>
                      </Link>
                      {index === 0 && story.standfirst && <p className="briefing-standfirst">{story.standfirst}</p>}
                      <div className="story-meta">
                        <span>{formatTime(story.publishedAt)}</span>
                      </div>
                    </div>
                  </article>
                  );
                })}
              </div>
            </aside>

            {/* Latest updates wire */}
            <div className="latest-briefing" aria-labelledby="latest-heading">
              <div className="rail-heading">
                <h2 id="latest-heading">Latest updates</h2>
                <Link href="/news">View all news <span aria-hidden="true">↗</span></Link>
              </div>
              <div className="latest-grid">
                {latest.map((story: any) => (
                  <article className="latest-item" key={story.id}>
                    <div className="latest-meta">
                      <time>{formatTime(story.publishedAt)}</time>
                      <span className="latest-sep">/</span>
                      <span className="kicker">{story.section?.name || 'World'}</span>
                    </div>
                    <Link href={`/article/${story.slug}`}>
                      <h3>{story.title}</h3>
                    </Link>
                  </article>
                ))}
              </div>
            </div>
          </section>
        ) : (
          <div className="empty-state">
            <h1>The newsroom is preparing today&apos;s report.</h1>
            <p>Check back shortly for the latest global coverage.</p>
          </div>
        )}

        {/* ── In Depth & Analysis ───────────────────────────── */}
        {inDepth.length > 0 && (
          <section className="hp-section in-depth-section" aria-label="In-depth analysis">
            <header className="hp-section-rule">
              <span>In depth &amp; analysis</span>
              <Link href="/news">All coverage ↗</Link>
            </header>
            <div className="in-depth-grid">
              {inDepth.map((story: any) => (
                <article className="in-depth-story" key={story.id}>
                  <Link href={`/article/${story.slug}`} className="in-depth-visual-link">
                    <div className="in-depth-visual">
                      {story?.coverImage ? (
                        <Image
                          src={getMediaUrl(story.coverImage, '')}
                          alt={story.coverImage?.alt || ''}
                          fill
                          sizes="(max-width: 820px) calc(100vw - 32px), 50vw"
                          className="object-cover"
                        />
                      ) : (
                        <StoryVisual section={story.section?.slug || 'analysis'} compact />
                      )}
                    </div>
                  </Link>
                  <div className="in-depth-body">
                    <span className="kicker">{story.section?.name || 'Analysis'}</span>
                    <Link href={`/article/${story.slug}`}>
                      <h2>{story.title}</h2>
                    </Link>
                    {story.standfirst && <p>{story.standfirst}</p>}
                    <div className="story-meta">
                      <span>By {story.author?.name || story.author || 'Globdot News Desk'}</span>
                      {story.dateline && <span>{story.dateline}</span>}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* ── Analysis & context ─────────────────────────────── */}
        {perspectives.length > 0 && (
          <section className="hp-section perspectives-section" aria-label="Analysis and context">
            <header className="hp-section-rule">
              <span>Analysis &amp; context</span>
              <Link href="/news">All analysis ↗</Link>
            </header>
            <div className="perspectives-grid">
              {perspectives.map((story: any) => (
                <article className="perspective-item" key={story.id}>
                  <Link href={`/article/${story.slug}`} className="perspective-visual-link">
                    <div className="perspective-visual">
                      {story?.coverImage ? (
                        <Image
                          src={getMediaUrl(story.coverImage, '')}
                          alt={story.coverImage?.alt || ''}
                          fill
                          sizes="(max-width: 600px) calc(100vw - 32px), (max-width: 820px) 34vw, 420px"
                          className="object-cover"
                        />
                      ) : (
                        <StoryVisual section={story.section?.slug || 'opinion'} compact />
                      )}
                    </div>
                  </Link>
                  <div className="perspective-body">
                    <span className="perspective-author">
                      By {story.author?.name || story.author || 'Globdot News Desk'}
                    </span>
                    <Link href={`/article/${story.slug}`}>
                      <h3 className="perspective-title">{story.title}</h3>
                    </Link>
                    {story.standfirst && (
                      <p className="perspective-excerpt">{story.standfirst}</p>
                    )}
                    <div className="perspective-meta">
                      <span className="kicker">{story.section?.name || 'Opinion'}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* ── Across the Globe / Dispatches ─────────────────── */}
        {dispatch.length > 0 && (
          <section className="hp-section dispatch-section" aria-label="Stories from around the world">
            <header className="hp-section-rule">
              <span>Across the globe · Dispatches</span>
              <Link href="/news">See all stories ↗</Link>
            </header>
            <div className="dispatch-grid">
              {dispatch.map((story: any) => (
                <article className="dispatch-story" key={story.id}>
                  <span className="dispatch-region">
                    {getPrimaryRegionName(story)}
                  </span>
                  <Link href={`/article/${story.slug}`}>
                    <h3>{story.title}</h3>
                  </Link>
                  {story.standfirst && (
                    <p className="dispatch-preview">{story.standfirst}</p>
                  )}
                  <time className="dispatch-date" dateTime={story.publishedAt}>
                    {formatDate(story.publishedAt)}
                  </time>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* ── More from the Newsroom ────────────────────────── */}
        {moreStories.length > 0 && (
          <section className="hp-section newsroom-section" aria-label="More stories from the newsroom">
            <header className="hp-section-rule">
              <span>From the news desk</span>
              <Link className="all-news-link" href="/news">
                View all news <span aria-hidden="true">↗</span>
              </Link>
            </header>
            <div className="newsroom-grid">
              {moreStories.map((story: any) => (
                <StoryCard story={story} key={story.id} />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

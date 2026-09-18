import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { StoryVisual } from '@/components/story-visual';
import { StoryCard } from '@/components/story-card';
import { ArticleLeadImage } from '@/components/article-lead-image';
import { RichText } from '@/components/RichText';
import { AdSlot } from '@/components/ad-slot';
import { getArticleBySlug, getArticlesBySection, getPublishedArticles } from '@/lib/api-server';
import { formatDate, getMediaUrl } from '@/lib/utils';

export const dynamic = 'force-static';
export const dynamicParams = true;
export const revalidate = 60;
type Props = { params: Promise<{ slug: string }> };

// Articles are generated on their first request, then served from the ISR cache.
export function generateStaticParams() {
  return [];
}

const formatLabels: Record<string, string> = {
  news: 'News',
  analysis: 'Analysis',
  explainer: 'Explainer',
  opinion: 'Opinion',
  interview: 'Interview',
  video: 'Video',
};

const formatNotes: Record<string, string> = {
  analysis: 'This article interprets verified reporting and identifies the evidence behind its conclusions.',
  explainer: 'This explainer answers the central questions and separates established facts from open issues.',
  opinion: 'This article presents the author’s argument. Opinion is kept separate from straight news reporting.',
  interview: 'Responses are presented as an edited question-and-answer conversation and should preserve the speaker’s meaning.',
  video: 'This companion article summarizes the key information and context from the associated video report.',
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const story = await getArticleBySlug(slug);
  if (!story) return { title: 'Story not found — Globdot' };

  const title = story.og?.metaTitle || story.title;
  const description = story.og?.metaDescription || story.standfirst;
  const imageUrl = getMediaUrl(story.og?.ogImage || story.coverImage, '');

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://globdot.com';
  const canonicalUrl = `${siteUrl}/article/${story.slug}`;

  return {
    title: `${title} — Globdot`,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: 'article',
      publishedTime: story.publishedAt,
      images: imageUrl ? [{ url: imageUrl }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: imageUrl ? [imageUrl] : [],
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const story = await getArticleBySlug(slug);

  if (!story) notFound();

  const sectionName = story.section?.name || 'Politics';
  const sectionSlug = story.section?.slug || 'politics';
  const sectionColor = story.section?.color || '#2457ff';
  const storyType = story.storyType || 'news';
  const authorName = story.author?.name || story.author || 'Globdot News Desk';
  const imageUrl = story?.coverImage ? getMediaUrl(story.coverImage, '') : '';

  // Parallel fetch: section stories for the rail & published stories for related grid
  const [sectionData, allStories] = await Promise.all([
    getArticlesBySection(sectionSlug, 8),
    getPublishedArticles(12),
  ]);

  // Desk stories excluding current article and any identical titles
  const deskStories = (sectionData?.stories || []).filter(
    (item: any) =>
      item.id !== story.id &&
      item.slug !== story.slug &&
      item.title?.toLowerCase().trim() !== story.title?.toLowerCase().trim()
  );
  const railStories = deskStories.slice(0, 4);

  // Related stories: remaining desk stories first, then other sections
  const otherStories = (allStories || []).filter(
    (item: any) =>
      item.id !== story.id &&
      item.slug !== story.slug &&
      item.title?.toLowerCase().trim() !== story.title?.toLowerCase().trim() &&
      item.section?.slug !== sectionSlug
  );
  const remainingDeskStories = deskStories.slice(4);
  const relatedPool = [...remainingDeskStories, ...otherStories];
  const related = relatedPool.slice(0, 4);

  // Fallback if needed to guarantee 4 cards
  if (related.length < 4) {
    for (const item of allStories || []) {
      if (
        item.id !== story.id &&
        item.slug !== story.slug &&
        item.title?.toLowerCase().trim() !== story.title?.toLowerCase().trim() &&
        !related.some((r: any) => r.id === item.id || r.title === item.title)
      ) {
        related.push(item);
        if (related.length >= 4) break;
      }
    }
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://globdot.com';
  const articleUrl = `${siteUrl}/article/${story.slug}`;
  const fullImageUrl = imageUrl
    ? imageUrl.startsWith('http')
      ? imageUrl
      : `${siteUrl}${imageUrl}`
    : undefined;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': articleUrl,
    },
    headline: story.title,
    description: story.standfirst || story.title,
    image: fullImageUrl ? [fullImageUrl] : undefined,
    datePublished: story.publishedAt,
    dateModified: story.updatedAt || story.publishedAt,
    author: [
      {
        '@type': 'Person',
        name: authorName,
      },
    ],
    publisher: {
      '@type': 'NewsMediaOrganization',
      name: 'Globdot',
      url: siteUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/globdot-icon.svg`,
      },
    },
    articleSection: sectionName,
    citation: Array.isArray(story.sourceLinks)
      ? story.sourceLinks.map((source: any) => source?.url).filter(Boolean)
      : undefined,
  };

  return (
    <main id="content" className={`article-page article-format-${storyType} shell`}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <header className="article-header">
        <div className="article-eyebrow">
          <nav className="article-breadcrumb" aria-label="Breadcrumb">
            <Link href="/" className="breadcrumb-home">Home</Link>
            <span className="breadcrumb-separator" aria-hidden="true">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14m-6-6 6 6-6 6" />
              </svg>
            </span>
            <Link
              href={`/section/${sectionSlug}`}
              className="breadcrumb-kicker"
              style={{ color: sectionColor }}
            >
              {sectionName}
            </Link>
          </nav>
          <span className="article-format-label">{formatLabels[storyType] || 'Article'}</span>
        </div>
        <h1>{story.title}</h1>
        <p className="standfirst">{story.standfirst}</p>
        <div className="byline">
          <span>{storyType === 'opinion' ? 'Commentary by' : 'By'} <strong>{authorName}</strong></span>
          {story.dateline && <span>{story.dateline}</span>}
          <span>{formatDate(story.publishedAt, 'MMMM d, yyyy')}</span>
        </div>

      </header>

      <div className="article-layout">
        <article className="article-content">
          {formatNotes[storyType] && (
            <aside className="article-format-note" aria-label={`${formatLabels[storyType]} note`}>
              <strong>{formatLabels[storyType]}</strong>
              <p>{formatNotes[storyType]}</p>
            </aside>
          )}
          {imageUrl ? (
            <figure className="article-lead-figure">
              <ArticleLeadImage
                imageUrl={imageUrl}
                alt={story.coverImage?.alt || story.title}
                displayMode={story.coverDisplayMode || 'auto'}
                focalPosition={story.coverFocalPosition || 'auto'}
                imageMeta={typeof story.coverImage === 'object' ? story.coverImage : undefined}
              />
              {(story.coverImage?.caption || story.coverImage?.credit || story.dateline) && (
                <figcaption className="article-lead-caption">
                  <span>
                    {story.coverImage?.caption ||
                      story.standfirst ||
                      `${story.title} — Globdot News Service.`}
                  </span>
                  <cite>
                    {story.coverImage?.credit
                      ? `Photo: ${story.coverImage.credit}`
                      : 'Globdot / Archive'}
                  </cite>
                </figcaption>
              )}
            </figure>
          ) : (
            <div className="article-lead-fallback">
              <StoryVisual section={sectionSlug} />
            </div>
          )}

          {/* Render Lexical RichText or fallback */}
          {story.content ? (
            <RichText content={story.content} />
          ) : (
            <div className="article-prose">
              <p>
                {story.dateline && <strong>{story.dateline} — </strong>}
                {story.standfirst}
              </p>
            </div>
          )}

          {Array.isArray(story.sourceLinks) && story.sourceLinks.length > 0 && (
            <section className="article-sources" aria-labelledby="article-sources-heading">
              <div className="article-sources-header">
                <svg
                  className="sources-icon"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  aria-hidden="true"
                >
                  <path
                    d="M6.5 9.5a3.5 3.5 0 0 0 5 0l2-2a3.5 3.5 0 0 0-5-5l-1.2 1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M9.5 6.5a3.5 3.5 0 0 0-5 0l-2 2a3.5 3.5 0 0 0 5 5l1.2-1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <h2 id="article-sources-heading">Sources:</h2>
              </div>
              <div className="article-sources-list">
                {story.sourceLinks.map((source: any, index: number) => {
                  const displayName =
                    source.name && typeof source.name === 'string' && !source.name.startsWith('http')
                      ? source.name.trim()
                      : (() => {
                          try {
                            return new URL(source.url).hostname.replace(/^www\./, '');
                          } catch {
                            return source.name || `Source ${index + 1}`;
                          }
                        })();

                  return (
                    <a
                      key={source.id || `${source.url}-${index}`}
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="source-chip-link"
                      title={`Open source report from ${displayName} (opens in new tab)`}
                    >
                      <span className="source-chip-name">{displayName}</span>
                      <svg
                        className="source-chip-icon"
                        viewBox="0 0 12 12"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        aria-hidden="true"
                      >
                        <path d="M3.5 8.5l5-5M4 3.5h4.5V8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </a>
                  );
                })}
              </div>
            </section>
          )}

          {story.correctionNote && (
            <div className="correction" role="note">
              <strong>Correction & Clarification</strong>
              <p>{story.correctionNote}</p>
            </div>
          )}
        </article>

        <aside className="article-rail" aria-label="Editorial sidebar">
          {railStories.length > 0 && (
            <div className="rail-desk-stories">
              <div className="rail-subheading">
                <h3>Latest in {sectionName}</h3>
                <span className="rail-count">{railStories.length} stories</span>
              </div>
              <div className="rail-story-list">
                {railStories.map((item: any, idx: number) => (
                  <article key={item.id} className="rail-story-item">
                    <span className="rail-story-num">0{idx + 1}</span>
                    <div className="rail-story-content">
                      <div className="rail-story-meta">
                        <time>{formatDate(item.publishedAt, 'MMM d')}</time>
                        {item.dateline && <span>• {item.dateline}</span>}
                      </div>
                      <Link href={`/article/${item.slug}`}>
                        <h4>{item.title}</h4>
                      </Link>
                      <span className="rail-story-read">{item.readTime || 3} min read</span>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}

          <div className="rail-ad-container">
            <AdSlot placement="sidebar" />
          </div>

          <div className="rail-standards-card">
            <h4>Editorial Integrity</h4>
            <p>
              Globdot reporting adheres to strict nonpartisan accuracy and independence standards.
            </p>
            <Link href="/contact">Contact the Newsroom →</Link>
          </div>
        </aside>
      </div>

      {related.length > 0 && (
        <section className="related-section">
          <div className="related-header">
            <div className="related-title-group">
              <div className="related-kicker-row">
                <span className="desk-indicator" style={{ backgroundColor: sectionColor }} />
                <span className="related-kicker">Keep Reading</span>
              </div>
              <h2 className="related-heading">Related Coverage & Analysis</h2>
            </div>
            <Link href={`/section/${sectionSlug}`} className="related-all-link">
              <span>All {sectionName} Stories</span>
              <span className="related-all-arrow" aria-hidden="true">→</span>
            </Link>
          </div>
          <div className="story-card-grid">
            {related.map((item: any) => (
              <StoryCard key={item.id} story={item} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

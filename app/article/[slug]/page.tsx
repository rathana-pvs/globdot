import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { StoryVisual } from '@/components/story-visual';
import { getPublishedStories, getStoryBySlug } from '@/lib/content';
import { formatStoryDate } from '@/lib/format';
import { AdSlot } from '@/components/ad-slot';

export const dynamic = 'force-dynamic';
type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params; const story = await getStoryBySlug(slug);
  if (!story) return { title: 'Story not found — Globdot' };
  return { title: `${story.title} — Globdot`, description: story.standfirst, openGraph: { title: story.title, description: story.standfirst, type: 'article', images: [] }, twitter: { card: 'summary', title: story.title, description: story.standfirst, images: [] } };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params; const [story, allStories] = await Promise.all([getStoryBySlug(slug), getPublishedStories(8)]); if (!story) notFound();
  const related = allStories.filter((item) => item.id !== story.id && item.section.slug === story.section.slug).slice(0,3);
  return <main id="content" className="article-page shell">
    <nav className="article-breadcrumb"><Link href="/">Home</Link><span>→</span><Link href={`/section/${story.section.slug}`}>{story.section.name}</Link></nav>
    <header className="article-header"><span className="kicker" style={{ color: story.section.color }}>{story.section.name}</span><h1>{story.title}</h1><p className="standfirst">{story.standfirst}</p><div className="byline"><strong>By {story.author}</strong><span>{story.dateline}</span><span>{formatStoryDate(story.publishedAt)}</span><span>{story.readTime} min read</span></div></header>
    <div className="article-layout"><article className="article-content"><StoryVisual section={story.section.slug} />{story.keyPoints.length > 0 && <aside className="in-brief"><span>In brief</span><h2>What you need to know</h2><ul>{story.keyPoints.map((point) => <li key={point}>{point}</li>)}</ul></aside>}<div className="article-prose">{story.body.map((paragraph, index) => <div key={index}><p>{index === 0 && story.dateline ? <strong>{story.dateline} — </strong> : null}{paragraph}</p>{index === 0 && <AdSlot placement="article" />}</div>)}</div>{story.correctionNote && <div className="correction"><strong>Correction</strong><p>{story.correctionNote}</p></div>}</article>
    <aside className="article-rail"><div className="rail-heading"><h2>Story map</h2></div><p>This story connects <strong>{story.section.name}</strong> reporting with Globdot’s global coverage.</p><Link href={`/section/${story.section.slug}`}>Explore the section →</Link><AdSlot placement="sidebar" /></aside></div>
    {related.length > 0 && <section className="related-section"><div className="section-title"><p>Keep reading</p><h2>Related coverage</h2></div><div className="story-card-grid">{related.map((item) => <div key={item.id}><Link href={`/article/${item.slug}`}><span className="kicker">{item.section.name}</span><h3>{item.title}</h3></Link></div>)}</div></section>}
  </main>;
}

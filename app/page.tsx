import Link from 'next/link';
import { StoryCard } from '@/components/story-card';
import { StoryVisual } from '@/components/story-visual';
import { getPublishedStories } from '@/lib/content';
import { formatStoryTime } from '@/lib/format';

export const dynamic = 'force-dynamic';

const regions = [['Africa','africa'],['Americas','americas'],['Asia','asia'],['Europe','europe'],['Middle East','middle-east'],['Oceania','oceania']];

export default async function Home() {
  const stories = await getPublishedStories(20);
  const lead = stories.find((story) => story.homepageSlot === 'lead') || stories[0];
  const secondary = stories.filter((story) => story.homepageSlot === 'secondary').slice(0, 2);
  const latest = stories.filter((story) => story.id !== lead?.id && !secondary.some((item) => item.id === story.id)).slice(0, 3);
  const moreStories = stories.filter((story) => ![lead?.id, ...secondary.map((item) => item.id), ...latest.map((item) => item.id)].includes(story.id)).slice(0, 4);
  const breaking = stories.find((story) => story.isBreaking);

  return (
    <main id="content">
      {breaking && <section className="breaking-strip" aria-label="Breaking news"><div className="shell breaking-inner"><strong>Breaking</strong><span>{breaking.title}</span><Link href={`/article/${breaking.slug}`}>Read now →</Link></div></section>}
      <div className="shell">
        <section className="pulse-bar" aria-label="Browse regions"><div className="pulse-title"><span className="pulse-mark" /> Global pulse</div><div className="region-links"><Link className="active" href="/">World</Link>{regions.map(([name, slug]) => <Link href={`/region/${slug}`} key={slug}>{name}</Link>)}</div><span className="updated">Reporting across 6 regions</span></section>

        {lead ? <section className="lead-grid" aria-labelledby="lead-headline">
          <article className="lead-story"><Link href={`/article/${lead.slug}`}><StoryVisual section={lead.section.slug} /></Link><div className="story-copy"><span className="kicker" style={{ color: lead.section.color }}>{lead.section.name}</span><Link href={`/article/${lead.slug}`}><h1 id="lead-headline">{lead.title}</h1></Link><p>{lead.standfirst}</p><div className="story-meta"><span>By {lead.author}</span><span>{lead.readTime} min read</span><span>{lead.dateline}</span></div></div></article>
          <div className="secondary-column">{secondary.map((story) => <StoryCard story={story} key={story.id} />)}</div>
          <aside className="latest-column" aria-labelledby="latest-heading"><div className="rail-heading"><h2 id="latest-heading">Latest</h2><Link href="/section/world">View all</Link></div>{latest.map((story) => <article className="latest-item" key={story.id}><time>{formatStoryTime(story.publishedAt)}</time><span className="kicker" style={{ color: story.section.color }}>{story.section.name}</span><Link href={`/article/${story.slug}`}><h3>{story.title}</h3></Link></article>)}</aside>
        </section> : <div className="empty-state"><h1>The newsroom is preparing today’s report.</h1><p>Check back shortly for the latest global coverage.</p></div>}

        {moreStories.length > 0 && <section className="more-section"><div className="section-title"><p>Across the globe</p><h2>More stories that connect the dots</h2></div><div className="story-card-grid">{moreStories.map((story) => <StoryCard story={story} key={story.id} />)}</div></section>}
      </div>
    </main>
  );
}

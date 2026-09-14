import Link from 'next/link';
import type { Story } from '@/lib/content';
import { formatStoryDate } from '@/lib/format';
import { StoryVisual } from './story-visual';

export function StoryCard({ story, horizontal = false }: { story: Story; horizontal?: boolean }) {
  return (
    <article className={`story-card${horizontal ? ' horizontal' : ''}`}>
      <Link href={`/article/${story.slug}`}><StoryVisual section={story.section.slug} compact /></Link>
      <div className="card-copy"><span className="kicker" style={{ color: story.section.color }}>{story.section.name}</span><Link href={`/article/${story.slug}`}><h2>{story.title}</h2></Link><p>{story.standfirst}</p><div className="story-meta"><span>{story.author}</span><span>{story.readTime} min read</span><span>{formatStoryDate(story.publishedAt)}</span></div></div>
    </article>
  );
}

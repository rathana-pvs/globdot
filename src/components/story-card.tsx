import Link from 'next/link';
import Image from 'next/image';
import { formatDate, getMediaUrl } from '@/lib/utils';
import { StoryVisual } from './story-visual';

export function StoryCard({ story, horizontal = false }: { story: any; horizontal?: boolean }) {
  if (!story) return null;

  const sectionName = story.section?.name || 'World';
  const sectionSlug = story.section?.slug || 'world';
  const authorName = story.author?.name || story.author || 'Globdot News Desk';
  const imageUrl = story?.coverImage ? getMediaUrl(story.coverImage, '') : '';

  return (
    <article className={`story-card${horizontal ? ' horizontal' : ''}`}>
      <Link href={`/article/${story.slug}`} className="card-visual-link block">
        <div className="card-visual relative overflow-hidden">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={story.coverImage?.alt || ''}
              fill
              sizes="(max-width: 720px) 100vw, (max-width: 1050px) 50vw, 320px"
              className="object-cover transition-transform duration-300 hover:scale-105"
            />
          ) : (
            <StoryVisual section={sectionSlug} compact />
          )}
        </div>
      </Link>
      <div className="card-copy">
        <span className="kicker">
          {sectionName}
        </span>
        <Link href={`/article/${story.slug}`}>
          <h2>{story.title}</h2>
        </Link>
        <p>{story.standfirst}</p>
        <div className="story-meta">
          <span>{authorName}</span>
          <span>{story.readTime || 3} min read</span>
          <span>{formatDate(story.publishedAt)}</span>
        </div>
      </div>
    </article>
  );
}

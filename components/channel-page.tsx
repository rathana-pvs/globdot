import { StoryCard } from './story-card';
import type { Story } from '@/lib/content';

export function ChannelPage({ eyebrow, title, description, stories }: { eyebrow: string; title: string; description?: string | null; stories: Story[] }) {
  const [lead, ...rest] = stories;
  return <main id="content" className="shell channel-page"><header className="channel-header"><span>{eyebrow}</span><h1>{title}</h1>{description && <p>{description}</p>}</header>{lead ? <><section className="channel-lead"><StoryCard story={lead} horizontal />{rest.slice(0,2).map((story) => <StoryCard story={story} key={story.id} />)}</section><section className="channel-feed"><div className="section-title"><p>Latest reporting</p><h2>All {title} stories</h2></div>{rest.slice(2).map((story) => <StoryCard story={story} horizontal key={story.id} />)}</section></> : <div className="empty-state"><h2>No published stories yet</h2><p>Our editors are preparing this section.</p></div>}</main>;
}

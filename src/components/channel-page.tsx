import { StoryCard } from './story-card';

export function ChannelPage({
  eyebrow,
  title,
  description,
  stories,
}: {
  eyebrow: string;
  title: string;
  description?: string | null;
  stories: any[];
}) {
  return (
    <main id="content" className="shell channel-page">
      <header className="channel-header">
        <span>{eyebrow}</span>
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </header>

      {stories.length > 0 ? (
        <section className="channel-feed">
          <div className="story-card-grid">
            {stories.map((story) => (
              <StoryCard story={story} key={story.id} />
            ))}
          </div>
        </section>
      ) : (
        <div className="empty-state">
          <h2>No stories published in this section yet.</h2>
          <p>Check back shortly for upcoming coverage from our correspondents.</p>
        </div>
      )}
    </main>
  );
}

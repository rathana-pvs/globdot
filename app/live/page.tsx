import type { Metadata } from 'next';
import { getLiveCoverage } from '@/lib/content';
import { formatStoryTime } from '@/lib/format';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Live — Globdot', description: 'Verified live updates from Globdot correspondents.' };

export default async function LivePage() {
  const coverage = await getLiveCoverage();
  return <main id="content" className="shell live-page"><header className="live-header"><div className="live-status"><i /> Live reporting</div><h1>{coverage?.title || 'No live coverage at this time'}</h1><p>{coverage?.summary || 'When a major global story develops, verified updates will appear here.'}</p></header>{coverage && <div className="live-layout"><section className="timeline"><div className="rail-heading"><h2>Latest updates</h2><span>{coverage.updates.length} posts</span></div>{coverage.updates.map((update) => <article className={`timeline-item${update.isPinned ? ' pinned' : ''}`} key={update.id}><time>{formatStoryTime(update.publishedAt)}</time><div>{update.isPinned && <span className="kicker">Key update</span>}{update.headline && <h2>{update.headline}</h2>}{update.body.map((paragraph, index) => <p key={index}>{paragraph}</p>)}<span className="update-author">{update.author}</span></div></article>)}</section><aside className="live-context"><span>How we report live</span><h2>Fast, verified, transparent</h2><p>Updates are timestamped, sourced and corrected visibly as information develops.</p></aside></div>}</main>;
}

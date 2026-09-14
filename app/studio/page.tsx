import Link from 'next/link';
import { chatGPTSignOutPath } from '@/app/chatgpt-auth';
import { getStudioDashboard, requireEditorialSession } from '@/lib/studio';

export const dynamic = 'force-dynamic';

export default async function StudioPage({ searchParams }: { searchParams: Promise<{ share?: string; created?: string; uploaded?: string }> }) {
  const session = await requireEditorialSession('/studio');
  if (!session) return <main id="content" className="shell studio-denied"><h1>Editorial access required</h1><p>Your account is signed in but has not been added to the Globdot newsroom.</p><Link href="/">Return to Globdot</Link></main>;
  const data = await getStudioDashboard();
  const notice = await searchParams;
  const published = data.articles.filter((article) => article.status === 'published').length;
  const review = data.articles.filter((article) => article.status === 'in_review').length;
  return <main id="content" className="studio-page">
    <header className="studio-header"><div><span>GLOB•DOT / NEWSROOM</span><h1>Editorial studio</h1></div><div className="studio-user"><span>{session.editor.displayName}</span><small>{session.editor.role.replaceAll('_',' ')}</small><a href={chatGPTSignOutPath('/studio')}>Sign out</a></div></header>
    <div className="studio-shell">
      {notice.share && <div className="studio-notice">Tracked share link created: <strong>{`https://globdot.com/s/${notice.share}`}</strong></div>}
      {notice.created && <div className="studio-notice">Draft saved successfully.</div>}
      {notice.uploaded && <div className="studio-notice">Media uploaded successfully.</div>}
      <section className="studio-stats"><div><strong>{data.articles.length}</strong><span>Total stories</span></div><div><strong>{published}</strong><span>Published</span></div><div><strong>{review}</strong><span>In review</span></div><div><strong>{data.media.length}</strong><span>Recent media</span></div></section>
      <div className="studio-grid">
        <section className="studio-panel"><div className="studio-panel-title"><div><span>Create</span><h2>New story</h2></div></div><form className="studio-form" action="/api/studio/articles" method="post"><label>Headline<input name="title" required minLength={10} maxLength={180} /></label><label>Standfirst<textarea name="standfirst" required minLength={20} maxLength={300} rows={3} /></label><div className="studio-form-row"><label>Section<select name="sectionId" required>{data.sections.map((section) => <option value={section.id} key={section.id}>{section.name}</option>)}</select></label><label>Byline<select name="authorId" required>{data.authors.map((author) => <option value={author.id} key={author.id}>{author.name}</option>)}</select></label></div><label>Article body<textarea name="body" required minLength={80} rows={10} placeholder="Separate paragraphs with a blank line." /></label><label className="checkbox-label"><input name="breaking" type="checkbox" value="true" /> Mark as breaking</label><button type="submit">Save draft</button></form></section>
        <aside className="studio-panel"><div className="studio-panel-title"><div><span>Media</span><h2>Upload asset</h2></div></div><form className="studio-form" action="/api/studio/media" method="post" encType="multipart/form-data"><label>Image<input name="file" type="file" accept="image/jpeg,image/png,image/webp,image/avif" required /></label><label>Alternative text<input name="alt" required minLength={5} /></label><label>Credit<input name="credit" /></label><button type="submit">Upload to library</button></form><div className="media-list">{data.media.map((item) => <div key={item.id}><strong>{item.fileName}</strong><span>{item.alt}</span></div>)}</div></aside>
      </div>
      <section className="studio-panel story-queue"><div className="studio-panel-title"><div><span>Workflow</span><h2>Story queue</h2></div><span>{data.articles.length} records</span></div><div className="queue-table">{data.articles.map((article) => <article key={article.id}><div><span className={`status status-${article.status}`}>{article.status.replaceAll('_',' ')}</span><h3>{article.title}</h3><small>Updated {article.updatedAt.slice(0,16).replace('T',' ')}</small></div><div className="queue-actions">{article.status === 'draft' && <form action={`/api/studio/articles/${article.id}`} method="post"><input type="hidden" name="status" value="in_review" /><button>Submit for review</button></form>}{article.status === 'in_review' && <form action={`/api/studio/articles/${article.id}`} method="post"><input type="hidden" name="status" value="approved" /><button>Approve</button></form>}{article.status === 'approved' && <form action={`/api/studio/articles/${article.id}`} method="post"><input type="hidden" name="status" value="published" /><button>Publish</button></form>}{article.status === 'published' && <><Link href={`/article/${article.slug}`}>View story</Link><form action="/api/studio/share" method="post"><input type="hidden" name="articleId" value={article.id} /><input type="hidden" name="label" value="Studio share" /><button>Create share link</button></form></>}</div></article>)}</div></section>
    </div>
  </main>;
}

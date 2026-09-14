import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { getDb } from '@/db';
import { articleRevisions, articles } from '@/db/schema';
import { assertArticleTransition, canEditArticle } from '@/lib/editorial-policy';
import { getEditorialSession, hasTrustedOrigin } from '@/lib/studio';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: rawId } = await params; const id = Number(rawId);
  if (!hasTrustedOrigin(request)) return NextResponse.json({ error: 'Invalid origin' }, { status: 403 });
  const session = await getEditorialSession();
  if (!session || !Number.isInteger(id)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const db = getDb(); const found = await db.select().from(articles).where(eq(articles.id, id)).limit(1); const article = found[0];
  if (!article || !canEditArticle(session.editor.role, session.editor.id, article.createdById, article.status)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const form = await request.formData(); const nextStatus = String(form.get('status') || '') as typeof article.status;
  assertArticleTransition(session.editor.role, article.status, nextStatus);
  const revisionRows = await db.select({ id: articleRevisions.id }).from(articleRevisions).where(eq(articleRevisions.articleId, article.id));
  const now = new Date().toISOString(); const updates = { status: nextStatus, updatedAt: now, publishedAt: nextStatus === 'published' ? now : article.publishedAt };
  await db.batch([db.update(articles).set(updates).where(eq(articles.id, id)), db.insert(articleRevisions).values({ articleId: id, editorId: session.editor.id, revisionNumber: revisionRows.length + 1, snapshotJson: JSON.stringify({ ...article, ...updates }), note: `Status changed to ${nextStatus}` })]);
  return NextResponse.redirect(new URL('/studio', request.url), 303);
}

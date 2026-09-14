import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { getDb } from '@/db';
import { articleAuthors, articleRevisions, articles } from '@/db/schema';
import { canCreateArticle, canPublish } from '@/lib/editorial-policy';
import { bodyToJson, calculateReadTime, getEditorialSession, hasTrustedOrigin, slugify } from '@/lib/studio';

export async function POST(request: NextRequest) {
  if (!hasTrustedOrigin(request)) return NextResponse.json({ error: 'Invalid origin' }, { status: 403 });
  const session = await getEditorialSession();
  if (!session || !canCreateArticle(session.editor.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const form = await request.formData();
  const title = String(form.get('title') || '').trim(); const standfirst = String(form.get('standfirst') || '').trim(); const body = String(form.get('body') || '').trim();
  const sectionId = Number(form.get('sectionId')); const authorId = Number(form.get('authorId'));
  if (title.length < 10 || standfirst.length < 20 || body.length < 80 || !Number.isInteger(sectionId) || !Number.isInteger(authorId)) return NextResponse.json({ error: 'Invalid article fields' }, { status: 400 });
  const db = getDb();
  const baseSlug = slugify(title) || `story-${Date.now()}`;
  const existing = await db.select({ id: articles.id }).from(articles).where(eq(articles.slug, baseSlug)).limit(1);
  const slug = existing.length ? `${baseSlug}-${Date.now().toString().slice(-5)}` : baseSlug;
  const bodyJson = bodyToJson(body);
  const inserted = await db.insert(articles).values({ slug, title, standfirst, bodyJson, sectionId, createdById: session.editor.id, readTimeMinutes: calculateReadTime(body), isBreaking: canPublish(session.editor.role) && form.get('breaking') === 'true' }).returning();
  const article = inserted[0];
  await db.batch([db.insert(articleAuthors).values({ articleId: article.id, authorId, position: 0 }), db.insert(articleRevisions).values({ articleId: article.id, editorId: session.editor.id, revisionNumber: 1, snapshotJson: JSON.stringify(article), note: 'Initial draft' })]);
  return NextResponse.redirect(new URL(`/studio?created=${article.id}`, request.url), 303);
}

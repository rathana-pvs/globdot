import { NextRequest, NextResponse } from 'next/server';
import { getRawDb } from '@/db';

export async function GET(request: NextRequest, { params }: { params: Promise<{ key: string }> }) {
  const key = (await params).key; if (!/^[a-z0-9]{8,16}$/i.test(key)) return NextResponse.redirect(new URL('/', request.url), 302);
  const db = getRawDb();
  const result = await db.prepare(`UPDATE share_campaigns SET click_count = click_count + 1, updated_at = CURRENT_TIMESTAMP WHERE key = ? AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP) RETURNING article_id`).bind(key).first<{ article_id: number }>();
  if (!result) return NextResponse.redirect(new URL('/', request.url), 302);
  const article = await db.prepare(`SELECT slug FROM articles WHERE id = ? AND status = 'published' LIMIT 1`).bind(result.article_id).first<{ slug: string }>();
  return NextResponse.redirect(new URL(article ? `/article/${article.slug}` : '/', request.url), 302);
}

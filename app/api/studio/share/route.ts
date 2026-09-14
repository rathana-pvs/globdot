import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { getDb } from '@/db';
import { articles, shareCampaigns } from '@/db/schema';
import { getEditorialSession, hasTrustedOrigin } from '@/lib/studio';

export async function POST(request: NextRequest) {
  if (!hasTrustedOrigin(request)) return NextResponse.json({ error: 'Invalid origin' }, { status: 403 });
  const session = await getEditorialSession(); if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const form = await request.formData(); const articleId = Number(form.get('articleId')); const label = String(form.get('label') || '').trim().slice(0,80);
  const article = await getDb().select({ id: articles.id }).from(articles).where(eq(articles.id, articleId)).limit(1); if (!article[0]) return NextResponse.json({ error: 'Story not found' }, { status: 404 });
  const key = crypto.randomUUID().replaceAll('-', '').slice(0,10); await getDb().insert(shareCampaigns).values({ key, articleId, label: label || null });
  return NextResponse.redirect(new URL(`/studio?share=${key}`, request.url), 303);
}

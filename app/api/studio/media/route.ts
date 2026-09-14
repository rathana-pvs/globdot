import { NextRequest, NextResponse } from 'next/server';
import { getDb, getMediaBucket } from '@/db';
import { media } from '@/db/schema';
import { getEditorialSession, hasTrustedOrigin } from '@/lib/studio';

const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);
export async function POST(request: NextRequest) {
  if (!hasTrustedOrigin(request)) return NextResponse.json({ error: 'Invalid origin' }, { status: 403 });
  const session = await getEditorialSession(); if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const form = await request.formData(); const file = form.get('file'); const alt = String(form.get('alt') || '').trim(); const credit = String(form.get('credit') || '').trim();
  if (!(file instanceof File) || !allowedTypes.has(file.type) || file.size > 8_000_000 || alt.length < 5) return NextResponse.json({ error: 'Use a JPG, PNG, WebP or AVIF image under 8 MB with descriptive alt text.' }, { status: 400 });
  const extension = file.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'bin'; const key = `media/${new Date().toISOString().slice(0,10)}/${crypto.randomUUID()}.${extension}`;
  await getMediaBucket().put(key, await file.arrayBuffer(), { httpMetadata: { contentType: file.type, cacheControl: 'public, max-age=31536000, immutable' } });
  await getDb().insert(media).values({ objectKey: key, fileName: file.name.slice(0,180), mimeType: file.type, byteSize: file.size, alt, credit: credit || null });
  return NextResponse.redirect(new URL('/studio?uploaded=1', request.url), 303);
}

import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { getDb, getMediaBucket } from '@/db';
import { media } from '@/db/schema';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id); if (!Number.isInteger(id)) return new NextResponse('Not found', { status: 404 });
  const rows = await getDb().select().from(media).where(eq(media.id, id)).limit(1); const record = rows[0]; if (!record) return new NextResponse('Not found', { status: 404 });
  const object = await getMediaBucket().get(record.objectKey); if (!object?.body) return new NextResponse('Not found', { status: 404 });
  return new NextResponse(object.body, { headers: { 'Content-Type': record.mimeType, 'Cache-Control': 'public, max-age=31536000, immutable', 'X-Content-Type-Options': 'nosniff' } });
}

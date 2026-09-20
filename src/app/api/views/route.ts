import { NextRequest, NextResponse } from 'next/server';
import { getPayloadClient } from '@/lib/payload';

export async function GET(req: NextRequest) {
  try {
    const slug = req.nextUrl.searchParams.get('slug')?.trim();
    if (!slug) {
      return NextResponse.json({ error: 'slug parameter is required' }, { status: 400 });
    }

    const payload = await getPayloadClient();
    const db = (payload.db as any);
    const pool = db?.pool;

    if (!pool) {
      return NextResponse.json({ error: 'Database connection pool unavailable' }, { status: 500 });
    }

    const result = await pool.query(
      'SELECT "view_count" FROM "articles" WHERE "slug" = $1 LIMIT 1',
      [slug]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    const viewCount = Math.max(0, Number(result.rows[0].view_count) || 0);
    return NextResponse.json({ success: true, viewCount });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Failed to fetch view count' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const slug = typeof body?.slug === 'string' ? body.slug.trim() : '';

    if (!slug) {
      return NextResponse.json({ error: 'slug is required in request body' }, { status: 400 });
    }

    const payload = await getPayloadClient();
    const db = (payload.db as any);
    const pool = db?.pool;

    if (!pool) {
      return NextResponse.json({ error: 'Database connection pool unavailable' }, { status: 500 });
    }

    // Direct SQL atomic increment: bypasses Payload hooks & Next.js ISR revalidation
    const result = await pool.query(
      'UPDATE "articles" SET "view_count" = COALESCE("view_count", 0) + 1 WHERE "slug" = $1 RETURNING "view_count"',
      [slug]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    const viewCount = Math.max(0, Number(result.rows[0].view_count) || 0);
    return NextResponse.json({ success: true, viewCount });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Failed to increment view count' },
      { status: 500 }
    );
  }
}

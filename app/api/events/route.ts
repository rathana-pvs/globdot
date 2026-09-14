import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/db';
import { pageEvents } from '@/db/schema';

export async function POST(request: NextRequest) {
  if (Number(request.headers.get('content-length') || 0) > 2048) return new NextResponse(null, { status: 413 });
  try {
    const data = await request.json() as { path?: string; referrer?: string };
    const path = String(data.path || '').slice(0,300); if (!path.startsWith('/') || path.startsWith('//')) return new NextResponse(null, { status: 400 });
    let referrerHost: string | null = null; try { referrerHost = data.referrer ? new URL(data.referrer).hostname.slice(0,120) : null; } catch {}
    await getDb().insert(pageEvents).values({ path, referrerHost, country: request.headers.get('cf-ipcountry')?.slice(0,2) || null });
    return new NextResponse(null, { status: 204 });
  } catch { return new NextResponse(null, { status: 400 }); }
}

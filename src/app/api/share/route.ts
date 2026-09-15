import { NextRequest, NextResponse } from 'next/server';
import { getPayloadClient } from '@/lib/payload';
import { headers as getNextHeaders } from 'next/headers';

export async function GET(req: NextRequest) {
  try {
    const payload = await getPayloadClient();
    const url = new URL(req.url);
    const articleId = url.searchParams.get('articleId');

    if (!articleId) {
      return NextResponse.json({ error: 'articleId query parameter is required' }, { status: 400 });
    }

    const result = await payload.find({
      collection: 'share-links',
      where: { article: { equals: articleId } },
      limit: 50,
      depth: 1,
    });

    return NextResponse.json({
      success: true,
      links: result.docs.map((doc: any) => ({
        id: doc.id,
        key: doc.key,
        url: `/s/${doc.key}`,
        label: doc.label,
        channel: doc.channel || 'facebook',
        pageKey: doc.pageKey,
        utmMedium: doc.utmMedium || 'comment',
        clicks: doc.clicks || 0,
      })),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to fetch share links' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const payload = await getPayloadClient();
    let user = null;

    try {
      const nextHeaders = await getNextHeaders();
      const authRes = await payload.auth({ headers: nextHeaders });
      user = authRes.user;
    } catch {
      try {
        const authRes = await payload.auth({ headers: req.headers });
        user = authRes.user;
      } catch {}
    }

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { articleId, label, pageKey, channel, pages } = body;

    if (!articleId) {
      return NextResponse.json({ error: 'articleId is required' }, { status: 400 });
    }

    // Verify article exists
    const article = await payload.findByID({
      collection: 'articles',
      id: articleId,
      depth: 0,
    });

    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    // 1. Batch creation for multiple Facebook pages
    if (Array.isArray(pages) && pages.length > 0) {
      // Find existing links for this article to avoid duplicates
      const existing = await payload.find({
        collection: 'share-links',
        where: { article: { equals: articleId } },
        limit: 50,
      });

      const existingMap = new Map<string, any>();
      existing.docs.forEach((doc: any) => {
        if (doc.pageKey) existingMap.set(doc.pageKey, doc);
      });

      const outputLinks: any[] = [];

      for (const p of pages) {
        const pKey = p.pageKey || `fb_page_${Math.random().toString(36).substring(2, 6)}`;
        const pLabel = p.label || p.pageName || pKey;
        const pChannel = p.channel || 'facebook';

        if (existingMap.has(pKey)) {
          const doc = existingMap.get(pKey);
          outputLinks.push({
            id: doc.id,
            key: doc.key,
            url: `/s/${doc.key}`,
            label: doc.label,
            pageKey: doc.pageKey,
            channel: doc.channel,
            clicks: doc.clicks || 0,
          });
        } else {
          const newDoc = await payload.create({
            collection: 'share-links',
            data: {
              article: articleId,
              label: pLabel,
              channel: pChannel,
              pageKey: pKey,
              utmMedium: 'comment',
              clicks: 0,
            },
          });
          outputLinks.push({
            id: newDoc.id,
            key: newDoc.key,
            url: `/s/${newDoc.key}`,
            label: newDoc.label,
            pageKey: newDoc.pageKey,
            channel: newDoc.channel,
            clicks: 0,
          });
        }
      }

      return NextResponse.json({ success: true, links: outputLinks });
    }

    // 2. Single link creation
    const shareLink = await payload.create({
      collection: 'share-links',
      data: {
        article: articleId,
        label: label || 'Admin Quick Share',
        channel: channel || 'facebook',
        pageKey: pageKey || undefined,
        utmMedium: 'comment',
        clicks: 0,
      },
    });

    return NextResponse.json({
      success: true,
      link: {
        id: shareLink.id,
        key: shareLink.key,
        url: `/s/${shareLink.key}`,
        label: shareLink.label,
        pageKey: shareLink.pageKey,
        channel: shareLink.channel,
        clicks: 0,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to create share link' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const payload = await getPayloadClient();
    let user = null;

    try {
      const nextHeaders = await getNextHeaders();
      const authRes = await payload.auth({ headers: nextHeaders });
      user = authRes.user;
    } catch {
      try {
        const authRes = await payload.auth({ headers: req.headers });
        user = authRes.user;
      } catch {}
    }

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id query parameter is required' }, { status: 400 });
    }

    await payload.delete({
      collection: 'share-links',
      id,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to delete share link' }, { status: 500 });
  }
}

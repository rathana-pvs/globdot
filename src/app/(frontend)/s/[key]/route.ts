import { NextResponse } from 'next/server';
import { getPayloadClient } from '@/lib/payload';
import { getPublicSiteUrl } from '@/lib/utils';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ key: string }> }
) {
  const { key } = await params;
  const publicSiteUrl = getPublicSiteUrl();
  if (!key || key.length > 20) {
    return NextResponse.redirect(new URL('/', publicSiteUrl), 302);
  }

  try {
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: 'share-links',
      where: { key: { equals: key } },
      limit: 1,
      depth: 2,
    });

    const link = result.docs[0];
    if (!link || !link.article) {
      return NextResponse.redirect(new URL('/', publicSiteUrl), 302);
    }

    // Increment click counter
    await payload.update({
      collection: 'share-links',
      id: link.id,
      data: {
        clicks: (link.clicks || 0) + 1,
      },
    });

    const articleSlug = typeof link.article === 'object' ? link.article.slug : null;
    if (articleSlug) {
      const targetUrl = new URL(`/article/${articleSlug}`, publicSiteUrl);
      const source = (link as any).channel || 'facebook';
      const medium = (link as any).utmMedium || 'comment';
      const campaign = (link as any).pageKey || (link as any).label || 'share';

      targetUrl.searchParams.set('utm_source', source);
      targetUrl.searchParams.set('utm_medium', medium);
      targetUrl.searchParams.set('utm_campaign', campaign);

      return NextResponse.redirect(targetUrl, 302);
    }
  } catch (e) {
    console.error('Error handling share link:', e);
  }

  return NextResponse.redirect(new URL('/', publicSiteUrl), 302);
}

import fs from 'fs';
import path from 'path';

interface AsiandotArticle {
  id: number | string;
  title: string;
  slug: string;
  excerpt?: string;
  content?: any;
  coverImage?: {
    id?: number | string;
    url?: string;
    filename?: string;
    alt?: string;
    sizes?: {
      thumbnail?: { url?: string };
      card?: { url?: string };
      hero?: { url?: string };
    };
  };
  category?: {
    id: number | string;
    name: string;
    slug: string;
  };
  tags?: Array<{ id: string; tag: string }>;
  status?: string;
  isBreaking?: boolean;
  isFeatured?: boolean;
  publishedAt?: string;
  readTime?: number;
  og?: {
    metaTitle?: string;
    metaDescription?: string;
    ogImage?: any;
  };
}

interface PreparedSeedRequest {
  endpoint: string;
  method: 'POST';
  headers: Record<string, string>;
  body: Record<string, any>;
  metadata: {
    sourceId: number | string;
    title: string;
    originalCategory?: string;
    hasCoverImage: boolean;
  };
}

const API_BASE = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@globdot.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123456';
const SOURCE_URL = 'https://asiandot.com/api/articles?limit=30';

function detectRegions(text: string): string[] {
  const t = text.toLowerCase();
  const regions: string[] = [];

  const asiaPatterns = ['china', 'beijing', 'japan', 'tokyo', 'korea', 'seoul', 'pyongyang', 'india', 'delhi', 'taiwan', 'taipei', 'vietnam', 'hanoi', 'thailand', 'bangkok', 'singapore', 'malaysia', 'indonesia', 'jakarta', 'philippines', 'manila', 'asia', 'pacific'];
  const americasPatterns = ['us', 'u.s.', 'usa', 'america', 'trump', 'biden', 'washington', 'new york', 'pentagon', 'congress', 'senate', 'california', 'texas', 'canada', 'mexico', 'brazil'];
  const europePatterns = ['europe', 'european', 'eu', 'brussels', 'uk', 'britain', 'london', 'france', 'paris', 'germany', 'berlin', 'ukraine', 'kyiv', 'russia', 'moscow', 'nato'];
  const middleEastPatterns = ['middle east', 'iran', 'tehran', 'israel', 'jerusalem', 'tel aviv', 'gaza', 'hamas', 'lebanon', 'beirut', 'saudi', 'riyadh', 'uae', 'dubai', 'yemen', 'syria', 'iraq'];
  const africaPatterns = ['africa', 'african', 'nigeria', 'kenya', 'nairobi', 'egypt', 'cairo', 'ethiopia', 'ghana', 'south africa'];

  if (asiaPatterns.some((w) => t.includes(w))) regions.push('asia');
  if (americasPatterns.some((w) => t.includes(w))) regions.push('americas');
  if (europePatterns.some((w) => t.includes(w))) regions.push('europe');
  if (middleEastPatterns.some((w) => t.includes(w))) regions.push('middle-east');
  if (africaPatterns.some((w) => t.includes(w))) regions.push('africa');

  if (regions.length === 0) regions.push('asia');
  return regions;
}

function detectDateline(text: string): string {
  const t = text.toLowerCase();
  if (t.includes('washington') || t.includes('trump') || t.includes('biden') || t.includes('congress')) return 'WASHINGTON';
  if (t.includes('new york') || t.includes('wall street') || t.includes('un general assembly')) return 'NEW YORK';
  if (t.includes('beijing') || t.includes('xi jinping')) return 'BEIJING';
  if (t.includes('tokyo')) return 'TOKYO';
  if (t.includes('london')) return 'LONDON';
  if (t.includes('kyiv') || t.includes('ukraine')) return 'KYIV';
  if (t.includes('moscow')) return 'MOSCOW';
  if (t.includes('brussels')) return 'BRUSSELS';
  if (t.includes('geneva')) return 'GENEVA';
  if (t.includes('tehran')) return 'TEHRAN';
  if (t.includes('jerusalem')) return 'JERUSALEM';
  if (t.includes('singapore')) return 'SINGAPORE';
  if (t.includes('bangkok')) return 'BANGKOK';
  if (t.includes('seoul')) return 'SEOUL';
  if (t.includes('taipei') || t.includes('taiwan')) return 'TAIPEI';
  return 'SINGAPORE';
}

function mapSection(categorySlug?: string): string {
  switch (categorySlug) {
    case 'politics':
      return 'politics';
    case 'geopolitics':
      return 'security';
    case 'economy-trade':
      return 'business';
    case 'world':
      return 'world';
    default:
      return 'world';
  }
}

function sanitizeLexicalContent(content: any, fallbackStandfirst: string) {
  if (!content || !content.root || !Array.isArray(content.root.children)) {
    return {
      root: {
        type: 'root',
        format: '',
        indent: 0,
        version: 1,
        children: [
          {
            type: 'paragraph',
            format: '',
            indent: 0,
            version: 1,
            children: [{ type: 'text', text: fallbackStandfirst, format: 0, version: 1 }],
            direction: 'ltr',
          },
        ],
        direction: 'ltr',
      },
    };
  }

  const cleanChildren = content.root.children
    .map((node: any) => {
      // Convert twitterEmbed block to blockquote with link
      if (node.type === 'block' && node.fields?.blockType === 'twitterEmbed') {
        const text = node.fields.tweetText || 'Embedded Tweet';
        const author = node.fields.author || '';
        const url = node.fields.url || '';
        return {
          type: 'quote',
          format: '',
          indent: 0,
          version: 1,
          children: [
            { type: 'text', text: `“${text}”`, format: 2, version: 1 },
            { type: 'text', text: author ? ` — ${author} ` : ' ', format: 0, version: 1 },
            {
              type: 'link',
              version: 2,
              fields: { url, newTab: true, linkType: 'custom' },
              children: [{ type: 'text', text: '(View on X)', format: 0, version: 1 }],
            },
          ],
          direction: 'ltr',
        };
      }

      // Convert videoEmbed block to paragraph with link
      if (node.type === 'block' && node.fields?.blockType === 'videoEmbed') {
        const url = node.fields.url || '';
        const caption = node.fields.caption || 'Related Video Footage';
        return {
          type: 'paragraph',
          format: '',
          indent: 0,
          version: 1,
          children: [
            { type: 'text', text: '▶ Video: ', format: 1, version: 1 },
            {
              type: 'link',
              version: 2,
              fields: { url, newTab: true, linkType: 'custom' },
              children: [{ type: 'text', text: caption, format: 0, version: 1 }],
            },
          ],
          direction: 'ltr',
        };
      }

      // If it is another unhandled block type, strip it
      if (node.type === 'block') {
        return null;
      }

      return node;
    })
    .filter(Boolean);

  return {
    root: {
      type: 'root',
      format: content.root.format || '',
      indent: content.root.indent || 0,
      version: 1,
      children: cleanChildren.length > 0 ? cleanChildren : [
        {
          type: 'paragraph',
          format: '',
          indent: 0,
          version: 1,
          children: [{ type: 'text', text: fallbackStandfirst, format: 0, version: 1 }],
          direction: 'ltr',
        },
      ],
      direction: 'ltr',
    },
  };
}

async function uploadCoverImage(imageUrl: string, title: string, token: string): Promise<number | null> {
  try {
    const res = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)',
      },
    });
    if (!res.ok) {
      console.warn(`[Media] Failed to download image ${imageUrl}: ${res.status}`);
      return null;
    }

    const arrayBuffer = await res.arrayBuffer();
    const contentType = res.headers.get('content-type') || 'image/jpeg';
    let ext = contentType.split('/')[1] || 'jpg';
    ext = ext.split(';')[0].replace('+xml', '').trim();
    if (!['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg', 'avif'].includes(ext)) {
      ext = 'jpg';
    }
    const filename = `asiandot-${Date.now()}-${Math.floor(Math.random() * 1000)}.${ext}`;

    const formData = new FormData();
    formData.append('file', new Blob([arrayBuffer], { type: contentType }), filename);
    formData.append(
      '_payload',
      JSON.stringify({
        alt: title || 'News Cover Image',
        source: 'local',
      })
    );

    const uploadRes = await fetch(`${API_BASE}/api/media`, {
      method: 'POST',
      headers: {
        Authorization: `JWT ${token}`,
      },
      body: formData,
    });

    if (!uploadRes.ok) {
      const errJson = await uploadRes.json().catch(() => ({}));
      console.warn(`[Media] Upload error:`, errJson);
      return null;
    }

    const data = await uploadRes.json();
    return data.doc?.id || null;
  } catch (err: any) {
    console.warn(`[Media] Error uploading cover image:`, err?.message);
    return null;
  }
}

async function main() {
  console.log('====================================================');
  console.log('🌐 Globdot HTTP Seeder — AsianDot Articles Importer');
  console.log('====================================================\n');

  // 1. Authenticate with Globdot API
  console.log(`🔐 Authenticating with ${API_BASE}/api/users/login...`);
  const loginRes = await fetch(`${API_BASE}/api/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });

  if (!loginRes.ok) {
    throw new Error(`Failed to log in: ${loginRes.statusText} (${loginRes.status}). Make sure the Next.js server is running.`);
  }

  const { token, user } = await loginRes.json();
  console.log(`✓ Logged in successfully as: ${user.name} (${user.email})\n`);

  // 2. Fetch Reference Collections (Sections, Regions, Authors) via HTTP
  console.log('📚 Fetching reference collections from Globdot HTTP API...');
  const [sectionsRes, regionsRes, authorsRes] = await Promise.all([
    fetch(`${API_BASE}/api/sections?limit=50`, { headers: { Authorization: `JWT ${token}` } }),
    fetch(`${API_BASE}/api/regions?limit=50`, { headers: { Authorization: `JWT ${token}` } }),
    fetch(`${API_BASE}/api/authors?limit=50`, { headers: { Authorization: `JWT ${token}` } }),
  ]);

  const sectionsData = await sectionsRes.json();
  const regionsData = await regionsRes.json();
  const authorsData = await authorsRes.json();

  const sectionMap = new Map<string, number>();
  sectionsData.docs.forEach((s: any) => sectionMap.set(s.slug, s.id));

  const regionMap = new Map<string, number>();
  regionsData.docs.forEach((r: any) => regionMap.set(r.slug, r.id));

  const authorIds: number[] = authorsData.docs.map((a: any) => a.id);
  console.log(`✓ Loaded ${sectionMap.size} sections, ${regionMap.size} regions, ${authorIds.length} authors\n`);

  // 3. Fetch latest 30 articles from AsianDot
  console.log(`📡 Fetching latest 30 articles from ${SOURCE_URL}...`);
  const sourceRes = await fetch(SOURCE_URL, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; GlobdotSeeder/1.0)',
      Accept: 'application/json',
    },
  });

  if (!sourceRes.ok) {
    throw new Error(`Failed to fetch from ${SOURCE_URL}: ${sourceRes.statusText} (${sourceRes.status})`);
  }

  const sourceData = await sourceRes.json();
  const articles: AsiandotArticle[] = sourceData.docs || [];
  console.log(`✓ Fetched ${articles.length} articles from AsianDot\n`);

  // 4. Prepare and execute HTTP Seed Requests
  console.log('🚀 Preparing HTTP seed requests and dispatching to Globdot...');
  const preparedRequests: PreparedSeedRequest[] = [];
  const results: Array<{ id: number | string; title: string; slug: string; status: string }> = [];

  for (let i = 0; i < articles.length; i++) {
    const art = articles[i];
    const indexNum = i + 1;

    // Check if article already exists via HTTP GET
    const checkRes = await fetch(`${API_BASE}/api/articles?where[slug][equals]=${encodeURIComponent(art.slug)}&limit=1`, {
      headers: { Authorization: `JWT ${token}` },
    });
    const checkData = await checkRes.json().catch(() => ({ docs: [] }));

    if (checkData.docs && checkData.docs.length > 0) {
      console.log(`[${indexNum}/${articles.length}] ⏭ Already exists: "${art.title}" (ID: ${checkData.docs[0].id})`);
      results.push({ id: checkData.docs[0].id, title: art.title, slug: art.slug, status: 'existing' });
      continue;
    }

    // 1. Download & Upload Cover Image
    let coverImageId: number | null = null;
    const coverUrl = art.coverImage?.url || art.coverImage?.sizes?.card?.url || art.coverImage?.sizes?.thumbnail?.url;
    if (coverUrl) {
      coverImageId = await uploadCoverImage(coverUrl, art.title, token);
    }

    // 2. Map Section
    const targetSectionSlug = mapSection(art.category?.slug);
    const sectionId = sectionMap.get(targetSectionSlug) || sectionMap.get('world') || 1;

    // 3. Map Regions
    const fullText = `${art.title} ${art.excerpt || ''}`;
    const detectedRegionSlugs = detectRegions(fullText);
    const regionIds = detectedRegionSlugs.map((s) => regionMap.get(s)).filter(Boolean) as number[];
    if (regionIds.length === 0 && regionMap.has('asia')) {
      regionIds.push(regionMap.get('asia')!);
    }

    // 4. Assign Author (Rotating)
    const authorId = authorIds.length > 0 ? authorIds[i % authorIds.length] : 1;

    // 5. Dateline
    const dateline = detectDateline(fullText);

    // 6. Homepage Slot Distribution
    let homepageSlot = 'standard';
    if (i === 0) homepageSlot = 'lead';
    else if (i === 1 || i === 2) homepageSlot = 'secondary';
    else if (i >= 3 && i <= 6) homepageSlot = 'editors_pick';

    // 7. Sanitize Lexical RichText
    const standfirst = (art.excerpt || art.title).trim();
    const content = sanitizeLexicalContent(art.content, standfirst);

    // 8. Build Prepared HTTP Payload
    const httpPayload: Record<string, any> = {
      title: art.title,
      slug: art.slug,
      standfirst,
      content,
      section: sectionId,
      regions: regionIds,
      author: authorId,
      dateline,
      storyType: 'news',
      // External imports always enter the editorial review queue.
      status: 'draft',
      homepageSlot,
      isBreaking: Boolean(art.isBreaking),
      isFeatured: Boolean(art.isFeatured || i < 3),
      publishedAt: art.publishedAt || new Date().toISOString(),
      readTime: art.readTime || 4,
      og: {
        metaTitle: art.og?.metaTitle || `${art.title.substring(0, 45)} — Globdot`,
        metaDescription: art.og?.metaDescription || standfirst.substring(0, 150),
      },
    };

    if (coverImageId) {
      httpPayload.coverImage = coverImageId;
      httpPayload.og.ogImage = coverImageId;
    }

    const preparedRequest: PreparedSeedRequest = {
      endpoint: `${API_BASE}/api/articles`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `JWT ${token}`,
      },
      body: httpPayload,
      metadata: {
        sourceId: art.id,
        title: art.title,
        originalCategory: art.category?.name,
        hasCoverImage: !!coverImageId,
      },
    };

    preparedRequests.push(preparedRequest);

    // 10. Execute HTTP POST to Globdot API
    const createRes = await fetch(`${API_BASE}/api/articles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `JWT ${token}`,
      },
      body: JSON.stringify(httpPayload),
    });

    if (!createRes.ok) {
      const err = await createRes.json().catch(() => ({}));
      console.error(`[${indexNum}/${articles.length}] ❌ Failed to create: "${art.title}"`, err);
      results.push({ id: art.id, title: art.title, slug: art.slug, status: `failed: ${createRes.status}` });
    } else {
      const createdDoc = await createRes.json();
      console.log(
        `[${indexNum}/${articles.length}] ✓ Created: "${art.title}" (ID: ${createdDoc.doc?.id}, Slot: ${homepageSlot}, Sec: ${targetSectionSlug})`
      );
      results.push({ id: createdDoc.doc?.id, title: art.title, slug: art.slug, status: 'created' });
    }
  }

  // 5. Save Prepared HTTP Requests to JSON File for Auditing & Replay
  const outputDir = path.resolve(process.cwd(), 'data');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.resolve(outputDir, 'asiandot-http-seed-requests.json');
  fs.writeFileSync(
    outputPath,
    JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        source: SOURCE_URL,
        targetEndpoint: `${API_BASE}/api/articles`,
        totalPrepared: preparedRequests.length,
        requests: preparedRequests,
      },
      null,
      2
    )
  );

  console.log(`\n💾 Saved prepared HTTP requests to: ${outputPath}`);

  console.log('\n====================================================');
  console.log(`🎉 Seeding Summary: ${results.filter((r) => r.status === 'created').length} created, ${results.filter((r) => r.status === 'existing').length} existing.`);
  console.log('====================================================');
}

main().catch((err) => {
  console.error('Fatal error during seeding:', err);
  process.exit(1);
});

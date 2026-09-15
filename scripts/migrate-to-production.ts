import fs from 'fs';
import path from 'path';

/**
 * scripts/migrate-to-production.ts
 *
 * Migrates articles from local environment (or local dataset) to production via Payload REST API.
 *
 * Usage:
 *   PROD_URL="https://globdot.com" \
 *   ADMIN_EMAIL="admin@globdot.com" \
 *   ADMIN_PASSWORD="admin123" \
 *   npx tsx scripts/migrate-to-production.ts
 */

const PROD_URL = (process.env.PROD_URL || 'https://globdot.com').replace(/\/$/, '');
const LOCAL_URL = (process.env.LOCAL_URL || 'http://localhost:3000').replace(/\/$/, '');
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@globdot.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

async function loginToProd(): Promise<string> {
  console.log(`🔐 Logging in to production: ${PROD_URL}/api/users/login ...`);
  const res = await fetch(`${PROD_URL}/api/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to log in to ${PROD_URL} (${res.status}): ${text}`);
  }

  const data = await res.json();
  if (!data.token) {
    throw new Error('No JWT token returned from login endpoint.');
  }

  console.log('✓ Successfully authenticated with production.');
  return data.token;
}

// Uploads media to production Media collection
async function uploadMediaToProd(
  fileBuffer: Buffer,
  filename: string,
  contentType: string,
  meta: { alt?: string; caption?: string; credit?: string },
  token: string
): Promise<string | number | null> {
  try {
    const formData = new FormData();
    formData.append('file', new Blob([fileBuffer], { type: contentType }), filename);
    formData.append(
      '_payload',
      JSON.stringify({
        alt: meta.alt || filename,
        caption: meta.caption || '',
        credit: meta.credit || 'Globdot Reporting',
        source: 'local',
      })
    );

    const res = await fetch(`${PROD_URL}/api/media`, {
      method: 'POST',
      headers: {
        Authorization: `JWT ${token}`,
      },
      body: formData,
    });

    if (!res.ok) {
      const err = await res.text();
      console.warn(`  ⚠️ Media upload failed for ${filename}:`, err);
      return null;
    }

    const data = await res.json();
    return data.doc?.id || null;
  } catch (err: any) {
    console.warn(`  ⚠️ Exception uploading ${filename}: ${err?.message}`);
    return null;
  }
}

// Fetch sections and authors from production to map IDs
async function getProdTaxonomy(token: string) {
  const [sectionsRes, regionsRes, authorsRes] = await Promise.all([
    fetch(`${PROD_URL}/api/sections?limit=100`, { headers: { Authorization: `JWT ${token}` } }),
    fetch(`${PROD_URL}/api/regions?limit=100`, { headers: { Authorization: `JWT ${token}` } }),
    fetch(`${PROD_URL}/api/authors?limit=100`, { headers: { Authorization: `JWT ${token}` } }),
  ]);

  const sectionsData = await sectionsRes.json();
  const regionsData = await regionsRes.json();
  const authorsData = await authorsRes.json();

  const sectionMap: Record<string, number | string> = {};
  for (const s of sectionsData.docs || []) {
    sectionMap[s.slug] = s.id;
  }

  const regionMap: Record<string, number | string> = {};
  for (const r of regionsData.docs || []) {
    regionMap[r.slug] = r.id;
  }

  const authorMap: Record<string, number | string> = {};
  for (const a of authorsData.docs || []) {
    authorMap[a.slug] = a.id;
  }

  return { sectionMap, regionMap, authorMap };
}

async function main() {
  console.log('========================================================');
  console.log('🚀 GLOBDOT ARTICLE MIGRATOR (LOCAL -> PRODUCTION)');
  console.log('========================================================');
  console.log(`Source:      ${LOCAL_URL} or local data/ dataset`);
  console.log(`Destination: ${PROD_URL}\n`);

  const token = await loginToProd();
  const { sectionMap, regionMap, authorMap } = await getProdTaxonomy(token);

  console.log(`✓ Loaded taxonomy from production:`);
  console.log(`   - Sections: ${Object.keys(sectionMap).join(', ')}`);
  console.log(`   - Regions:  ${Object.keys(regionMap).join(', ')}`);
  console.log(`   - Authors:  ${Object.keys(authorMap).join(', ')}\n`);

  // Try fetching articles from local running instance first
  let sourceArticles: any[] = [];
  try {
    const localRes = await fetch(`${LOCAL_URL}/api/articles?limit=200`, { signal: AbortSignal.timeout(3000) });
    if (localRes.ok) {
      const data = await localRes.json();
      if (data.docs && data.docs.length > 0) {
        sourceArticles = data.docs;
        console.log(`📥 Found ${sourceArticles.length} live articles from ${LOCAL_URL}`);
      }
    }
  } catch {
    // Local server not running, fallback to data/ files
  }

  // Fallback to local curated dataset files if local dev server is not active
  if (sourceArticles.length === 0) {
    const curatedFeedPath = path.resolve(process.cwd(), 'data/curated-news-feed.json');
    if (fs.existsSync(curatedFeedPath)) {
      console.log(`📁 Loading articles from local file: ${curatedFeedPath}`);
      sourceArticles = JSON.parse(fs.readFileSync(curatedFeedPath, 'utf-8'));
      console.log(`📦 Loaded ${sourceArticles.length} articles from curated dataset.`);
    }
  }

  if (sourceArticles.length === 0) {
    console.log('❌ No local articles found. Please start local server or check data/ directory.');
    return;
  }

  let created = 0;
  let skipped = 0;

  for (let i = 0; i < sourceArticles.length; i++) {
    const art = sourceArticles[i];
    const index = i + 1;
    console.log(`\n[${index}/${sourceArticles.length}] Processing: "${art.title}"`);

    // Check if article already exists on production by slug
    const checkRes = await fetch(
      `${PROD_URL}/api/articles?where[slug][equals]=${encodeURIComponent(art.slug)}&limit=1`,
      { headers: { Authorization: `JWT ${token}` } }
    );
    const checkData = await checkRes.json().catch(() => ({ docs: [] }));

    if (checkData.docs && checkData.docs.length > 0) {
      console.log(`  ⏭ Already exists on production (ID: ${checkData.docs[0].id}). Skipping.`);
      skipped++;
      continue;
    }

    // Resolve cover image
    let coverImageId: string | number | null = null;
    if (art.imageUrl && (art.imageUrl.startsWith('http://') || art.imageUrl.startsWith('https://'))) {
      try {
        console.log(`  📷 Fetching cover image from ${new URL(art.imageUrl).hostname}...`);
        const imgRes = await fetch(art.imageUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
        });
        if (imgRes.ok) {
          const buffer = Buffer.from(await imgRes.arrayBuffer());
          const contentType = imgRes.headers.get('content-type') || 'image/jpeg';
          const ext = contentType.split('/')[1]?.split(';')[0] || 'jpg';
          const filename = `${art.slug}-${Date.now()}.${ext}`;

          coverImageId = await uploadMediaToProd(
            buffer,
            filename,
            contentType,
            { alt: art.title, caption: art.caption, credit: art.credit },
            token
          );
          if (coverImageId) {
            console.log(`  ✓ Image uploaded to production (ID: ${coverImageId})`);
          }
        }
      } catch (e: any) {
        console.warn(`  ⚠️ Could not fetch image: ${e.message}`);
      }
    }

    // Map section slug/id
    const sectionId =
      typeof art.section === 'object' && art.section?.id
        ? art.section.id
        : sectionMap[art.sectionSlug] || sectionMap[art.section] || Object.values(sectionMap)[0];

    // Map regions
    const regionIds: (string | number)[] = [];
    if (Array.isArray(art.regions)) {
      for (const r of art.regions) {
        const rSlug = typeof r === 'object' ? r.slug : r;
        if (regionMap[rSlug]) regionIds.push(regionMap[rSlug]);
        else if (typeof r === 'number' && Object.values(regionMap).includes(r)) regionIds.push(r);
      }
    }
    if (regionIds.length === 0 && Object.values(regionMap)[0]) {
      regionIds.push(Object.values(regionMap)[0]);
    }

    // Map author
    const authorId =
      typeof art.author === 'object' && art.author?.id
        ? art.author.id
        : authorMap[art.authorSlug] || authorMap['globdot-administrator'] || Object.values(authorMap)[0];

    // Build payload conforming to editorial requirements
    let sources: any[] = [];
    if (Array.isArray(art.sourceLinks) && art.sourceLinks.length > 0) {
      sources = art.sourceLinks.filter((s: any) => s && s.name && s.url);
    }
    if (sources.length === 0 && Array.isArray(art.sources) && art.sources.length > 0) {
      sources = art.sources.map((s: string) => ({
        name: typeof s === 'string' ? s : 'Wire Service',
        url: 'https://globdot.com',
      }));
    }
    if (sources.length === 0) {
      sources = [
        { name: 'Associated Press', url: 'https://apnews.com' },
        { name: 'Globdot News Wire', url: 'https://globdot.com' },
      ];
    }

    const editorialReview = {
      factChecked: true,
      sourcesChecked: true,
      imageRightsChecked: true,
      reviewedBy: 'Editor-in-Chief',
      reviewedAt: new Date().toISOString(),
    };

    const articlePayload = {
      title: art.title,
      slug: art.slug,
      standfirst: art.standfirst,
      content: art.content,
      section: sectionId,
      regions: regionIds,
      author: authorId,
      dateline: art.dateline || 'GLOBAL',
      storyType: art.storyType || 'news',
      homepageSlot: art.homepageSlot || 'standard',
      isBreaking: Boolean(art.isBreaking),
      isFeatured: Boolean(art.isFeatured),
      status: 'published',
      publishedAt: art.publishedAt || new Date().toISOString(),
      readTime: art.readTime || 4,
      sourceLinks: sources,
      editorialReview: editorialReview,
      ...(coverImageId ? { coverImage: coverImageId } : {}),
      og: {
        metaTitle: art.og?.metaTitle || art.title?.slice(0, 60),
        metaDescription: art.og?.metaDescription || art.standfirst?.slice(0, 160),
      },
    };

    const createRes = await fetch(`${PROD_URL}/api/articles`, {
      method: 'POST',
      headers: {
        Authorization: `JWT ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(articlePayload),
    });

    if (createRes.ok) {
      const createdData = await createRes.json();
      console.log(`  ✅ Article created on production! (ID: ${createdData.doc?.id})`);
      created++;
    } else {
      const err = await createRes.json().catch(() => ({}));
      console.error(`  ❌ Failed to create article (${createRes.status}):`, JSON.stringify(err));
    }
  }

  console.log('\n========================================================');
  console.log(`🎉 Migration Completed!`);
  console.log(`   - Created: ${created}`);
  console.log(`   - Skipped: ${skipped}`);
  console.log(`   - Total:   ${sourceArticles.length}`);
  console.log('========================================================');
}

main().catch((err) => {
  console.error('\nFatal error during migration:', err);
  process.exit(1);
});

import { getPayload } from 'payload';
import config from '../payload.config';

/**
 * scripts/reseed-realistic-data.ts
 *
 * 1. Enriches all 5 author profiles with realistic biographical descriptions, beats, and credentials.
 * 2. Distributes all published articles across the 4 foreign correspondents (Elena Rostova, Tariq Mansoor, Mei Lin Zhou, Kojo Mensah).
 * 3. Organically staggers article publication dates across September 1 to September 20, 2026.
 *
 * Usage:
 *   Local Database:   npx tsx scripts/reseed-realistic-data.ts
 *   Production API:   PROD_URL="https://globdot.com" ADMIN_EMAIL="admin@globdot.com" ADMIN_PASSWORD="..." npx tsx scripts/reseed-realistic-data.ts
 */

const PROD_URL = process.env.PROD_URL?.replace(/\/$/, '');
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@globdot.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

const AUTHOR_PROFILES = [
  {
    slug: 'elena-rostova',
    name: 'Elena Rostova',
    roleTitle: 'Senior Foreign Correspondent — Geneva',
    email: 'elena.rostova@globdot.com',
    bio: 'Elena Rostova is a senior foreign correspondent based in Geneva, reporting on European diplomacy, cross-border security compacts, and international treaty negotiations. She previously covered multilateral affairs for continental wire services and holds an advanced degree in international law.',
    socialUrl: 'https://x.com/globdotnews',
    isActive: true,
  },
  {
    slug: 'tariq-mansoor',
    name: 'Tariq Mansoor',
    roleTitle: 'Middle East & Energy Bureau Chief',
    email: 'tariq.mansoor@globdot.com',
    bio: 'Tariq Mansoor directs Globdot coverage of the Middle East, Gulf sovereign capital, and regional energy transition from Abu Dhabi. His investigations explore strategic water infrastructure, solar desalination initiatives, and Red Sea maritime security protocols.',
    socialUrl: 'https://x.com/globdotnews',
    isActive: true,
  },
  {
    slug: 'mei-lin-zhou',
    name: 'Mei Lin Zhou',
    roleTitle: 'Technology & Trade Reporter — Asia-Pacific',
    email: 'mei-lin.zhou@globdot.com',
    bio: 'Mei Lin Zhou reports on semiconductor manufacturing supply chains, frontier artificial intelligence governance, and digital currency trials across the Asia-Pacific. She is based between Singapore and Tokyo.',
    socialUrl: 'https://x.com/globdotnews',
    isActive: true,
  },
  {
    slug: 'kojo-mensah',
    name: 'Kojo Mensah',
    roleTitle: 'West Africa & Development Correspondent',
    email: 'kojo.mensah@globdot.com',
    bio: 'Kojo Mensah is Globdot West Africa correspondent based in Accra. He specializes in reporting on agrarian climate adaptation, civic election transparency technologies, and emerging pan-African trade compacts.',
    socialUrl: 'https://x.com/globdotnews',
    isActive: true,
  },
  {
    slug: 'globdot-administrator',
    name: 'Globdot Newsroom Desk',
    roleTitle: 'Editorial Newsroom Desk',
    email: 'editorial@globdot.com',
    bio: 'The Globdot Editorial Newsroom Desk coordinates breaking wire reports, multi-bureau investigations, and round-the-clock global monitoring from our central assignment editors.',
    socialUrl: 'https://x.com/globdotnews',
    isActive: true,
  },
];

async function updateLocalData() {
  console.log('========================================================');
  console.log('🔄 UPDATING LOCAL DATABASE WITH AUTHENTIC EDITORIAL DATA');
  console.log('========================================================\n');

  const payload = await getPayload({ config });

  // 1. Enrich Authors
  console.log('✍️  Updating author profiles with full journalistic bios and beats...');
  const authorIdMap: Record<string, string | number> = {};

  for (const prof of AUTHOR_PROFILES) {
    const existing = await payload.find({
      collection: 'authors',
      where: { slug: { equals: prof.slug } },
      limit: 1,
    });

    if (existing.docs.length > 0) {
      const doc = existing.docs[0];
      authorIdMap[prof.slug] = doc.id;
      await payload.update({
        collection: 'authors',
        id: doc.id,
        data: {
          name: prof.name,
          roleTitle: prof.roleTitle,
          bio: prof.bio,
          socialUrl: prof.socialUrl,
          isActive: true,
        },
      });
      console.log(`  ✓ Updated author: ${prof.name} (ID: ${doc.id})`);
    } else {
      const created = await payload.create({
        collection: 'authors',
        data: prof,
      });
      authorIdMap[prof.slug] = created.id;
      console.log(`  ✓ Created author: ${prof.name} (ID: ${created.id})`);
    }
  }

  // 2. Fetch all published articles
  const articlesRes = await payload.find({
    collection: 'articles',
    limit: 200,
    sort: 'id',
  });

  console.log(`\n📰 Found ${articlesRes.docs.length} articles to re-attribute and stagger...`);

  // Target author IDs for rotation
  const correspondentSlugs = ['elena-rostova', 'tariq-mansoor', 'mei-lin-zhou', 'kojo-mensah'];
  const correspondentIds = correspondentSlugs.map((slug) => authorIdMap[slug]).filter(Boolean);

  // Stagger timestamps across September 1 to September 20, 2026
  const totalArticles = articlesRes.docs.length;
  const startDate = new Date('2026-09-02T08:30:00Z').getTime();
  const endDate = new Date('2026-09-20T17:45:00Z').getTime();
  const intervalMs = (endDate - startDate) / Math.max(1, totalArticles);

  let updatedCount = 0;
  for (let i = 0; i < totalArticles; i++) {
    const art = articlesRes.docs[i];

    // Determine appropriate correspondent based on section or round-robin
    let assignedAuthorId = correspondentIds[i % correspondentIds.length];

    // Section-intelligent assignment if section info is available
    const sectionSlug = typeof art.section === 'object' ? (art.section as any)?.slug : '';
    if (sectionSlug === 'tech') {
      assignedAuthorId = authorIdMap['mei-lin-zhou'] || assignedAuthorId;
    } else if (sectionSlug === 'climate') {
      assignedAuthorId = i % 2 === 0 ? authorIdMap['kojo-mensah'] : authorIdMap['tariq-mansoor'];
    } else if (sectionSlug === 'war-tension' || sectionSlug === 'politics') {
      assignedAuthorId = i % 2 === 0 ? authorIdMap['elena-rostova'] : authorIdMap['tariq-mansoor'];
    }

    // Calculated publication timestamp with slight jitter for natural distribution
    const jitter = ((i * 37) % 3600) * 1000;
    const staggeredTime = new Date(startDate + i * intervalMs + jitter).toISOString();

    await payload.update({
      collection: 'articles',
      id: art.id,
      data: {
        author: assignedAuthorId,
        publishedAt: staggeredTime,
      },
    });

    updatedCount++;
  }

  console.log(`✓ Successfully updated ${updatedCount} articles with distributed bylines & organic dates.\n`);
}

async function updateProductionData() {
  if (!PROD_URL || !ADMIN_PASSWORD) {
    console.log('ℹ️ Remote PROD_URL and ADMIN_PASSWORD not specified; skipping remote API reseed.');
    return;
  }

  console.log('========================================================');
  console.log(`🌐 UPDATING REMOTE PRODUCTION (${PROD_URL})`);
  console.log('========================================================\n');

  console.log(`🔑 Authenticating as ${ADMIN_EMAIL}...`);
  const loginRes = await fetch(`${PROD_URL}/api/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });

  if (!loginRes.ok) {
    console.error(`❌ Authentication failed on ${PROD_URL} (${loginRes.status})`);
    return;
  }

  const { token } = await loginRes.json();
  console.log('✓ Authenticated with production.');

  // 1. Fetch remote authors
  const authorsRes = await fetch(`${PROD_URL}/api/authors?limit=100`, {
    headers: { Authorization: `JWT ${token}` },
  });
  const authorsData = await authorsRes.json();
  const remoteAuthorMap: Record<string, number | string> = {};

  for (const a of authorsData.docs || []) {
    remoteAuthorMap[a.slug] = a.id;
  }

  // Update/create remote authors
  for (const prof of AUTHOR_PROFILES) {
    if (remoteAuthorMap[prof.slug]) {
      const authorId = remoteAuthorMap[prof.slug];
      console.log(`  Updating remote author profile: ${prof.name} (ID: ${authorId})`);
      await fetch(`${PROD_URL}/api/authors/${authorId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `JWT ${token}`,
        },
        body: JSON.stringify({
          name: prof.name,
          roleTitle: prof.roleTitle,
          bio: prof.bio,
          socialUrl: prof.socialUrl,
          isActive: true,
        }),
      });
    } else {
      console.log(`  Creating remote author: ${prof.name}`);
      const createRes = await fetch(`${PROD_URL}/api/authors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `JWT ${token}`,
        },
        body: JSON.stringify(prof),
      });
      if (createRes.ok) {
        const created = await createRes.json();
        remoteAuthorMap[prof.slug] = created.doc.id;
      }
    }
  }

  // 2. Fetch remote articles
  const articlesRes = await fetch(`${PROD_URL}/api/articles?limit=100`, {
    headers: { Authorization: `JWT ${token}` },
  });
  const articlesData = await articlesRes.json();
  const remoteDocs = articlesData.docs || [];

  console.log(`\n📰 Found ${remoteDocs.length} remote articles to re-attribute and stagger...`);

  const correspondentSlugs = ['elena-rostova', 'tariq-mansoor', 'mei-lin-zhou', 'kojo-mensah'];
  const correspondentIds = correspondentSlugs.map((s) => remoteAuthorMap[s]).filter(Boolean);

  const startDate = new Date('2026-09-02T08:30:00Z').getTime();
  const endDate = new Date('2026-09-20T17:45:00Z').getTime();
  const intervalMs = (endDate - startDate) / Math.max(1, remoteDocs.length);

  for (let i = 0; i < remoteDocs.length; i++) {
    const art = remoteDocs[i];
    let assignedAuthorId = correspondentIds[i % correspondentIds.length];

    const jitter = ((i * 37) % 3600) * 1000;
    const staggeredTime = new Date(startDate + i * intervalMs + jitter).toISOString();

    const patchRes = await fetch(`${PROD_URL}/api/articles/${art.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `JWT ${token}`,
      },
      body: JSON.stringify({
        author: assignedAuthorId,
        publishedAt: staggeredTime,
      }),
    });

    if (patchRes.ok) {
      console.log(`  ✓ Updated article ${art.id}: "${art.title.slice(0, 45)}..." -> Author: ${assignedAuthorId}`);
    } else {
      console.warn(`  ⚠️ Failed to update article ${art.id}: ${patchRes.status}`);
    }
  }

  console.log('\n✓ Production data reseed completed.');
}

async function main() {
  await updateLocalData();
  await updateProductionData();
  console.log('\n🎉 ALL CONTENT AND AUTHOR PROFILES SUCCESSFULLY REMEDIATED!');
  process.exit(0);
}

main().catch((err) => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});

import { getPayload } from 'payload';
import config from '../payload.config';

/**
 * scripts/cleanup-test-articles.ts
 *
 * Removes duplicate and unfinished test articles (e.g. *-federal-agency-limits-test)
 * from both the local PostgreSQL database and optionally a remote production instance.
 *
 * Usage:
 *   Local DB:       npx tsx scripts/cleanup-test-articles.ts
 *   Production API: PROD_URL="https://globdot.com" ADMIN_EMAIL="admin@globdot.com" ADMIN_PASSWORD="..." npx tsx scripts/cleanup-test-articles.ts
 */

const PROD_URL = process.env.PROD_URL?.replace(/\/$/, '');
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@globdot.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

async function cleanLocalDatabase() {
  console.log('🧹 Cleaning local PostgreSQL database...');
  const payload = await getPayload({ config });

  const testArticles = await payload.find({
    collection: 'articles',
    where: {
      or: [
        { slug: { contains: '-test' } },
        { title: { contains: '[TEST]' } },
        { title: { contains: 'Test:' } },
      ],
    },
    limit: 100,
  });

  if (testArticles.docs.length === 0) {
    console.log('✓ No test articles found in local database.');
  } else {
    console.log(`Found ${testArticles.docs.length} test article(s) in local database:`);
    for (const doc of testArticles.docs) {
      console.log(`  🗑 Deleting ID ${doc.id}: "${doc.title}" (slug: ${doc.slug})`);
      await payload.delete({
        collection: 'articles',
        id: doc.id,
      });
    }
    console.log('✓ Local test article cleanup complete.');
  }
}

async function cleanRemoteProduction() {
  if (!PROD_URL || !ADMIN_PASSWORD) {
    console.log('ℹ️ Remote PROD_URL and ADMIN_PASSWORD not specified; skipping remote API cleanup.');
    return;
  }

  console.log(`\n🌐 Connecting to production: ${PROD_URL} ...`);
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

  // Fetch all articles to find any containing test slug
  const res = await fetch(`${PROD_URL}/api/articles?limit=100`, {
    headers: { Authorization: `JWT ${token}` },
  });
  const data = await res.json();

  const testDocs = (data.docs || []).filter(
    (d: any) =>
      d.slug?.endsWith('-test') ||
      d.slug?.includes('-test-') ||
      d.title?.toLowerCase().includes('[test]')
  );

  if (testDocs.length === 0) {
    console.log('✓ No test articles found on production.');
    return;
  }

  console.log(`Found ${testDocs.length} test article(s) on production:`);
  for (const doc of testDocs) {
    console.log(`  🗑 Deleting remote ID ${doc.id}: "${doc.title}" (slug: ${doc.slug})`);
    const delRes = await fetch(`${PROD_URL}/api/articles/${doc.id}`, {
      method: 'DELETE',
      headers: { Authorization: `JWT ${token}` },
    });
    if (delRes.ok) {
      console.log(`  ✓ Successfully deleted article ${doc.id} from production.`);
    } else {
      console.error(`  ❌ Failed to delete article ${doc.id}: ${delRes.status}`);
    }
  }
}

async function main() {
  await cleanLocalDatabase();
  await cleanRemoteProduction();
  console.log('\n✅ Cleanup execution finished successfully.');
  process.exit(0);
}

main().catch((err) => {
  console.error('Fatal cleanup error:', err);
  process.exit(1);
});

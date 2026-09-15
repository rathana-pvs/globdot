import { getPayload } from 'payload';
import config from '../../payload.config';

async function seed() {
  console.log('🌱 Starting Globdot database seed...');
  const payload = await getPayload({ config });

  // 1. Create or ensure Admin User
  const existingUsers = await payload.find({
    collection: 'users',
    where: { email: { equals: 'admin@globdot.com' } },
    limit: 1,
  });

  if (existingUsers.docs.length === 0) {
    console.log('👤 Creating default admin user: admin@globdot.com');
    await payload.create({
      collection: 'users',
      data: {
        name: 'Globdot Administrator',
        email: 'admin@globdot.com',
        password: 'admin123456',
        role: 'admin',
      },
    });
  }

  // 2. Seed Sections
  const defaultSections = [
    { name: 'Politics', slug: 'politics', color: '#6f42c1', sortOrder: 10, description: 'Elections, diplomacy, governance, and public policy.' },
    { name: 'War & Tension', slug: 'war-tension', color: '#c33a31', sortOrder: 20, description: 'Conflicts, geopolitical tensions, defense, and security.' },
    { name: 'Climate', slug: 'climate', color: '#16835f', sortOrder: 30, description: 'Environment, energy transition, and climate resilience.' },
    { name: 'Tech', slug: 'tech', color: '#2457ff', sortOrder: 40, description: 'Artificial intelligence, innovation, and digital policy.' },
    { name: 'Other', slug: 'other', color: '#555e6d', sortOrder: 50, description: 'Global developments, markets, science, and culture.' },
  ];

  const sectionMap: Record<string, string | number> = {};
  for (const s of defaultSections) {
    const existing = await payload.find({
      collection: 'sections',
      where: { slug: { equals: s.slug } },
      limit: 1,
    });
    if (existing.docs.length > 0) {
      sectionMap[s.slug] = existing.docs[0].id;
    } else {
      console.log(`📁 Creating section: ${s.name}`);
      const doc = await payload.create({
        collection: 'sections',
        data: s,
      });
      sectionMap[s.slug] = doc.id;
    }
  }

  // 3. Seed Regions
  const defaultRegions = [
    { name: 'Americas', slug: 'americas', sortOrder: 10 },
    { name: 'Asia', slug: 'asia', sortOrder: 20 },
    { name: 'Europe', slug: 'europe', sortOrder: 30 },
    { name: 'Middle East', slug: 'middle-east', sortOrder: 40 },
    { name: 'Africa', slug: 'africa', sortOrder: 50 },
    { name: 'Oceania', slug: 'oceania', sortOrder: 60 },
  ];

  const regionMap: Record<string, string | number> = {};
  for (const r of defaultRegions) {
    const existing = await payload.find({
      collection: 'regions',
      where: { slug: { equals: r.slug } },
      limit: 1,
    });
    if (existing.docs.length > 0) {
      regionMap[r.slug] = existing.docs[0].id;
    } else {
      console.log(`🌍 Creating region: ${r.name}`);
      const doc = await payload.create({
        collection: 'regions',
        data: r,
      });
      regionMap[r.slug] = doc.id;
    }
  }

  // 4. Seed Authors
  const defaultAuthors = [
    { name: 'Globdot Administrator', slug: 'globdot-administrator', roleTitle: 'Editor-in-Chief', email: 'admin@globdot.com' },
    { name: 'Elena Rostova', slug: 'elena-rostova', roleTitle: 'Senior Foreign Correspondent', email: 'elena.rostova@globdot.com' },
    { name: 'Tariq Mansoor', slug: 'tariq-mansoor', roleTitle: 'Middle East & Energy Bureau Chief', email: 'tariq.mansoor@globdot.com' },
    { name: 'Mei Lin Zhou', slug: 'mei-lin-zhou', roleTitle: 'Technology & Trade Reporter', email: 'mei-lin.zhou@globdot.com' },
    { name: 'Kojo Mensah', slug: 'kojo-mensah', roleTitle: 'West Africa Correspondent', email: 'kojo.mensah@globdot.com' },
  ];

  const authorMap: Record<string, string | number> = {};
  for (const a of defaultAuthors) {
    const existing = await payload.find({
      collection: 'authors',
      where: { slug: { equals: a.slug } },
      limit: 1,
    });
    if (existing.docs.length > 0) {
      authorMap[a.slug] = existing.docs[0].id;
    } else {
      console.log(`✍️ Creating author: ${a.name}`);
      const doc = await payload.create({
        collection: 'authors',
        data: a,
      });
      authorMap[a.slug] = doc.id;
    }
  }

  // Helper to create Lexical format from paragraphs
  const makeLexical = (paragraphs: string[]) => ({
    root: {
      type: 'root',
      format: '',
      indent: 0,
      version: 1,
      children: paragraphs.map((text) => ({
        type: 'paragraph',
        format: '',
        indent: 0,
        version: 1,
        children: [
          {
            type: 'text',
            text,
            format: 0,
            detail: 0,
            mode: 'normal',
            style: '',
            version: 1,
          },
        ],
        direction: 'ltr',
      })),
      direction: 'ltr',
    },
  });

  const defaultEditorialReview = {
    factChecked: true,
    sourcesChecked: true,
    imageRightsChecked: true,
    reviewedBy: 'Editor-in-Chief',
    reviewedAt: new Date().toISOString(),
  };

  const defaultSources = [
    { name: 'Globdot Wire Services', url: 'https://globdot.com' },
  ];

  // 5. Seed Articles
  const defaultArticles = [
    {
      title: 'Ocean warming is redrawing fishing seasons across the Pacific',
      slug: 'ocean-warming-redraws-fishing-seasons',
      standfirst: 'Communities are adapting as familiar species move, spawning periods shift and old calendars become less reliable.',
      dateline: 'SUVA',
      section: sectionMap['climate'],
      regions: [regionMap['oceania'] || regionMap['asia']],
      author: authorMap['elena-rostova'],
      homepageSlot: 'lead',
      isFeatured: true,
      status: 'published',
      sourceLinks: defaultSources,
      editorialReview: defaultEditorialReview,
      publishedAt: new Date().toISOString(),
      readTime: 5,
      content: makeLexical([
        'Fishing communities across the Pacific are recording changes in where and when familiar species appear. Marine biologists say warmer sea surface temperatures are shifting habitats and altering spawning cycles with unprecedented speed.',
        'Local knowledge remains central to adaptation. Crews are combining generations of observation with satellite forecasts, while maritime regulators reconsider rigid statutory seasons designed for a far more stable climate era.',
        'The transition carries acute economic risks for small-scale operators who cannot easily travel farther offshore or replace specialized vessel equipment.',
      ]),
    },
    {
      title: 'AI translation tools move from experiments into public services',
      slug: 'ai-translation-public-services-africa',
      standfirst: 'New systems promise wider access to government information while raising difficult questions about accuracy.',
      dateline: 'NAIROBI',
      section: sectionMap['tech'] || sectionMap['other'],
      regions: [regionMap['africa'] || regionMap['middle-east']],
      author: authorMap['kojo-mensah'],
      homepageSlot: 'secondary',
      status: 'published',
      sourceLinks: defaultSources,
      editorialReview: defaultEditorialReview,
      publishedAt: new Date(Date.now() - 3600000).toISOString(),
      readTime: 4,
      content: makeLexical([
        'Public health and administrative agencies across East Africa are deploying open-weight language models to translate medical advisories, agricultural forecasts, and civic forms into indigenous languages poorly served by global commercial tech platforms.',
        'Officials say early pilots have cut processing times substantially, but computational linguists warn that apparent fluency often masks subtle legal discrepancies.',
        'Community working groups are asking regional ministries to publish benchmark evaluations and mandate native-speaker verification on all public notices.',
      ]),
    },
    {
      title: 'The water treaty that could reshape cooperation across three borders',
      slug: 'water-treaty-explained',
      standfirst: 'A new dynamic formula links river releases to rainfall and verified basin demand rather than fixed annual quotas.',
      dateline: 'GENEVA',
      section: sectionMap['politics'] || sectionMap['other'],
      regions: [regionMap['europe'], regionMap['middle-east']],
      author: authorMap['tariq-mansoor'],
      homepageSlot: 'secondary',
      status: 'published',
      sourceLinks: defaultSources,
      editorialReview: defaultEditorialReview,
      publishedAt: new Date(Date.now() - 7200000).toISOString(),
      readTime: 5,
      content: makeLexical([
        'Negotiators from three contiguous riparian nations have initialed a landmark water-sharing pact that discards century-old volumetric quotas in favor of automated algorithmic allocation formulas.',
        'The formula dynamically balances hydro-electric reservoir retention against downstream agricultural sensor feeds, mitigating seasonal friction during drought peaks.',
        'International observers note that if the treaty proves resilient, it will serve as a standard template for international river basin management.',
      ]),
    },
    {
      title: 'Inside the election counting center built for transparency',
      slug: 'inside-election-counting-center',
      standfirst: 'High-definition cameras, parallel digital tallies, and verifiable result logs strengthen civic confidence in a close vote.',
      dateline: 'ACCRA',
      section: sectionMap['politics'] || sectionMap['other'],
      regions: [regionMap['africa'] || regionMap['middle-east']],
      author: authorMap['kojo-mensah'],
      homepageSlot: 'standard',
      isBreaking: true,
      status: 'published',
      sourceLinks: defaultSources,
      editorialReview: defaultEditorialReview,
      publishedAt: new Date(Date.now() - 10800000).toISOString(),
      readTime: 6,
      content: makeLexical([
        'Our visual correspondents take you inside the municipal tabulation center designed specifically to insulate election counts from partisan skepticism.',
        'Each precinct ballot chest is inspected under continuous multi-angle digital surveillance before forensic barcode verification. Tabulation observers run parallel audits at every checkpoint.',
      ]),
    },
  ];

  for (const art of defaultArticles) {
    const existing = await payload.find({
      collection: 'articles',
      where: { slug: { equals: art.slug } },
      limit: 1,
    });
    if (existing.docs.length === 0) {
      console.log(`📰 Creating article: ${art.title}`);
      await payload.create({
        collection: 'articles',
        data: art as any,
      });
    }
  }

  // 6. Seed Live Blog
  const existingLive = await payload.find({
    collection: 'live-blogs',
    where: { slug: { equals: 'global-climate-summit-live' } },
    limit: 1,
  });

  if (existingLive.docs.length === 0) {
    console.log('🔴 Creating initial Live Blog');
    await payload.create({
      collection: 'live-blogs',
      data: {
        title: 'Global Climate & Clean Energy Ministerial: Live Updates',
        slug: 'global-climate-summit-live',
        summary: 'Ministers and negotiators convene to finalize updated renewable finance commitments and transition timetables.',
        status: 'live',
        startedAt: new Date().toISOString(),
        updates: [
          {
            headline: 'Closing declaration draft circulating among delegations',
            body: 'Delegates have received the final compromise text regarding loss and damage allocations. Working group leaders expect final endorsements before midnight.',
            isPinned: true,
            publishedAt: new Date().toISOString(),
          },
          {
            headline: 'Renewable finance threshold reached',
            body: 'Consortium delegates announced that sovereign guarantees for grid infrastructure have surpassed initial targets by 14 percent.',
            isPinned: false,
            publishedAt: new Date(Date.now() - 1800000).toISOString(),
          },
        ],
      },
    });
  }

  console.log('✅ Globdot seed completed successfully!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed error:', err);
  process.exit(1);
});

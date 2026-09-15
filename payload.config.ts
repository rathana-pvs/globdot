import { buildConfig } from 'payload';
import { postgresAdapter } from '@payloadcms/db-postgres';
import {
  lexicalEditor,
  FixedToolbarFeature,
  HeadingFeature,
  HorizontalRuleFeature,
  UploadFeature,
} from '@payloadcms/richtext-lexical';
import { seoPlugin } from '@payloadcms/plugin-seo';
import sharp from 'sharp';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

dotenv.config({ path: path.resolve(dirname, '.env.local') });
dotenv.config({ path: path.resolve(dirname, '.env') });

import { Articles } from './src/collections/Articles';
import { Sections } from './src/collections/Sections';
import { Regions } from './src/collections/Regions';
import { Authors } from './src/collections/Authors';
import { Media } from './src/collections/Media';
import { Users } from './src/collections/Users';
import { ShareLinks } from './src/collections/ShareLinks';
import { LiveBlogs } from './src/collections/LiveBlogs';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export default buildConfig({
  sharp,
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      titleSuffix: '— Globdot Editorial Newsroom',
    },
    theme: 'dark',
  },
  hooks: {
    afterError: [
      ({ error, result }: any) => {
        if (error?.message && error.message !== 'Something went wrong.') {
          return {
            response: {
              errors: [{ message: error.message }],
            },
            status: error.status && error.status !== 500 ? error.status : 400,
          };
        }
      },
    ],
  },
  collections: [Articles, Sections, Regions, Authors, Media, Users, ShareLinks, LiveBlogs],
  editor: lexicalEditor({
    features: ({ defaultFeatures }) => [
      ...defaultFeatures,
      HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
      FixedToolbarFeature(),
      HorizontalRuleFeature(),
      UploadFeature({
        collections: {
          media: {
            fields: [
              {
                name: 'caption',
                type: 'text',
              },
            ],
          },
        },
      }),
    ],
  }),
  secret: process.env.PAYLOAD_SECRET || 'globdot-dev-fallback-secret',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString:
        process.env.DATABASE_URI ||
        'postgresql://globdot:globdot_pass_123@localhost:5437/globdot',
    },
  }),
  plugins: [
    seoPlugin({
      collections: ['articles'],
      uploadsCollection: 'media',
      generateTitle: ({ doc }: { doc: any }) =>
        doc?.title ? `${doc.title} — Globdot` : 'Globdot — One world. Every angle.',
      generateDescription: ({ doc }: { doc: any }) => doc?.standfirst || '',
    }),
    (config) => {
      const articlesCollection = config.collections?.find((c) => c.slug === 'articles');
      if (articlesCollection && articlesCollection.fields) {
        const ogIndex = articlesCollection.fields.findIndex((f) => 'name' in f && f.name === 'og');
        const metaIndex = articlesCollection.fields.findIndex((f) => 'name' in f && f.name === 'meta');

        const ogField = ogIndex !== -1 ? articlesCollection.fields[ogIndex] : null;
        const metaField = metaIndex !== -1 ? articlesCollection.fields[metaIndex] : null;

        if (ogField || metaField) {
          articlesCollection.fields = articlesCollection.fields.filter(
            (f) => !('name' in f && (f.name === 'og' || f.name === 'meta'))
          );

          const advancedFields: any[] = [];
          if (ogField) advancedFields.push(ogField);
          if (metaField) advancedFields.push(metaField);

          articlesCollection.fields.push({
            type: 'collapsible',
            label: 'Advanced (OG & SEO)',
            admin: {
              initCollapsed: true,
            },
            fields: advancedFields,
          } as any);
        }
      }
      return config;
    },
  ],
  cors: [siteUrl, 'https://globdot.com', 'https://www.globdot.com'],
  csrf: [siteUrl, 'https://globdot.com', 'https://www.globdot.com'],
});

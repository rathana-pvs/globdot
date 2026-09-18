import { type CollectionConfig, APIError } from 'payload';
import { lexicalEditor, FixedToolbarFeature, HeadingFeature, HorizontalRuleFeature, UploadFeature } from '@payloadcms/richtext-lexical';
import { slugify, cleanArticleSlug, calcReadTime } from '../lib/utils';
import { revalidatePath, revalidateTag } from 'next/cache';

const revalidateArticlePages = (doc?: any, previousDoc?: any) => {
  revalidateTag('articles');
  revalidatePath('/');
  revalidatePath('/news');
  revalidatePath('/section/[slug]', 'page');
  revalidatePath('/region/[slug]', 'page');
  revalidatePath('/rss.xml');
  revalidatePath('/sitemap.xml');

  if (doc?.slug) revalidatePath(`/article/${doc.slug}`);
  if (previousDoc?.slug && previousDoc.slug !== doc?.slug) {
    revalidatePath(`/article/${previousDoc.slug}`);
  }
};

const validateSourceUrl = (value: string | null | undefined) => {
  if (!value) return 'A source URL is required.';
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) || 'Use a public HTTP or HTTPS URL.';
  } catch {
    return 'Enter a complete, valid source URL.';
  }
};

export const Articles: CollectionConfig = {
  slug: 'articles',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'section', 'status', 'homepageSlot', 'publishedAt'],
    description: 'Globdot global news articles, analysis, and feature stories.',
    preview: (doc) => {
      if (doc?.slug) {
        return `/article/${doc.slug}`;
      }
      return null;
    },
    components: {
      edit: {
        beforeDocumentControls: [
          '/src/components/admin/CopyLinkHeaderButton#CopyLinkHeaderButton',
        ],
      },
    },
  },
  access: {
    read: ({ req }) => {
      if (req.user) return true;
      return { status: { equals: 'published' } };
    },
    create: ({ req }) => !!req.user,
    update: ({ req }) => {
      if (!req.user) return false;
      const role = (req.user as any)?.role;
      if (role === 'admin' || role === 'editor') return true;
      return true;
    },
    delete: ({ req }) => (req.user as any)?.role === 'admin',
  },
  hooks: {
    beforeChange: [
      ({ data }) => {
        if (!data.slug && data.title) {
          data.slug = cleanArticleSlug(data.title) || slugify(data.title) || `story-${Date.now()}`;
        }

        if (data.content) {
          try {
            const contentStr = JSON.stringify(data.content);
            data.readTime = calcReadTime(contentStr);
          } catch {
            data.readTime = 3;
          }
        }

        const coverImageId = typeof data.coverImage === 'object' && data.coverImage !== null
          ? (data.coverImage.id || data.coverImage)
          : data.coverImage;

        if (!data.og) data.og = {};
        data.og.metaTitle = data.title?.slice(0, 60);
        data.og.metaDescription = data.standfirst?.slice(0, 160);
        if (coverImageId) data.og.ogImage = coverImageId;

        if (data.status === 'published') {
          const sourceLinks = Array.isArray(data.sourceLinks) ? data.sourceLinks : [];
          const needsSources = data.storyType !== 'opinion' && data.storyType !== 'interview';
          const review = data.editorialReview || {};

          if (needsSources && !sourceLinks.some((source: any) => source?.name && source?.url)) {
            throw new APIError('Published reporting must include at least one named source with a direct URL.', 400);
          }
          if (!review.factChecked || !review.sourcesChecked) {
            throw new APIError('Complete the fact-check and source review before publishing.', 400);
          }
          if (coverImageId && !review.imageRightsChecked) {
            throw new APIError('Confirm image usage rights before publishing an article with a cover image.', 400);
          }
          if (!review.reviewedBy) {
            throw new APIError('Record the editor or reviewer responsible before publishing.', 400);
          }
          if (!review.reviewedAt) {
            data.editorialReview = { ...review, reviewedAt: new Date().toISOString() };
          }
        }

        if (data.status === 'published' && !data.publishedAt) {
          data.publishedAt = new Date().toISOString();
        }

        return data;
      },
    ],
    afterChange: [
      async ({ doc, previousDoc }) => {
        try {
          revalidateArticlePages(doc, previousDoc);
        } catch {}
        return doc;
      },
    ],
    afterDelete: [
      async ({ doc }) => {
        try {
          revalidateArticlePages(doc);
        } catch {}
        return doc;
      },
    ],
    afterError: [
      ({ error, result }) => {
        const message =
          error?.message && error.message !== 'Something went wrong.'
            ? error.message
            : result?.errors?.[0]?.message || 'An error occurred while saving the article.';
        return {
          response: {
            errors: [{ message }],
          },
          status: (error as any)?.status && (error as any).status !== 500 ? (error as any).status : 400,
        };
      },
    ],
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      admin: { position: 'sidebar', description: 'Auto-generated from title.' },
    },
    {
      name: 'copyLinkAction',
      type: 'ui',
      admin: {
        position: 'sidebar',
        components: {
          Field: '/src/components/admin/CopyLinkField#CopyLinkField',
        },
      },
    },
    {
      name: 'facebookDistribution',
      type: 'ui',
      admin: {
        position: 'sidebar',
        components: {
          Field: '/src/components/admin/FacebookPageLinksCard#FacebookPageLinksCard',
        },
      },
    },
    {
      name: 'aiAssistant',
      type: 'ui',
      admin: {
        position: 'sidebar',
        components: {
          Field: '/src/components/admin/AIAssistant#AIAssistant',
        },
      },
    },
    { name: 'standfirst', type: 'textarea', required: true, admin: { description: 'Lead summary paragraph' } },
    {
      name: 'reportingNotes',
      type: 'textarea',
      access: { read: ({ req }) => Boolean(req.user) },
      admin: {
        description: 'Private verified facts, quotations, source excerpts, and context used by the drafting assistant. Never paste unsupported claims.',
      },
    },
    {
      name: 'content',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ defaultFeatures }) => [
          ...defaultFeatures,
          HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
          FixedToolbarFeature(),
          HorizontalRuleFeature(),
          UploadFeature({
            collections: {
              media: {
                fields: [{ name: 'caption', type: 'text' }],
              },
            },
          }),
        ],
      }),
    },
    { name: 'coverImage', type: 'upload', relationTo: 'media' },
    {
      type: 'row',
      admin: {
        condition: (data) => Boolean(data?.coverImage),
      },
      fields: [
        {
          name: 'coverDisplayMode',
          type: 'select',
          defaultValue: 'auto',
          admin: {
            width: '50%',
            description: 'Cover presentation style',
          },
          options: [
            { label: 'Auto (Ambient blur for portrait/square, banner for landscape)', value: 'auto' },
            { label: 'Ambient Backdrop (Full uncropped photo + soft blurred background)', value: 'ambient' },
            { label: 'Crop Banner (Standard 16:10 wide banner)', value: 'banner' },
          ],
        },
        {
          name: 'coverFocalPosition',
          type: 'select',
          defaultValue: 'auto',
          admin: {
            width: '50%',
            description: 'Vertical focal point when cropped',
            condition: (data) => data?.coverDisplayMode !== 'ambient',
          },
          options: [
            { label: 'Auto (Top for people & portraits)', value: 'auto' },
            { label: 'Top / Face', value: 'top' },
            { label: 'Center', value: 'center' },
            { label: 'Bottom', value: 'bottom' },
          ],
        },
      ],
    },
    {
      name: 'sourceLinks',
      label: 'Sources',
      type: 'array',
      admin: { description: 'Direct links to primary documents or reporting used for this article.' },
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'url', type: 'text', required: true, validate: validateSourceUrl },
      ],
    },
    {
      name: 'section',
      type: 'relationship',
      relationTo: 'sections',
      required: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'regions',
      type: 'relationship',
      relationTo: 'regions',
      hasMany: true,
      admin: { position: 'sidebar', description: 'Geographic relevance' },
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'authors',
      required: true,
      admin: { position: 'sidebar' },
    },
    { name: 'dateline', type: 'text', admin: { description: 'e.g. NAIROBI, GENEVA, SUVA' } },
    {
      name: 'storyType',
      type: 'select',
      options: [
        { label: 'News Report', value: 'news' },
        { label: 'Analysis', value: 'analysis' },
        { label: 'Explainer', value: 'explainer' },
        { label: 'Opinion', value: 'opinion' },
        { label: 'Interview', value: 'interview' },
        { label: 'Video', value: 'video' },
      ],
      defaultValue: 'news',
      admin: { position: 'sidebar', description: 'Controls the article presentation and AI drafting structure.' },
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'In Review', value: 'in_review' },
        { label: 'Approved', value: 'approved' },
        { label: 'Published', value: 'published' },
        { label: 'Archived', value: 'archived' },
      ],
      defaultValue: 'published',
      admin: { position: 'sidebar' },
    },
    {
      name: 'homepageSlot',
      type: 'select',
      options: [
        { label: 'Standard Feed', value: 'standard' },
        { label: 'Lead Story', value: 'lead' },
        { label: 'Secondary Column', value: 'secondary' },
        { label: 'Editor’s Pick', value: 'editors_pick' },
      ],
      defaultValue: 'standard',
      admin: { position: 'sidebar' },
    },
    { name: 'isBreaking', type: 'checkbox', defaultValue: false, admin: { position: 'sidebar' } },
    { name: 'isFeatured', type: 'checkbox', defaultValue: false, admin: { position: 'sidebar' } },
    {
      name: 'publishedAt',
      type: 'date',
      admin: { position: 'sidebar', date: { pickerAppearance: 'dayAndTime' } },
    },
    { name: 'readTime', type: 'number', admin: { position: 'sidebar', description: 'Auto-calculated' } },
    { name: 'viewCount', type: 'number', defaultValue: 0, admin: { position: 'sidebar' } },
    {
      name: 'correctionNote',
      type: 'textarea',
      admin: { description: 'Editorial correction or clarification note' },
    },
    {
      name: 'editorialReview',
      label: 'Publication checklist',
      type: 'group',
      admin: { description: 'Every item must be true and accurate before publication.' },
      fields: [
        { name: 'factChecked', type: 'checkbox', label: 'Facts and quotations verified' },
        { name: 'sourcesChecked', type: 'checkbox', label: 'Source names and links verified' },
        { name: 'imageRightsChecked', type: 'checkbox', label: 'Image ownership or licence verified' },
        { name: 'reviewedBy', type: 'text', label: 'Reviewed by' },
        { name: 'reviewedAt', type: 'date', label: 'Reviewed at' },
      ],
    },
    {
      name: 'og',
      label: 'Open Graph & Social',
      type: 'group',
      fields: [
        { name: 'metaTitle', type: 'text' },
        { name: 'metaDescription', type: 'textarea' },
        { name: 'ogImage', type: 'upload', relationTo: 'media' },
      ],
    },
  ],
};

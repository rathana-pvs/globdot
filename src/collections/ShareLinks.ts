import type { CollectionConfig } from 'payload';

export const ShareLinks: CollectionConfig = {
  slug: 'share-links',
  admin: {
    useAsTitle: 'key',
    defaultColumns: ['key', 'article', 'label', 'clicks'],
    description: 'Dynamic tracked shortlinks for campaign and social sharing.',
  },
  access: {
    read: () => true,
    create: ({ req }) => !!req.user,
    update: ({ req }) => !!req.user,
    delete: ({ req }) => {
      const role = (req.user as any)?.role;
      return role === 'admin' || role === 'editor';
    },
  },
  hooks: {
    beforeChange: [
      async ({ data, req }) => {
        if (!data.key) {
          let uniqueKey = '';
          let isUnique = false;
          let attempts = 0;
          while (!isUnique && attempts < 10) {
            uniqueKey = Math.random().toString(36).substring(2, 7);
            const existing = await req.payload.find({
              collection: 'share-links' as any,
              where: { key: { equals: uniqueKey } },
              limit: 1,
            });
            if (existing.docs.length === 0) {
              isUnique = true;
            }
            attempts++;
          }
          if (!isUnique) {
            uniqueKey = `link-${Date.now().toString().slice(-5)}`;
          }
          data.key = uniqueKey;
        }
        return data;
      },
    ],
  },
  fields: [
    {
      name: 'key',
      type: 'text',
      unique: true,
      admin: { description: 'Auto-generated unique short key.', readOnly: true },
    },
    {
      name: 'article',
      type: 'relationship',
      relationTo: 'articles',
      required: true,
      admin: { description: 'Target article for this share link.' },
    },
    {
      name: 'label',
      type: 'text',
      required: false,
      admin: { description: 'Campaign label (e.g. "Twitter Morning Feed", "Newsletter").' },
    },
    {
      name: 'channel',
      type: 'select',
      options: [
        { label: 'Facebook', value: 'facebook' },
        { label: 'Twitter / X', value: 'twitter' },
        { label: 'Telegram', value: 'telegram' },
        { label: 'Newsletter', value: 'newsletter' },
        { label: 'Direct / Other', value: 'other' },
      ],
      defaultValue: 'facebook',
      admin: { description: 'Marketing distribution channel.' },
    },
    {
      name: 'pageKey',
      type: 'text',
      required: false,
      admin: { description: 'Page or campaign identifier (e.g. "fb_page_1", "breaking_wire").' },
    },
    {
      name: 'utmMedium',
      type: 'text',
      defaultValue: 'comment',
      admin: { description: 'UTM medium (e.g. "comment", "post", "bio").' },
    },
    {
      name: 'clicks',
      type: 'number',
      defaultValue: 0,
      admin: { readOnly: true },
    },
  ],
};

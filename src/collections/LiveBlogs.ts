import type { CollectionConfig } from 'payload';
import { slugify } from '../lib/utils';

export const LiveBlogs: CollectionConfig = {
  slug: 'live-blogs',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'status', 'startedAt', 'updatedAt'],
    description: 'Real-time live blogging coverage and rolling updates.',
  },
  access: {
    read: () => true,
    create: ({ req }) => !!req.user,
    update: ({ req }) => !!req.user,
    delete: ({ req }) => (req.user as any)?.role === 'admin',
  },
  hooks: {
    beforeChange: [
      ({ data }) => {
        if (!data.slug && data.title) {
          data.slug = slugify(data.title);
        }
        return data;
      },
    ],
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', unique: true },
    { name: 'summary', type: 'textarea', required: true },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Live Now', value: 'live' },
        { label: 'Ended', value: 'ended' },
      ],
      defaultValue: 'draft',
      admin: { position: 'sidebar' },
    },
    {
      name: 'startedAt',
      type: 'date',
      defaultValue: () => new Date(),
      admin: { position: 'sidebar' },
    },
    {
      name: 'updates',
      type: 'array',
      fields: [
        { name: 'headline', type: 'text' },
        { name: 'body', type: 'textarea', required: true },
        { name: 'author', type: 'relationship', relationTo: 'authors' },
        { name: 'isPinned', type: 'checkbox', defaultValue: false },
        {
          name: 'publishedAt',
          type: 'date',
          defaultValue: () => new Date(),
        },
      ],
    },
  ],
};

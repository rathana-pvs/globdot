import type { CollectionConfig } from 'payload';
import { slugify } from '../lib/utils';

export const Authors: CollectionConfig = {
  slug: 'authors',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'roleTitle', 'email'],
    description: 'Globdot correspondents, contributors, and byline authors.',
  },
  access: {
    read: () => true,
    create: ({ req }) => (req.user as any)?.role === 'admin' || (req.user as any)?.role === 'editor',
    update: ({ req }) => (req.user as any)?.role === 'admin' || (req.user as any)?.role === 'editor',
    delete: ({ req }) => (req.user as any)?.role === 'admin',
  },
  hooks: {
    beforeChange: [
      ({ data }) => {
        if (!data.slug && data.name) {
          data.slug = slugify(data.name);
        }
        return data;
      },
    ],
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'slug', type: 'text', unique: true },
    { name: 'roleTitle', type: 'text', admin: { description: 'e.g. "Senior Climate Correspondent"' } },
    { name: 'bio', type: 'textarea' },
    { name: 'avatar', type: 'upload', relationTo: 'media' },
    { name: 'email', type: 'email' },
    { name: 'socialUrl', type: 'text' },
    { name: 'isActive', type: 'checkbox', defaultValue: true },
  ],
};

import type { CollectionConfig } from 'payload';
import { slugify } from '../lib/utils';

export const Sections: CollectionConfig = {
  slug: 'sections',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'color', 'sortOrder', 'isVisible'],
    description: 'Editorial desks / channels (World, Politics, Climate, etc.)',
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
    { name: 'description', type: 'textarea' },
    { name: 'color', type: 'text', defaultValue: '#2457ff', required: true },
    { name: 'sortOrder', type: 'number', defaultValue: 0, required: true },
    { name: 'isVisible', type: 'checkbox', defaultValue: true },
  ],
};

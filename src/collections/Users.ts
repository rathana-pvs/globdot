import type { CollectionConfig } from 'payload';

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: {
    useAsTitle: 'email',
    description: 'Globdot newsroom staff with role-based access.',
  },
  access: {
    read: ({ req }) => (req.user as any)?.role === 'admin' || (req.user as any)?.role === 'editor',
    create: ({ req }) => (req.user as any)?.role === 'admin',
    update: ({ req }) => (req.user as any)?.role === 'admin' || req.user?.id === (req as any)?.id,
    delete: ({ req }) => (req.user as any)?.role === 'admin',
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    {
      name: 'role',
      type: 'select',
      options: [
        { label: 'Administrator', value: 'admin' },
        { label: 'Editor', value: 'editor' },
        { label: 'Reporter / Writer', value: 'writer' },
      ],
      defaultValue: 'writer',
      required: true,
    },
    { name: 'avatar', type: 'upload', relationTo: 'media' },
  ],
};

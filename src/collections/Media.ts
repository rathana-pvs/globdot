import type { CollectionConfig } from 'payload';
import path from 'path';
import fs from 'fs';

const mediaDir = path.resolve(process.cwd(), 'public/media');
try {
  if (!fs.existsSync(mediaDir)) {
    fs.mkdirSync(mediaDir, { recursive: true });
  }
} catch {
  // Ignore in read-only environments
}

export const Media: CollectionConfig = {
  slug: 'media',
  upload: {
    staticDir: mediaDir,
    mimeTypes: ['image/*', 'video/*'],
    adminThumbnail: ({ doc }: any) => {
      if (doc?.sizes?.thumbnail?.url && (doc.sizes.thumbnail.url.startsWith('http://') || doc.sizes.thumbnail.url.startsWith('https://'))) {
        return doc.sizes.thumbnail.url;
      }
      if (doc?.url && (doc.url.startsWith('http://') || doc.url.startsWith('https://'))) {
        return doc.url;
      }
      if (doc?.externalUrl) return doc.externalUrl;
      if (doc?.sizes?.thumbnail?.filename) return `/media/${doc.sizes.thumbnail.filename}`;
      if (doc?.sizes?.thumbnail?.url) return doc.sizes.thumbnail.url;
      if (doc?.filename) return `/media/${doc.filename}`;
      if (doc?.url) return doc.url;
      return null;
    },
    imageSizes: [
      { name: 'thumbnail', width: 400, height: 267, position: 'centre' },
      { name: 'card', width: 768, height: 512, position: 'centre' },
      { name: 'hero', width: 1920, height: 1080, position: 'centre' },
    ],
  },
  admin: {
    useAsTitle: 'filename',
    description: 'Images and multimedia assets for articles.',
    defaultColumns: ['filename', 'alt', 'credit', 'createdAt'],
  },
  access: {
    read: ({ req }) => !!req.user,
    create: ({ req }) => !!req.user,
    update: ({ req }) => (req.user as any)?.role === 'admin' || (req.user as any)?.role === 'editor',
    delete: ({ req }) => (req.user as any)?.role === 'admin',
  },
  hooks: {
    beforeChange: [
      ({ data }) => {
        if (data.source === 'external' && data.externalUrl) {
          data.url = data.externalUrl;
        } else if (data.url && (data.url.startsWith('http://') || data.url.startsWith('https://'))) {
          // Preserve external / Cloudinary URL
        } else if (data.filename) {
          data.url = `/media/${data.filename}`;
        }
        return data;
      },
    ],
    afterRead: [
      ({ doc }) => {
        if (doc.source === 'external' && doc.externalUrl) {
          doc.url = doc.externalUrl;
        } else if (doc.url && (doc.url.startsWith('http://') || doc.url.startsWith('https://'))) {
          // Keep external URLs
        } else if (doc.filename) {
          doc.url = `/media/${doc.filename}`;
        } else if (doc.url && doc.url.startsWith('/api/media/file/')) {
          doc.url = `/media/${doc.url.replace('/api/media/file/', '')}`;
        }

        if (doc.sizes && typeof doc.sizes === 'object') {
          for (const sizeKey of Object.keys(doc.sizes)) {
            if (doc.sizes[sizeKey]?.url && (doc.sizes[sizeKey].url.startsWith('http://') || doc.sizes[sizeKey].url.startsWith('https://'))) {
              // Keep external URL
            } else if (doc.sizes[sizeKey]?.filename) {
              doc.sizes[sizeKey].url = `/media/${doc.sizes[sizeKey].filename}`;
            }
          }
        }
        return doc;
      },
    ],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: false,
      defaultValue: 'Globdot reporting',
      admin: { description: 'Alt text for accessibility and SEO' },
    },
    {
      name: 'caption',
      type: 'text',
      admin: { description: 'Optional caption displayed below image' },
    },
    {
      name: 'credit',
      type: 'text',
      admin: { description: 'Photo attribution (e.g. Globdot / Reuters / AP)' },
    },
    {
      name: 'source',
      type: 'select',
      defaultValue: 'local',
      options: [
        { label: 'Local Upload', value: 'local' },
        { label: 'External URL', value: 'external' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'focalPosition',
      type: 'select',
      defaultValue: 'top',
      options: [
        { label: 'Top / Face (Recommended for people & portraits)', value: 'top' },
        { label: 'Center (Standard)', value: 'center' },
        { label: 'Bottom', value: 'bottom' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Default focus position when cropped to a banner',
      },
    },
    {
      name: 'externalUrl',
      type: 'text',
      admin: {
        condition: (data) => data?.source === 'external',
        description: 'Direct link to an external image',
      },
    },
  ],
};

import { sql } from 'drizzle-orm';
import { index, integer, primaryKey, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

const timestamps = {
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
};

export const media = sqliteTable('media', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  objectKey: text('object_key').notNull().unique(),
  fileName: text('file_name').notNull(),
  mimeType: text('mime_type').notNull(),
  byteSize: integer('byte_size').notNull(),
  width: integer('width'),
  height: integer('height'),
  alt: text('alt').notNull(),
  caption: text('caption'),
  credit: text('credit'),
  focalX: integer('focal_x').default(50),
  focalY: integer('focal_y').default(50),
  ...timestamps,
}, (table) => [index('idx_media_created_at').on(table.createdAt)]);

export const editorialUsers = sqliteTable('editorial_users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  authId: text('auth_id').notNull().unique(),
  email: text('email').notNull().unique(),
  displayName: text('display_name').notNull(),
  role: text('role', { enum: ['administrator', 'managing_editor', 'editor', 'reporter', 'contributor'] }).notNull().default('contributor'),
  status: text('status', { enum: ['active', 'suspended'] }).notNull().default('active'),
  ...timestamps,
}, (table) => [index('idx_editorial_users_role_status').on(table.role, table.status)]);

export const authors = sqliteTable('authors', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  roleTitle: text('role_title'),
  bio: text('bio'),
  email: text('email'),
  socialUrl: text('social_url'),
  avatarId: integer('avatar_id').references(() => media.id, { onDelete: 'set null' }),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  ...timestamps,
}, (table) => [index('idx_authors_active').on(table.isActive)]);

export const sections = sqliteTable('sections', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  description: text('description'),
  color: text('color').notNull().default('#2457ff'),
  sortOrder: integer('sort_order').notNull().default(0),
  isVisible: integer('is_visible', { mode: 'boolean' }).notNull().default(true),
  ...timestamps,
}, (table) => [index('idx_sections_navigation').on(table.isVisible, table.sortOrder)]);

export const regions = sqliteTable('regions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  description: text('description'),
  sortOrder: integer('sort_order').notNull().default(0),
  isVisible: integer('is_visible', { mode: 'boolean' }).notNull().default(true),
  ...timestamps,
}, (table) => [index('idx_regions_navigation').on(table.isVisible, table.sortOrder)]);

export const topics = sqliteTable('topics', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  description: text('description'),
  ...timestamps,
}, (table) => [index('idx_topics_name').on(table.name)]);

export const articles = sqliteTable('articles', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  standfirst: text('standfirst').notNull(),
  bodyJson: text('body_json').notNull().default('{"root":{"children":[]}}'),
  status: text('status', { enum: ['draft', 'in_review', 'approved', 'scheduled', 'published', 'archived'] }).notNull().default('draft'),
  storyType: text('story_type', { enum: ['news', 'analysis', 'opinion', 'explainer', 'interview', 'video'] }).notNull().default('news'),
  sectionId: integer('section_id').notNull().references(() => sections.id, { onDelete: 'restrict' }),
  leadMediaId: integer('lead_media_id').references(() => media.id, { onDelete: 'set null' }),
  createdById: integer('created_by_id').notNull().references(() => editorialUsers.id, { onDelete: 'restrict' }),
  isBreaking: integer('is_breaking', { mode: 'boolean' }).notNull().default(false),
  isFeatured: integer('is_featured', { mode: 'boolean' }).notNull().default(false),
  homepageSlot: text('homepage_slot', { enum: ['lead', 'secondary', 'editors_pick'] }),
  readTimeMinutes: integer('read_time_minutes').notNull().default(1),
  dateline: text('dateline'),
  keyPointsJson: text('key_points_json').notNull().default('[]'),
  seoTitle: text('seo_title'),
  seoDescription: text('seo_description'),
  socialMediaId: integer('social_media_id').references(() => media.id, { onDelete: 'set null' }),
  canonicalUrl: text('canonical_url'),
  publishedAt: text('published_at'),
  scheduledFor: text('scheduled_for'),
  correctedAt: text('corrected_at'),
  correctionNote: text('correction_note'),
  ...timestamps,
}, (table) => [
  index('idx_articles_public_feed').on(table.status, table.publishedAt),
  index('idx_articles_section_feed').on(table.sectionId, table.status, table.publishedAt),
  index('idx_articles_homepage').on(table.status, table.homepageSlot, table.publishedAt),
  index('idx_articles_owner_status').on(table.createdById, table.status),
]);

export const articleAuthors = sqliteTable('article_authors', {
  articleId: integer('article_id').notNull().references(() => articles.id, { onDelete: 'cascade' }),
  authorId: integer('author_id').notNull().references(() => authors.id, { onDelete: 'cascade' }),
  position: integer('position').notNull().default(0),
}, (table) => [primaryKey({ columns: [table.articleId, table.authorId] }), index('idx_article_authors_position').on(table.articleId, table.position)]);

export const articleRegions = sqliteTable('article_regions', {
  articleId: integer('article_id').notNull().references(() => articles.id, { onDelete: 'cascade' }),
  regionId: integer('region_id').notNull().references(() => regions.id, { onDelete: 'cascade' }),
  isPrimary: integer('is_primary', { mode: 'boolean' }).notNull().default(false),
}, (table) => [primaryKey({ columns: [table.articleId, table.regionId] }), index('idx_article_regions_feed').on(table.regionId, table.articleId)]);

export const articleTopics = sqliteTable('article_topics', {
  articleId: integer('article_id').notNull().references(() => articles.id, { onDelete: 'cascade' }),
  topicId: integer('topic_id').notNull().references(() => topics.id, { onDelete: 'cascade' }),
}, (table) => [primaryKey({ columns: [table.articleId, table.topicId] }), index('idx_article_topics_feed').on(table.topicId, table.articleId)]);

export const articleSources = sqliteTable('article_sources', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  articleId: integer('article_id').notNull().references(() => articles.id, { onDelete: 'cascade' }),
  label: text('label').notNull(),
  url: text('url'),
  sourceType: text('source_type', { enum: ['document', 'interview', 'dataset', 'statement', 'reporting', 'other'] }).notNull().default('reporting'),
  ...timestamps,
}, (table) => [index('idx_article_sources_article').on(table.articleId)]);

export const articleRevisions = sqliteTable('article_revisions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  articleId: integer('article_id').notNull().references(() => articles.id, { onDelete: 'cascade' }),
  editorId: integer('editor_id').notNull().references(() => editorialUsers.id, { onDelete: 'restrict' }),
  revisionNumber: integer('revision_number').notNull(),
  snapshotJson: text('snapshot_json').notNull(),
  note: text('note'),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [uniqueIndex('idx_article_revisions_unique').on(table.articleId, table.revisionNumber), index('idx_article_revisions_latest').on(table.articleId, table.createdAt)]);

export const liveBlogs = sqliteTable('live_blogs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  summary: text('summary').notNull(),
  status: text('status', { enum: ['draft', 'live', 'ended', 'archived'] }).notNull().default('draft'),
  sectionId: integer('section_id').references(() => sections.id, { onDelete: 'set null' }),
  createdById: integer('created_by_id').notNull().references(() => editorialUsers.id, { onDelete: 'restrict' }),
  startedAt: text('started_at'),
  endedAt: text('ended_at'),
  ...timestamps,
}, (table) => [index('idx_live_blogs_status_started').on(table.status, table.startedAt)]);

export const liveUpdates = sqliteTable('live_updates', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  liveBlogId: integer('live_blog_id').notNull().references(() => liveBlogs.id, { onDelete: 'cascade' }),
  authorId: integer('author_id').references(() => authors.id, { onDelete: 'set null' }),
  headline: text('headline'),
  bodyJson: text('body_json').notNull(),
  isPinned: integer('is_pinned', { mode: 'boolean' }).notNull().default(false),
  publishedAt: text('published_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [index('idx_live_updates_timeline').on(table.liveBlogId, table.publishedAt), index('idx_live_updates_pinned').on(table.liveBlogId, table.isPinned)]);

export const redirects = sqliteTable('redirects', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  fromPath: text('from_path').notNull().unique(),
  toPath: text('to_path').notNull(),
  statusCode: integer('status_code').notNull().default(308),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const navigationItems = sqliteTable('navigation_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  label: text('label').notNull(),
  href: text('href').notNull(),
  location: text('location', { enum: ['primary', 'footer', 'utility'] }).notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
  isVisible: integer('is_visible', { mode: 'boolean' }).notNull().default(true),
  ...timestamps,
}, (table) => [index('idx_navigation_location_order').on(table.location, table.isVisible, table.sortOrder)]);

export const siteSettings = sqliteTable('site_settings', {
  key: text('key').primaryKey(),
  valueJson: text('value_json').notNull(),
  updatedById: integer('updated_by_id').references(() => editorialUsers.id, { onDelete: 'set null' }),
  updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const shareCampaigns = sqliteTable('share_campaigns', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  key: text('key').notNull().unique(),
  articleId: integer('article_id').notNull().references(() => articles.id, { onDelete: 'cascade' }),
  label: text('label'),
  clickCount: integer('click_count').notNull().default(0),
  expiresAt: text('expires_at'),
  ...timestamps,
}, (table) => [index('idx_share_campaigns_article').on(table.articleId)]);

export const pageEvents = sqliteTable('page_events', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  path: text('path').notNull(),
  referrerHost: text('referrer_host'),
  country: text('country'),
  eventType: text('event_type', { enum: ['page_view', 'newsletter_click', 'share'] }).notNull().default('page_view'),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  index('idx_page_events_path_created').on(table.path, table.createdAt),
  index('idx_page_events_type_created').on(table.eventType, table.createdAt),
]);

export type Article = typeof articles.$inferSelect;
export type NewArticle = typeof articles.$inferInsert;
export type EditorialUser = typeof editorialUsers.$inferSelect;
export type EditorialRole = EditorialUser['role'];
export type ArticleStatus = Article['status'];

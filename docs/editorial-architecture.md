# Globdot editorial architecture

Globdot separates public authorship from CMS ownership. An `author` is a public
byline; an `editorial_user` is an authenticated person who can change records.
Articles therefore use `created_by_id` for authorization and the
`article_authors` join table for one or more public bylines.

## Classification

- A section is the editorial desk responsible for a story.
- A region describes where the story matters. Articles can have many regions.
- A topic is a reusable subject used for discovery and related coverage.

This avoids treating geography and subject as the same category.

## Publishing workflow

`draft → in_review → approved → scheduled → published → archived`

Reporters and contributors can edit their own drafts and submit them for
review. Editors can approve, schedule, and publish. Managing editors and
administrators can archive or delete content. The transition rules live in
`lib/editorial-policy.ts` and must be enforced in every write action.

New articles are never published, featured, or marked breaking by default.

## Storage

- D1 stores structured editorial data and media metadata.
- R2 stores uploaded image, video, and document bytes.
- `media.object_key` connects a media record to its R2 object.
- Rich article content is stored as versioned JSON in `body_json`.
- Every saved editorial revision is snapshotted in `article_revisions`.

## Public queries

Public pages must always filter articles by `status = 'published'` and should
use the relevant indexed query path for homepage, section, region, or topic
feeds. Draft and scheduled content must never be exposed by public loaders.

## Trust and maintenance

Articles can keep structured sources, correction notes, and correction dates.
Slug changes create redirect records. SEO overrides are optional and should not
be overwritten when an editor has supplied a value. Share counters must use an
atomic database increment rather than a read-then-write update.

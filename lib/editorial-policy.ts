import type { ArticleStatus, EditorialRole } from '@/db/schema';

const editorialManagement: EditorialRole[] = ['administrator', 'managing_editor', 'editor'];

const transitions: Record<ArticleStatus, ArticleStatus[]> = {
  draft: ['in_review', 'archived'],
  in_review: ['draft', 'approved', 'archived'],
  approved: ['draft', 'scheduled', 'published', 'archived'],
  scheduled: ['draft', 'published', 'archived'],
  published: ['archived'],
  archived: ['draft'],
};

export function canCreateArticle(role: EditorialRole): boolean {
  return ['administrator', 'managing_editor', 'editor', 'reporter', 'contributor'].includes(role);
}

export function canEditArticle(role: EditorialRole, userId: number, ownerId: number, status: ArticleStatus): boolean {
  if (editorialManagement.includes(role)) return true;
  return userId === ownerId && ['draft', 'in_review'].includes(status);
}

export function canDeleteArticle(role: EditorialRole): boolean {
  return role === 'administrator' || role === 'managing_editor';
}

export function canPublish(role: EditorialRole): boolean {
  return role === 'administrator' || role === 'managing_editor' || role === 'editor';
}

export function canTransitionArticle(role: EditorialRole, from: ArticleStatus, to: ArticleStatus): boolean {
  if (!transitions[from].includes(to)) return false;
  if (['approved', 'scheduled', 'published'].includes(to)) return canPublish(role);
  if (from === 'published') return canPublish(role);
  return true;
}

export function assertArticleTransition(role: EditorialRole, from: ArticleStatus, to: ArticleStatus): void {
  if (!canTransitionArticle(role, from, to)) {
    throw new Error(`Role ${role} cannot move an article from ${from} to ${to}.`);
  }
}

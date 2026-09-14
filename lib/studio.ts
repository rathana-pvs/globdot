import { desc, eq, or } from 'drizzle-orm';
import { getChatGPTUser, requireChatGPTUser, type ChatGPTUser } from '@/app/chatgpt-auth';
import { getDb } from '@/db';
import { articles, authors, editorialUsers, media, sections } from '@/db/schema';

export async function requireEditorialSession(returnTo = '/studio') {
  const identity = await requireChatGPTUser(returnTo);
  return resolveEditorialIdentity(identity);
}

export async function getEditorialSession() {
  const identity = await getChatGPTUser();
  if (!identity) return null;
  return resolveEditorialIdentity(identity);
}

async function resolveEditorialIdentity(identity: ChatGPTUser) {
  const db = getDb();
  const rows = await db.select().from(editorialUsers)
    .where(or(eq(editorialUsers.authId, identity.userId), eq(editorialUsers.email, identity.email)))
    .limit(1);
  const editor = rows[0];
  if (!editor || editor.status !== 'active') return null;
  if (editor.authId !== identity.userId) {
    await db.update(editorialUsers).set({ authId: identity.userId, updatedAt: new Date().toISOString() }).where(eq(editorialUsers.id, editor.id));
  }
  return { identity, editor };
}

export function hasTrustedOrigin(request: Request): boolean {
  const origin = request.headers.get('origin');
  if (!origin) return false;
  try { return new URL(origin).origin === new URL(request.url).origin; } catch { return false; }
}

export async function getStudioDashboard() {
  const db = getDb();
  const [articleRows, sectionRows, authorRows, mediaRows] = await Promise.all([
    db.select().from(articles).orderBy(desc(articles.updatedAt)).limit(50),
    db.select().from(sections).orderBy(sections.sortOrder),
    db.select().from(authors).where(eq(authors.isActive, true)).orderBy(authors.name),
    db.select().from(media).orderBy(desc(media.createdAt)).limit(12),
  ]);
  return { articles: articleRows, sections: sectionRows, authors: authorRows, media: mediaRows };
}

export function slugify(value: string): string {
  return value.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 90);
}

export function bodyToJson(value: string): string {
  const paragraphs = value.split(/\n\s*\n/).map((part) => part.trim()).filter(Boolean);
  return JSON.stringify({ paragraphs, version: 1 });
}

export function calculateReadTime(value: string): number {
  const words = value.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
}

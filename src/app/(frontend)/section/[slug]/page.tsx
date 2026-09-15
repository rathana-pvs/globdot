import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ChannelPage } from '@/components/channel-page';
import { getArticlesBySection } from '@/lib/api-server';

export const dynamic = 'force-dynamic';
type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await getArticlesBySection(slug);
  if (!data) return { title: 'Section not found — Globdot' };
  return {
    title: `${data.name} — Globdot`,
    description: data.description || `The latest ${data.name} reporting from Globdot.`,
  };
}

export default async function SectionPage({ params }: Props) {
  const { slug } = await params;
  const data = await getArticlesBySection(slug);
  if (!data) notFound();
  return (
    <ChannelPage
      eyebrow="Section"
      title={data.name}
      description={data.description}
      stories={data.stories}
    />
  );
}

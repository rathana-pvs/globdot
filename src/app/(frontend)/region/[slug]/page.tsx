import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ChannelPage } from '@/components/channel-page';
import { getArticlesByRegion } from '@/lib/api-server';

export const dynamic = 'force-static';
export const dynamicParams = true;
export const revalidate = 60;
type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return ['americas', 'asia', 'europe', 'middle-east'].map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await getArticlesByRegion(slug);
  if (!data) return { title: 'Region not found — Globdot' };
  return {
    title: `${data.name} News — Globdot`,
    description: `Independent journalism, dispatches, and deep analysis from across ${data.name}.`,
  };
}

export default async function RegionPage({ params }: Props) {
  const { slug } = await params;
  const data = await getArticlesByRegion(slug);
  if (!data) notFound();
  return (
    <ChannelPage
      eyebrow="Region"
      title={data.name}
      description={data.description || `Dispatches and analysis from ${data.name}.`}
      stories={data.stories}
    />
  );
}

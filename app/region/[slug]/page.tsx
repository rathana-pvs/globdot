import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ChannelPage } from '@/components/channel-page';
import { getStoriesByRegion } from '@/lib/content';

export const dynamic = 'force-dynamic';
type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params; const data = await getStoriesByRegion(slug);
  return { title: data ? `${data.name} — Globdot` : 'Region not found — Globdot', description: data ? `News, context and analysis from ${data.name}.` : undefined };
}

export default async function RegionPage({ params }: Props) {
  const { slug } = await params; const data = await getStoriesByRegion(slug); if (!data) notFound();
  return <ChannelPage eyebrow="Global pulse" title={data.name} description={`News, context and analysis connecting ${data.name} to the wider world.`} stories={data.stories} />;
}

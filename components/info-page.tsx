import type { ReactNode } from 'react';

export function InfoPage({ eyebrow, title, intro, children }: { eyebrow: string; title: string; intro: string; children: ReactNode }) {
  return <main id="content" className="shell info-page"><header className="channel-header"><span>{eyebrow}</span><h1>{title}</h1><p>{intro}</p></header><article className="info-prose">{children}</article></main>;
}

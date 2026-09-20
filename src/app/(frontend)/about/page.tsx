import type { Metadata } from 'next';
import Link from 'next/link';
import { InfoPage } from '@/components/info-page';

export const metadata: Metadata = {
  title: 'About Globdot — Independent Global Journalism',
  description: 'Learn about Globdot’s mission, ownership principles, sourcing, and editorial standards.',
};

export default function AboutPage() {
  return (
    <InfoPage
      eyebrow="About Globdot"
      title="One world. Every angle."
      intro="Globdot is an independently operated digital publication focused on making international events understandable through reported news, explainers, and analysis."
    >
      <h2>What We Cover</h2>
      <p>
        Our coverage follows politics, conflict and security, climate, technology, and major developments that
        cross national borders. We aim to explain why an event matters, identify what is known, and distinguish
        verified facts from analysis or opinion.
      </p>

      <h2>How We Work</h2>
      <p>
        Published reporting must name its author, link to the most direct available sources, and pass an editorial
        review for factual accuracy. Images must be owned, licensed, or used with permission. Articles that use
        automated research or drafting tools remain subject to human review; tools are never treated as sources.
      </p>

      <h2>Independence and Funding</h2>
      <p>
        Editorial decisions are made independently of advertisers and commercial partners. Globdot may be funded
        by clearly identified advertising or other reader-supported products. Sponsored material, if introduced,
        will be labelled prominently and kept separate from editorial coverage.
      </p>

      <h2>Editorial Masthead &amp; Leadership</h2>
      <p>
        Globdot is led by an independent editorial board with dedicated regional bureaus across Geneva, Abu Dhabi,
        Singapore, and Accra. Review our full newsroom roster, correspondent biographies, and verified publisher
        credentials on our <Link href="/masthead">Editorial Masthead</Link>.
      </p>

      <h2>Corrections and Contact</h2>
      <p>
        We correct substantive errors transparently and add a dated note to the affected article. Read our{' '}
        <Link href="/editorial-standards">Editorial Standards</Link>, review our{' '}
        <Link href="/corrections">Corrections Policy</Link>, explore the{' '}
        <Link href="/masthead">Editorial Masthead</Link>, or <Link href="/contact">contact us</Link> with a
        question or correction request.
      </p>
    </InfoPage>
  );
}

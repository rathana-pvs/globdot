import type { Metadata } from 'next';
import Link from 'next/link';
import { InfoPage } from '@/components/info-page';

export const metadata: Metadata = {
  title: 'Editorial Standards — Globdot',
  description: 'How Globdot handles sourcing, verification, corrections, images, opinion, and AI-assisted work.',
};

export default function StandardsPage() {
  return (
    <InfoPage
      eyebrow="Trust"
      title="Editorial Standards"
      intro="Accuracy, clear sourcing, independence, and transparent corrections guide every article published by Globdot."
    >
      <h2>Verification and Sourcing</h2>
      <p>
        News reports must be checked against primary documents or reliable, attributable reporting. Direct source
        links are included whenever they are available. Anonymous claims require additional corroboration and
        editorial approval. We do not invent quotations, people, events, statistics, or source attributions.
      </p>

      <h2>Bylines and Accountability</h2>
      <p>
        Articles identify the person or editorial team responsible for the work. A byline must not imply that a
        fictional identity conducted interviews or field reporting. Contributors remain responsible for the
        accuracy and originality of their work.
      </p>

      <h2>Artificial Intelligence</h2>
      <p>
        Automated tools may assist with research organization, transcription, translation, or drafting, but they
        are not sources and cannot approve publication. A human reviewer must verify factual claims, quotations,
        links, classifications, and image rights before an article is published.
      </p>

      <h2>Images and Copyright</h2>
      <p>
        Images must be original, licensed, in the public domain, or used with documented permission. Captions and
        credits must describe the image truthfully. A publisher or agency is never credited unless it actually
        supplied the material under valid usage terms.
      </p>

      <h2>News, Analysis, and Opinion</h2>
      <p>
        News reporting, explainers, analysis, and opinion are labelled according to their actual format. Opinion
        represents the author’s interpretation and must not be presented as straight reporting.
      </p>

      <h2>Corrections</h2>
      <p>
        Substantive errors are corrected promptly with a dated explanation on the affected article. To report an
        error, follow our <Link href="/corrections">Corrections Policy</Link> or email{' '}
        <a href="mailto:yourssmiara@gmail.com">yourssmiara@gmail.com</a>.
      </p>
    </InfoPage>
  );
}

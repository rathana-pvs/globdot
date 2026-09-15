import type { Metadata } from 'next';
import Link from 'next/link';
import { InfoPage } from '@/components/info-page';

export const metadata: Metadata = {
  title: 'Contact Globdot',
  description: 'Contact Globdot about editorial questions, corrections, privacy, and partnerships.',
};

export default function ContactPage() {
  return (
    <InfoPage
      eyebrow="Contact"
      title="Contact Globdot"
      intro="Choose the address that best matches your message. Please include the relevant article URL whenever possible."
    >
      <h2>Editorial Questions</h2>
      <p>
        For reporting questions, source material, or story suggestions, email{' '}
        <a href="mailto:editor@globdot.com">editor@globdot.com</a>.
      </p>

      <h2>Corrections</h2>
      <p>
        Send the headline, URL, disputed claim, and supporting evidence to{' '}
        <a href="mailto:corrections@globdot.com">corrections@globdot.com</a>. Read our{' '}
        <Link href="/corrections">Corrections Policy</Link> for more information.
      </p>

      <h2>Privacy</h2>
      <p>
        Questions or requests concerning personal information can be sent to{' '}
        <a href="mailto:privacy@globdot.com">privacy@globdot.com</a>. See our{' '}
        <Link href="/privacy">Privacy Policy</Link> for details.
      </p>

      <h2>Commercial Enquiries</h2>
      <p>
        For advertising or partnerships, email <a href="mailto:ads@globdot.com">ads@globdot.com</a>. Commercial
        relationships do not influence editorial decisions.
      </p>
    </InfoPage>
  );
}

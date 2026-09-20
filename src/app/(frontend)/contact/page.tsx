import type { Metadata } from 'next';
import Link from 'next/link';
import { InfoPage } from '@/components/info-page';
import { ContactForm } from '@/components/contact-form';

export const metadata: Metadata = {
  title: 'Contact Globdot — Editorial Newsroom & Inquiries',
  description: 'Submit news tips, correction requests, privacy inquiries, and commercial queries to the Globdot editorial team.',
};

export default function ContactPage() {
  return (
    <InfoPage
      eyebrow="Contact"
      title="Contact Globdot"
      intro="Submit a direct dispatch using our secure newsroom form below, or reach out to the dedicated department address matching your message."
    >
      <h2>Newsroom Contact Form</h2>
      <p>
        Use this form to submit story tips, correction requests, or general inquiries directly to our assignment desk.
      </p>

      <ContactForm />

      <h2>Editorial Questions &amp; Story Tips</h2>
      <p>
        For reporting questions, verifiable source material, or confidential story tips, contact our assignment desk at{' '}
        <a href="mailto:editorial@globdot.com">editorial@globdot.com</a>.
      </p>

      <h2>Corrections &amp; Factual Clarifications</h2>
      <p>
        Send the article headline, exact URL, disputed claim, and verifiable supporting documentation to{' '}
        <a href="mailto:corrections@globdot.com">corrections@globdot.com</a>. Read our{' '}
        <Link href="/corrections">Corrections Policy</Link> for details on our timeline and transparency standards.
      </p>

      <h2>Privacy &amp; Data Rights</h2>
      <p>
        Questions, data export requests, or inquiries concerning personal data should be directed to our data governance desk at{' '}
        <a href="mailto:privacy@globdot.com">privacy@globdot.com</a>. See our{' '}
        <Link href="/privacy">Privacy Policy</Link> for complete information.
      </p>

      <h2>Press Credentials &amp; Commercial Enquiries</h2>
      <p>
        For media citations, syndication, or partnership queries, contact{' '}
        <a href="mailto:press@globdot.com">press@globdot.com</a>. Commercial and advertising relationships operate strictly
        independent of newsroom coverage decisions.
      </p>
    </InfoPage>
  );
}

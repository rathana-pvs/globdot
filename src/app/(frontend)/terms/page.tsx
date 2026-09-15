import type { Metadata } from 'next';
import Link from 'next/link';
import { InfoPage } from '@/components/info-page';

export const metadata: Metadata = {
  title: 'Terms of Service — Globdot',
  description: 'Globdot terms of service, conditions of use, and intellectual property terms.',
};

export default function TermsPage() {
  return (
    <InfoPage
      eyebrow="Legal & Terms"
      title="Terms of Service"
      intro="These Terms of Service govern your access to and use of Globdot’s website, reporting, and digital publications."
    >
      <p>
        <em>Last updated: 14 September 2026</em>
      </p>

      <h2>1. Acceptance of Terms</h2>
      <p>
        By accessing or browsing Globdot (accessible at globdot.com or via any associated application or feed),
        you agree to be bound by these Terms of Service, all applicable laws and regulations, and agree that you
        are responsible for compliance with any applicable local laws. If you do not agree with any of these
        terms, you are prohibited from using or accessing this site.
      </p>

      <h2>2. Intellectual Property Rights &amp; Editorial Content</h2>
      <p>
        All original reporting, investigative articles, analysis, photography, graphics, audio, headlines, and
        editorial layouts published on Globdot are protected by international copyright, trademark, and
        intellectual property laws.
      </p>
      <ul>
        <li>
          <strong>Personal &amp; Non-Commercial Use:</strong> You may view, read, and share links to our articles
          for personal, non-commercial informational purposes.
        </li>
        <li>
          <strong>Fair Quotation:</strong> Brief excerpts of text may be quoted in academic, critical, or news
          reporting contexts, provided that clear attribution is given to Globdot with a direct clickable link to
          the original source article.
        </li>
        <li>
          <strong>Reproduction Restrictions:</strong> Systematic automated scraping, republishing entire articles,
          framing, or bulk reproduction of Globdot content without prior written permission is strictly
          prohibited.
        </li>
      </ul>

      <h2>3. Acceptable Use Policy</h2>
      <p>When interacting with Globdot, you agree not to:</p>
      <ul>
        <li>Use the website in any manner that could disable, overburden, damage, or impair server infrastructure.</li>
        <li>Use any automated robot, spider, scraper, or deep-link mechanism to access content for unauthorized harvesting.</li>
        <li>Circumvent or attempt to bypass security measures, paywalls, or digital rights management protocols.</li>
        <li>Transmit any malicious code, viruses, or disruptive scripts.</li>
      </ul>

      <h2>4. Advertising and Third-Party Links</h2>
      <p>
        Globdot may display digital advertisements served by third-party advertising networks, including Google
        AdSense. Globdot does not endorse or guarantee the products, services, or claims made within third-party
        advertisements.
      </p>
      <p>
        Our articles may contain links to external third-party websites for source documentation and context.
        Globdot is not responsible for the availability, accuracy, or content of external sites. Please refer to
        our <Link href="/privacy">Privacy Policy</Link> for information on how cookies and advertising networks
        operate.
      </p>

      <h2>5. Editorial Independence &amp; Disclaimer of Warranties</h2>
      <p>
        Globdot operates under strict editorial standards dedicated to factual verification and accuracy.
        However, news reports are provided on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis. Globdot
        makes no warranties, expressed or implied, regarding the commercial fitness or complete error-free
        continuity of the service.
      </p>
      <p>
        Financial, medical, legal, and political reporting on Globdot is provided solely for journalistic
        informational purposes and does not constitute professional advisory counsel.
      </p>

      <h2>6. Corrections and Feedback</h2>
      <p>
        We hold ourselves accountable for factual reporting. If you believe an article contains a factual error,
        please review our <Link href="/corrections">Corrections Policy</Link> or notify our editors at{' '}
        <strong>corrections@globdot.com</strong>.
      </p>

      <h2>7. Limitation of Liability</h2>
      <p>
        To the fullest extent permitted by applicable law, Globdot, its journalists, editors, and contributors
        shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out
        of your access to, use of, or inability to access Globdot.
      </p>

      <h2>8. Modifications to Terms</h2>
      <p>
        Globdot reserves the right to revise these Terms of Service at any time without prior notice. By continuing
        to use the website after changes are posted, you agree to be bound by the revised terms.
      </p>

      <h2>9. Governing Law &amp; Contact</h2>
      <p>
        These Terms shall be governed by and construed in accordance with applicable legal frameworks.
        For legal notices or questions regarding these terms, contact:
      </p>
      <p>
        <strong>Email:</strong> legal@globdot.com<br />
        <strong>Newsroom:</strong> editor@globdot.com
      </p>
    </InfoPage>
  );
}

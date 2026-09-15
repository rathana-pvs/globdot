import type { Metadata } from 'next';
import Link from 'next/link';
import { InfoPage } from '@/components/info-page';

export const metadata: Metadata = {
  title: 'Privacy Policy — Globdot',
  description:
    'Globdot privacy policy, advertising disclosures, cookie practices, and data protection standards.',
};

export default function PrivacyPage() {
  return (
    <InfoPage
      eyebrow="Legal & Transparency"
      title="Privacy Policy"
      intro="This Privacy Policy describes how Globdot collects, uses, and safeguards information when you visit our website, read our journalism, or interact with our digital services."
    >
      <p>
        <em>Last updated: 14 September 2026</em>
      </p>

      <h2>1. Overview and Core Principles</h2>
      <p>
        Globdot is committed to journalistic integrity and reader privacy. We believe in transparent,
        accountable reporting and minimal data collection. We do not sell your personal information to third
        parties. Any data gathered is strictly used to deliver high-quality news coverage, maintain site
        performance, ensure infrastructure security, and sustain our independent newsroom through legitimate
        advertising.
      </p>

      <h2>2. Information We Collect</h2>
      <p>
        When you access Globdot, certain non-personally identifiable technical information is collected
        automatically:
      </p>
      <ul>
        <li>
          <strong>Server Log Data:</strong> Internet Protocol (IP) addresses, browser type, operating system,
          referring URLs, pages viewed, and timestamps.
        </li>
        <li>
          <strong>Device and Usage Information:</strong> Screen resolution, language settings, and rough
          geographic location (country or regional level).
        </li>
        <li>
          <strong>Voluntary Communications:</strong> When you send email correspondence, news tips, or editorial
          feedback to our newsroom, we retain your email address solely to respond to your inquiry.
        </li>
      </ul>

      <h2>3. Cookies, Web Beacons, and Advertising Technologies</h2>
      <p>
        Globdot may use cookies and similar technologies to maintain site functionality, understand readership,
        and display advertising. Where consent is legally required, optional advertising or analytics storage
        will not be enabled until the visitor has made a choice.
      </p>

      <h3>Google AdSense &amp; Third-Party Advertising Vendors</h3>
      <p>
        If advertising is enabled, we may work with third-party advertising partners, including{' '}
        <strong>Google AdSense</strong>. In that case, the following disclosures apply:
      </p>
      <ul>
        <li>
          <strong>Third-party vendors, including Google, use cookies</strong> to serve ads based on a user&apos;s
          prior visits to this website or other websites across the Internet.
        </li>
        <li>
          <strong>Google&apos;s use of advertising cookies</strong> (including the DoubleClick / DART cookie)
          enables it and its partners to serve ads to our users based on their visits to Globdot and/or other
          sites on the Internet.
        </li>
        <li>
          These advertising partners may automatically receive your IP address and use cookies, JavaScript, or
          web beacons to measure the effectiveness of their advertisements and personalize the advertising content
          you see.
        </li>
        <li>
          Globdot has no access to or control over cookies that are used by third-party advertisers.
        </li>
      </ul>

      <h3>How to Opt Out of Personalized Advertising</h3>
      <p>
        You have complete control over personalized advertising. You may opt out of personalized ads at any
        time using the following industry resources:
      </p>
      <ul>
        <li>
          <strong>Google Ad Settings:</strong> You can opt out of personalized advertising from Google by visiting{' '}
          <a
            href="https://www.google.com/settings/ads"
            target="_blank"
            rel="noopener noreferrer"
          >
            Google Ads Settings (google.com/settings/ads)
          </a>
          .
        </li>
        <li>
          <strong>Digital Advertising Alliance (DAA):</strong> You may opt out of a third-party vendor&apos;s use
          of cookies for personalized advertising by visiting{' '}
          <a
            href="https://www.aboutads.info/choices/"
            target="_blank"
            rel="noopener noreferrer"
          >
            aboutads.info/choices
          </a>
          .
        </li>
        <li>
          <strong>European Interactive Digital Advertising Alliance (EDAA):</strong> Visitors in Europe can opt out
          via{' '}
          <a
            href="https://www.youronlinechoices.eu/"
            target="_blank"
            rel="noopener noreferrer"
          >
            youronlinechoices.eu
          </a>
          .
        </li>
        <li>
          <strong>Browser Cookie Controls:</strong> You can configure your browser to reject all cookies or alert
          you when a cookie is placed.
        </li>
      </ul>

      <h2>4. How We Use Information</h2>
      <p>
        The technical information collected is used solely for the following legitimate purposes:
      </p>
      <ul>
        <li>Ensuring fast, reliable page delivery and broadsheet typography rendering across global servers.</li>
        <li>Monitoring traffic volume, trending coverage areas, and reader engagement metrics.</li>
        <li>Detecting, preventing, and mitigating DDoS attacks, spam, and unauthorized server access.</li>
        <li>Serving standard digital advertising that funds our journalists and field dispatches.</li>
      </ul>

      <h2>5. Data Protection Rights (GDPR &amp; CCPA)</h2>
      <p>
        Regardless of where you reside, Globdot respects international data protection principles, including the
        European General Data Protection Regulation (GDPR) and the California Consumer Privacy Act (CCPA/CPRA):
      </p>
      <ul>
        <li>
          <strong>Right to Access:</strong> You have the right to request confirmation of whether we process any
          personal information concerning you.
        </li>
        <li>
          <strong>Right to Deletion:</strong> You may request the deletion of any personal data we hold (e.g.,
          editorial email records).
        </li>
        <li>
          <strong>Non-Discrimination:</strong> We will never discriminate against any reader for exercising their
          privacy rights.
        </li>
        <li>
          <strong>No Sale of Personal Data:</strong> Globdot does not sell, rent, or trade reader personal data
          under any circumstances.
        </li>
      </ul>

      <h2>6. Children&apos;s Online Privacy Protection (COPPA)</h2>
      <p>
        Protecting the privacy of young children is paramount. Globdot does not knowingly collect or solicit any
        personally identifiable information from children under the age of 13. If you believe that a child has
        provided personal information to our newsroom, please contact us immediately, and we will promptly delete
        such records.
      </p>

      <h2>7. External Links &amp; Third-Party Services</h2>
      <p>
        Our reporting frequently includes links to external sources, research papers, official government
        releases, and primary documents. Globdot is not responsible for the privacy policies or content of
        external websites. We encourage readers to review the privacy notices of any third-party sites they visit.
      </p>

      <h2>8. Editorial Standards &amp; Newsroom Governance</h2>
      <p>
        For details on how our journalists verify information, handle confidential sources, and correct errors,
        please read our <Link href="/editorial-standards">Editorial Standards</Link> and our{' '}
        <Link href="/corrections">Corrections Policy</Link>.
      </p>

      <h2>9. Contact the Newsroom</h2>
      <p>
        If you have questions regarding this Privacy Policy, cookie practices, or wish to exercise your data
        rights, please contact our data governance desk:
      </p>
      <p>
        <strong>Email:</strong> privacy@globdot.com<br />
        <strong>Editorial:</strong> editor@globdot.com
      </p>
    </InfoPage>
  );
}

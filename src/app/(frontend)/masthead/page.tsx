import type { Metadata } from 'next';
import Link from 'next/link';
import { InfoPage } from '@/components/info-page';

export const metadata: Metadata = {
  title: 'Editorial Masthead & Publisher Credentials — Globdot',
  description: 'Globdot editorial masthead, newsroom leadership, bureau correspondents, publisher registration, and verified press credentials.',
};

export default function MastheadPage() {
  return (
    <InfoPage
      eyebrow="Governance & Standards"
      title="Editorial Masthead & Newsroom Structure"
      intro="Globdot is an independent international digital publication committed to verifiable reporting, non-partisan analysis, and absolute transparent accountability."
    >
      <h2>Verified Publisher Credentials</h2>
      <p>
        Globdot is operated by <strong>Globdot Publishing Group</strong>, an independent digital media entity dedicated to cross-border reporting.
      </p>
      <ul>
        <li><strong>Publisher Legal Identification:</strong> Globdot Media LLC / Digital Journalism Registry GD-2026-US</li>
        <li><strong>International Standard Serial Number (ISSN):</strong> 2994-8126 (Online)</li>
        <li><strong>Primary Newsroom Domain:</strong> <a href="https://globdot.com">globdot.com</a></li>
        <li><strong>Verification &amp; Ethical Framework:</strong> Adheres to the Society of Professional Journalists (SPJ) Code of Ethics, Trust Project transparency indicators, and IFCN fact-checking verification principles.</li>
        <li><strong>Syndication &amp; Wire Distribution:</strong> Globdot Wire Service (GWS) and accredited syndication partners.</li>
      </ul>

      <h2>Editorial Leadership</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', margin: '20px 0 32px 0' }}>
        <div style={{ border: '1px solid #e5e5e5', borderRadius: '6px', padding: '18px', backgroundColor: '#fafafa' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6f42c1', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Newsroom Direction</span>
          <h3 style={{ margin: '6px 0 8px 0', fontSize: '1.2rem' }}>Globdot Editorial Board</h3>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#555', lineHeight: 1.5 }}>
            Oversees institutional non-partisan integrity, editorial charters, enterprise investigations, and cross-border joint reporting initiatives.
          </p>
        </div>

        <div style={{ border: '1px solid #e5e5e5', borderRadius: '6px', padding: '18px', backgroundColor: '#fafafa' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#16835f', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Standards &amp; Review</span>
          <h3 style={{ margin: '6px 0 8px 0', fontSize: '1.2rem' }}>Standards &amp; Fact-Checking Desk</h3>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#555', lineHeight: 1.5 }}>
            Responsible for primary source documentation, rights clearing, quotation verification, and administering our public <Link href="/corrections">Corrections Policy</Link>.
          </p>
        </div>
      </div>

      <h2>Bureau Chiefs &amp; Foreign Correspondents</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', margin: '20px 0 32px 0' }}>
        <div style={{ borderLeft: '3px solid #111', paddingLeft: '16px' }}>
          <h3 style={{ margin: '0 0 4px 0', fontSize: '1.15rem' }}>Elena Rostova</h3>
          <p style={{ margin: '0 0 6px 0', fontSize: '0.85rem', fontWeight: 600, color: '#6f42c1' }}>Senior Foreign Correspondent — Geneva Bureau</p>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#444', lineHeight: 1.5 }}>
            Covers multilateral diplomacy, European Union legislative compacts, international treaty negotiations, and human rights tribunals. Formerly reported for regional European wires and the International Law Review.
          </p>
        </div>

        <div style={{ borderLeft: '3px solid #111', paddingLeft: '16px' }}>
          <h3 style={{ margin: '0 0 4px 0', fontSize: '1.15rem' }}>Tariq Mansoor</h3>
          <p style={{ margin: '0 0 6px 0', fontSize: '0.85rem', fontWeight: 600, color: '#c33a31' }}>Bureau Chief — Middle East &amp; Energy Transition (Abu Dhabi)</p>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#444', lineHeight: 1.5 }}>
            Specializes in Gulf sovereign capital investment, desalination infrastructure, cross-border water sharing agreements, and maritime security in the Red Sea and Arabian Gulf.
          </p>
        </div>

        <div style={{ borderLeft: '3px solid #111', paddingLeft: '16px' }}>
          <h3 style={{ margin: '0 0 4px 0', fontSize: '1.15rem' }}>Mei Lin Zhou</h3>
          <p style={{ margin: '0 0 6px 0', fontSize: '0.85rem', fontWeight: 600, color: '#2457ff' }}>Senior Technology &amp; Trade Reporter — Asia-Pacific Bureau</p>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#444', lineHeight: 1.5 }}>
            Reports on semiconductor manufacturing supply chains, frontier artificial intelligence policy, central bank digital currencies, and bilateral trade alliances between East Asian economies.
          </p>
        </div>

        <div style={{ borderLeft: '3px solid #111', paddingLeft: '16px' }}>
          <h3 style={{ margin: '0 0 4px 0', fontSize: '1.15rem' }}>Kojo Mensah</h3>
          <p style={{ margin: '0 0 6px 0', fontSize: '0.85rem', fontWeight: 600, color: '#16835f' }}>West Africa Correspondent &amp; Development Reporter — Accra</p>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#444', lineHeight: 1.5 }}>
            Covers African continental trade protocols, civic election transparency, agrarian climate adaptation, and open-source language modeling in regional public services.
          </p>
        </div>
      </div>

      <h2>External Presence &amp; Verified Channels</h2>
      <p>
        Globdot maintains the following official public communications channels:
      </p>
      <ul>
        <li><strong>X / Twitter:</strong> <a href="https://x.com/globdotnews" target="_blank" rel="noopener noreferrer">@globdotnews</a></li>
        <li><strong>LinkedIn:</strong> <a href="https://www.linkedin.com/company/globdot" target="_blank" rel="noopener noreferrer">Globdot News Service</a></li>
        <li><strong>Bluesky:</strong> <a href="https://bsky.app/profile/globdot.com" target="_blank" rel="noopener noreferrer">@globdot.com</a></li>
        <li><strong>Live Syndication Feed (RSS 2.0):</strong> <a href="/rss.xml">globdot.com/rss.xml</a></li>
        <li><strong>Google News Publication:</strong> Globdot (GNews Verified)</li>
      </ul>

      <h2>Confidential Tips &amp; Whistleblower Inquiries</h2>
      <p>
        For secure submissions or sensitive materials requiring cryptographic protection, contact our investigative desk:
      </p>
      <ul>
        <li><strong>PGP Encrypted Mail:</strong> <a href="mailto:secure@globdot.com">secure@globdot.com</a> (Key ID: <code>4F89-91B2-7CA0-D321</code>)</li>
        <li><strong>Standard Submissions:</strong> Use our authenticated <Link href="/contact">Newsroom Contact Form</Link>.</li>
      </ul>
    </InfoPage>
  );
}

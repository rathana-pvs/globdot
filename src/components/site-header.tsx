'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const channels = [
  ['Home', '/'],
  ['Politics', '/section/politics'],
  ['War & Tension', '/section/war-tension'],
  ['Climate', '/section/climate'],
  ['Tech', '/section/tech'],
  ['Other', '/section/other'],
];

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  useEffect(() => {
    if (!menuOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [menuOpen]);
  return (
    <>
      <a className="skip-link" href="#content">Skip to content</a>
      <header className="site-header">
        <div className="shell masthead">
          <button className="menu-button" aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} aria-controls="site-menu" onClick={() => setMenuOpen((open) => !open)}><span /><span /><span /></button>
          <Link className="brand" href="/" aria-label="Globdot home">
            <Image className="brand-logo" src="/globdot-logo.svg" alt="Globdot" width={320} height={80} priority />
          </Link>
          <div className="header-actions"><Link className="search-button" href="/search"><span className="search-label">Search</span><span className="search-icon" aria-hidden="true">⌕</span></Link></div>
        </div>
        <nav className="shell primary-nav" aria-label="Primary navigation">
          {channels.map(([label, href]) => {
            const isActive = href === '/' ? pathname === '/' : Boolean(pathname?.startsWith(href));
            return (
              <Link
                href={href}
                className={isActive ? 'active' : undefined}
                aria-current={isActive ? 'page' : undefined}
                key={href}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </header>
      {menuOpen && (
        <div className="menu-drawer" id="site-menu">
          <div className="shell menu-drawer-grid">
            <div>
              <span>Sections</span>
              {channels.map(([label, href]) => (
                <Link href={href} onClick={() => setMenuOpen(false)} key={href}>
                  {label}
                </Link>
              ))}
            </div>
            <div>
              <span>Regions</span>
              {[
                ['Americas', 'americas'],
                ['Asia', 'asia'],
                ['Europe', 'europe'],
                ['Middle East', 'middle-east'],
                ['Africa', 'africa'],
                ['Oceania', 'oceania'],
              ].map(([label, slug]) => (
                <Link href={`/region/${slug}`} onClick={() => setMenuOpen(false)} key={slug}>
                  {label}
                </Link>
              ))}
              <Link href="/regions" onClick={() => setMenuOpen(false)} style={{ fontWeight: 600 }}>
                All Regions →
              </Link>
            </div>
            <div>
              <span>About &amp; Standards</span>
              <Link href="/about" onClick={() => setMenuOpen(false)}>
                About Globdot
              </Link>
              <Link href="/masthead" onClick={() => setMenuOpen(false)}>
                Editorial Masthead
              </Link>
              <Link href="/editorial-standards" onClick={() => setMenuOpen(false)}>
                Editorial standards
              </Link>
              <Link href="/corrections" onClick={() => setMenuOpen(false)}>
                Corrections
              </Link>
              <Link href="/contact" onClick={() => setMenuOpen(false)}>
                Contact Newsroom
              </Link>
            </div>
            <div>
              <span>Follow &amp; Feeds</span>
              <a href="https://x.com/globdotnews" target="_blank" rel="noopener noreferrer">
                X (Twitter)
              </a>
              <a href="https://www.linkedin.com/company/globdot" target="_blank" rel="noopener noreferrer">
                LinkedIn
              </a>
              <a href="https://bsky.app/profile/globdot.com" target="_blank" rel="noopener noreferrer">
                Bluesky
              </a>
              <Link href="/rss.xml" onClick={() => setMenuOpen(false)}>
                RSS News Feed
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

const channels = [
  ['Politics', 'politics'],
  ['War & Tension', 'war-tension'],
  ['Climate', 'climate'],
  ['Tech', 'tech'],
  ['Other', 'other'],
];

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
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
          <Link className="brand" href="/" aria-label="Globdot home"><span>GLOB</span><b>•</b><span>DOT</span></Link>
          <div className="header-actions"><Link className="search-button" href="/search"><span>Search</span>⌕</Link><Link className="subscribe-button" href="/rss.xml">RSS feed</Link></div>
        </div>
        <nav className="shell primary-nav" aria-label="Primary navigation">
          {channels.map(([label, slug]) => <Link href={`/section/${slug}`} key={slug}>{label}</Link>)}
        </nav>
      </header>
      {menuOpen && <div className="menu-drawer" id="site-menu"><div className="shell menu-drawer-grid"><div><span>Sections</span>{channels.map(([label,slug]) => <Link href={`/section/${slug}`} onClick={() => setMenuOpen(false)} key={slug}>{label}</Link>)}</div><div><span>Regions</span>{[['Americas','americas'],['Asia','asia'],['Europe','europe'],['Middle East','middle-east']].map(([label,slug]) => <Link href={`/region/${slug}`} onClick={() => setMenuOpen(false)} key={slug}>{label}</Link>)}</div><div><span>About</span><Link href="/about" onClick={() => setMenuOpen(false)}>About Globdot</Link><Link href="/editorial-standards" onClick={() => setMenuOpen(false)}>Editorial standards</Link><Link href="/corrections" onClick={() => setMenuOpen(false)}>Corrections</Link><Link href="/contact" onClick={() => setMenuOpen(false)}>Contact</Link></div></div></div>}
    </>
  );
}

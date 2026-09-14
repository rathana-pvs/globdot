'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

const channels = [
  ['World', 'world'], ['Politics', 'politics'], ['Business', 'business'],
  ['Technology', 'technology'], ['Climate', 'climate'], ['Culture', 'culture'],
  ['Security', 'security'], ['Analysis', 'analysis'], ['Video', 'video'],
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
      <div className="utility-bar"><div className="shell utility-inner"><span>Independent global journalism</span><span className="edition"><i /> Global edition</span><span className="utility-tagline">One world. Every angle.</span></div></div>
      <header className="site-header">
        <div className="shell masthead">
          <button className="menu-button" aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} aria-controls="site-menu" onClick={() => setMenuOpen((open) => !open)}><span /><span /><span /></button>
          <Link className="brand" href="/" aria-label="Globdot home"><span>GLOB</span><b>•</b><span>DOT</span></Link>
          <div className="header-actions"><Link className="search-button" href="/search"><span>Search</span>⌕</Link><Link className="subscribe-button" href="/rss.xml">Get the briefing</Link></div>
        </div>
        <nav className="shell primary-nav" aria-label="Primary navigation">
          {channels.map(([label, slug]) => <Link href={`/section/${slug}`} key={slug}>{label}</Link>)}
          <Link className="live-link" href="/live"><i /> Live</Link>
        </nav>
      </header>
      {menuOpen && <div className="menu-drawer" id="site-menu"><div className="shell menu-drawer-grid"><div><span>Sections</span>{channels.slice(0,6).map(([label,slug]) => <Link href={`/section/${slug}`} onClick={() => setMenuOpen(false)} key={slug}>{label}</Link>)}</div><div><span>Regions</span>{[['Africa','africa'],['Americas','americas'],['Asia','asia'],['Europe','europe'],['Middle East','middle-east'],['Oceania','oceania']].map(([label,slug]) => <Link href={`/region/${slug}`} onClick={() => setMenuOpen(false)} key={slug}>{label}</Link>)}</div><div><span>About</span><Link href="/about" onClick={() => setMenuOpen(false)}>About Globdot</Link><Link href="/editorial-standards" onClick={() => setMenuOpen(false)}>Editorial standards</Link><Link href="/corrections" onClick={() => setMenuOpen(false)}>Corrections</Link><Link href="/contact" onClick={() => setMenuOpen(false)}>Contact</Link></div></div></div>}
    </>
  );
}

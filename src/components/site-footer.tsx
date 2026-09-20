import Link from 'next/link';

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <div><Link className="brand footer-brand" href="/"><span>GLOB</span><b>•</b><span>DOT</span></Link><p>Independent global news, context and analysis.</p></div>
        <div><h2>Explore</h2><Link href="/section/politics">Politics</Link><Link href="/section/war-tension">War &amp; Tension</Link><Link href="/section/climate">Climate</Link><Link href="/section/tech">Tech</Link><Link href="/section/other">Other</Link></div>
        <div><h2>About Globdot</h2><Link href="/about">About us</Link><Link href="/editorial-standards">Editorial standards</Link><Link href="/corrections">Corrections</Link><Link href="/contact">Contact</Link></div>
        <div><h2>News tools</h2><Link href="/search">Search</Link><Link href="/region/americas">Browse regions</Link></div>
      </div>
      <div className="shell footer-bottom"><span>© 2026 Globdot</span><Link href="/privacy">Privacy Policy</Link><Link href="/terms">Terms of Service</Link><span>One world. Every angle.</span></div>
    </footer>
  );
}

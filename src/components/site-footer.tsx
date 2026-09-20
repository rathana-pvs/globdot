import Link from 'next/link';

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <div>
          <Link className="brand footer-brand" href="/"><span>GLOB</span><b>•</b><span>DOT</span></Link>
          <p>Independent global news, context and analysis connecting the events shaping our world.</p>
          <div style={{ marginTop: '12px', fontSize: '0.8rem', color: '#888' }}>
            <span>Digital Publisher ID: GD-2026-US</span><br />
            <span>ISSN: 2994-8126 (Online)</span>
          </div>
        </div>
        <div>
          <h2>Explore</h2>
          <Link href="/section/politics">Politics</Link>
          <Link href="/section/war-tension">War &amp; Tension</Link>
          <Link href="/section/climate">Climate</Link>
          <Link href="/section/tech">Tech</Link>
          <Link href="/section/other">Other</Link>
        </div>
        <div>
          <h2>About Globdot</h2>
          <Link href="/about">About us</Link>
          <Link href="/masthead">Editorial Masthead</Link>
          <Link href="/editorial-standards">Editorial standards</Link>
          <Link href="/corrections">Corrections</Link>
          <Link href="/contact">Contact</Link>
        </div>
        <div>
          <h2>News tools &amp; Feeds</h2>
          <Link href="/search">Search archive</Link>
          <Link href="/regions">Browse regions</Link>
          <Link href="/rss.xml">RSS Wire Feed</Link>
          <a href="https://x.com/globdotnews" target="_blank" rel="noopener noreferrer">X (Twitter)</a>
          <a href="https://www.linkedin.com/company/globdot" target="_blank" rel="noopener noreferrer">LinkedIn</a>
        </div>
      </div>
      <div className="shell footer-bottom">
        <span>© 2026 Globdot Media LLC • Verified Independent Publisher</span>
        <Link href="/masthead">Masthead</Link>
        <Link href="/privacy">Privacy Policy</Link>
        <Link href="/terms">Terms of Service</Link>
        <span>One world. Every angle.</span>
      </div>
    </footer>
  );
}

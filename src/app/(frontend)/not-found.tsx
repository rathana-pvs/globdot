import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="shell" style={{ padding: '80px 20px', textAlign: 'center', minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#c33a31', marginBottom: '12px' }}>
        404 — Page Not Found
      </span>
      <h1 style={{ fontSize: '2.4rem', fontWeight: 700, margin: '0 0 16px 0', letterSpacing: '-0.02em' }}>
        The dispatch you requested could not be located.
      </h1>
      <p style={{ maxWidth: '520px', color: '#666', fontSize: '1.05rem', lineHeight: 1.6, margin: '0 0 32px 0' }}>
        The article or index may have moved, been retitled, or is no longer available at this address. Please browse our sections or return to the front page.
      </p>
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link
          href="/"
          style={{ padding: '10px 24px', backgroundColor: '#111', color: '#fff', textDecoration: 'none', borderRadius: '4px', fontWeight: 500, fontSize: '0.95rem' }}
        >
          Return to Front Page
        </Link>
        <Link
          href="/search"
          style={{ padding: '10px 24px', border: '1px solid #ccc', color: '#111', textDecoration: 'none', borderRadius: '4px', fontWeight: 500, fontSize: '0.95rem' }}
        >
          Search Articles
        </Link>
      </div>
    </div>
  );
}

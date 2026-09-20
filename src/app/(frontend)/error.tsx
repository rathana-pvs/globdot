'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log sanitized error without disclosing server internals
    console.error('Application error encountered:', error?.message || 'Unknown error');
  }, [error]);

  return (
    <div className="shell" style={{ padding: '80px 20px', textAlign: 'center', minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#c33a31', marginBottom: '12px' }}>
        Notice
      </span>
      <h1 style={{ fontSize: '2.4rem', fontWeight: 700, margin: '0 0 16px 0', letterSpacing: '-0.02em' }}>
        Unable to complete this request
      </h1>
      <p style={{ maxWidth: '520px', color: '#666', fontSize: '1.05rem', lineHeight: 1.6, margin: '0 0 32px 0' }}>
        An unexpected condition was encountered while loading this content. Our newsroom engineers have been alerted.
      </p>
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          onClick={() => reset()}
          style={{ padding: '10px 24px', backgroundColor: '#111', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 500, fontSize: '0.95rem', cursor: 'pointer' }}
        >
          Try Again
        </button>
        <Link
          href="/"
          style={{ padding: '10px 24px', border: '1px solid #ccc', color: '#111', textDecoration: 'none', borderRadius: '4px', fontWeight: 500, fontSize: '0.95rem' }}
        >
          Return to Front Page
        </Link>
      </div>
    </div>
  );
}

'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function AnalyticsBeacon() {
  const pathname = usePathname();
  useEffect(() => { fetch('/api/events', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ path: pathname, referrer: document.referrer }), keepalive: true }).catch(() => {}); }, [pathname]);
  return null;
}

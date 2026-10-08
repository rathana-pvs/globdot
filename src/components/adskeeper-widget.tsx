'use client';

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export interface AdskeeperWidgetProps {
  widgetId: string | number;
  placement?: 'article' | 'feed' | 'sidebar';
  className?: string;
}

export function AdskeeperWidget({
  widgetId,
  placement = 'article',
  className = '',
}: AdskeeperWidgetProps) {
  const pathname = usePathname();
  const idStr = String(widgetId);

  useEffect(() => {
    try {
      (window as any)._mgq = (window as any)._mgq || [];
      (window as any)._mgq.push(['_mgc.load']);
    } catch (err) {
      console.warn('[AdsKeeper] Failed to push load command to _mgq:', err);
    }
  }, [pathname, idStr]);

  const isDev = process.env.NODE_ENV === 'development';

  return (
    <aside
      className={`ad-slot ad-${placement} ${className}`}
      aria-label="Advertisement"
    >
      <span className="ad-label">Advertisement</span>
      <div data-type="_mgwidget" data-widget-id={idStr} />
      {isDev && (
        <div className="ad-slot-dev-note" aria-hidden="true">
          <span>AdsKeeper Widget #{idStr}</span>
          <small>Domain: globdot.com (Ads render live on production)</small>
        </div>
      )}
    </aside>
  );
}

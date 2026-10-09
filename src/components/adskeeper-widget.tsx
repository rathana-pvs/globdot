'use client';

import React, { useEffect, useRef } from 'react';
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
  const idStr = String(widgetId);

  return (
    <div className={`adskeeper-slot ads-${placement} ${className}`}>
      <div id={`M1112395ScriptRootC${idStr}`} data-type="_mgwidget" data-widget-id={idStr} />
      <script
        dangerouslySetInnerHTML={{
          __html: '(function(w,q){w[q]=w[q]||[];w[q].push(["_mgc.load"])})(window,"_mgq");',
        }}
      />
    </div>
  );
}

/** Reload already-installed widgets after a Next.js client-side route change. */
export function AdskeeperRouteLoader() {
  const pathname = usePathname();
  const initialRender = useRef(true);

  useEffect(() => {
    if (initialRender.current) {
      initialRender.current = false;
      return;
    }

    (window as any)._mgq = (window as any)._mgq || [];
    (window as any)._mgq.push(['_mgc.load']);
  }, [pathname]);

  return null;
}

export function AdSlot({ placement }: { placement: 'article' | 'sidebar' | 'feed' }) {
  const networkId = process.env.NEXT_PUBLIC_AD_NETWORK_ID;
  if (!networkId) return null;
  return <aside className={`ad-slot ad-${placement}`} aria-label="Advertisement"><span>Advertisement</span><div data-network={networkId} data-placement={placement} /></aside>;
}

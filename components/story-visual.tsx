import { visualTone } from '@/lib/format';

export function StoryVisual({ section, compact = false }: { section: string; compact?: boolean }) {
  return <div className={`${compact ? 'card-visual' : 'lead-visual'} visual-panel ${visualTone(section)}`}><div className="map-grid" /><span className="dot-cluster" aria-hidden="true">••<br />•••<br /> ••</span></div>;
}

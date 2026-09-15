export function StoryVisual({ section, compact = false }: { section?: string; compact?: boolean }) {
  return (
    <div className={`${compact ? 'compact-placeholder' : 'lead-visual'} editorial-placeholder`}>
      <div className="placeholder-inner">
        <span className="placeholder-mark">GLOB<b>•</b>DOT</span>
        {section && <span className="placeholder-section">{section}</span>}
      </div>
    </div>
  );
}

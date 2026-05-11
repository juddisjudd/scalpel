import type { Zone } from '../../shared/useCurrentZone'
import { Toggle } from '../Toggle'

interface ZoneToggleProps {
  currentZone: Zone | null
  enabled: boolean
  onChange: (next: boolean) => void
}

/** Hero row that lets the user opt in to overriding the displayed item's
 *  areaLevel with the live zone level from Client.txt. Renders null when
 *  the player isn't in a real drop zone (town, hideout, or no zone seen
 *  yet), so the call site doesn't need to guard. */
export function ZoneToggle({ currentZone, enabled, onChange }: ZoneToggleProps): JSX.Element | null {
  if (!currentZone) return null
  return (
    <div className="px-3 py-2 bg-bg-card border-b border-border flex">
      <div
        className="inline-flex items-center gap-[6px] bg-black/30 rounded-full px-2 py-[3px] text-[11px]"
        title={`Override item area level with the current zone (${currentZone.areaCode})`}
      >
        <Toggle checked={enabled} onChange={onChange} />
        <span className="text-text-dim">Use Current Zone</span>
        <span className="text-text font-semibold">lvl {currentZone.areaLevel}</span>
      </div>
    </div>
  )
}

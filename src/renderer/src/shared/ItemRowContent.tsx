import { IconGlow } from './IconGlow'
import { PriceChip } from './PriceChip'

/** Shared body for sister-overlay rows and the unique-base cards on the filter page:
 *  name on top (color reflects rarity/context), icon + optional price chip below.
 *  The wrapper around it (zebra row vs card button) is the caller's concern. */
export function ItemRowContent({
  name,
  iconUrl,
  price,
  nameColor,
  iconSize = 44,
}: {
  name: string
  iconUrl?: string
  price?: { chaosValue: number; divineValue?: number } | null
  nameColor?: string
  iconSize?: number
}): JSX.Element {
  return (
    <>
      <div className="text-[11px] text-center leading-tight" style={{ color: nameColor }}>
        {name}
      </div>
      <div className="flex items-center justify-center gap-2">
        {iconUrl ? (
          <IconGlow src={iconUrl} size={iconSize} blur={14} saturate={2.5} opacity={0.35} />
        ) : (
          <div style={{ width: iconSize, height: iconSize }} />
        )}
        {price && price.chaosValue > 0 && (
          <PriceChip chaosValue={price.chaosValue} divineValue={price.divineValue} size="sm" />
        )}
      </div>
    </>
  )
}

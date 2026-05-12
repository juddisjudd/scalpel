import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { AppSettings, CheatSheetCategory } from '../../../shared/types'
import { useStickyZone } from '../shared/use-current-zone'

export function App(): JSX.Element | null {
  const [categories, setCategories] = useState<CheatSheetCategory[]>([])
  const currentZone = useStickyZone()
  const rootRef = useRef<HTMLDivElement>(null)

  // Load categories from settings, subscribe to updates. The flat cheatSheets
  // field always mirrors the active game's per-version slot (see MIRROR_KEYS
  // in settings-write.ts), so we read it for both initial load and updates.
  useEffect(() => {
    void window.api.getSettings().then((s: AppSettings) => {
      setCategories(s.cheatSheets.categories)
    })
    return window.api.onSettingUpdated((key, value) => {
      if (key === 'cheatSheets') {
        setCategories((value as AppSettings['cheatSheets']).categories)
      }
    })
  }, [])

  // Compute matches across all categories.
  const matches = !currentZone
    ? []
    : categories.flatMap((cat) =>
        cat.sheets
          .filter((s) => s.areaCodes?.includes(currentZone.areaCode))
          .map((s) => ({ categoryId: cat.id, sheet: s })),
      )
  // Stable key for effect deps. Joining ids works because the order is
  // deterministic per zone (driven by categories + sheet ordering).
  const matchKey = matches.map((m) => `${m.categoryId}/${m.sheet.id}`).join(',')

  // Report visibility to main: true when we have at least one match.
  useEffect(() => {
    window.api.pinnedZoneSetVisible(matches.length > 0)
  }, [matches.length])

  // Report content height to main after each layout so the window resizes
  // to fit. useLayoutEffect ensures we measure after paint.
  useLayoutEffect(() => {
    const el = rootRef.current
    if (!el) return
    const height = el.scrollHeight
    if (height > 0) window.api.pinnedZoneSetContentHeight(height)
  }, [matchKey])

  if (matches.length === 0) return null

  return (
    <div ref={rootRef} className="flex flex-col" style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}>
      {matches.map((m) => (
        <img
          key={`${m.categoryId}/${m.sheet.id}`}
          src={`cheatsheet://${m.categoryId}/${m.sheet.id}.${m.sheet.ext}`}
          alt=""
          draggable={false}
          className="block w-full h-auto"
        />
      ))}
    </div>
  )
}

import type { AppSettings } from '../../../../shared/types'

export type HotkeySlot =
  | { kind: 'filter' }
  | { kind: 'pricecheck' }
  | { kind: 'chat'; index: number }
  | { kind: 'appmacro'; index: number }
  | { kind: 'cheatsheet-global' }
  | { kind: 'cheatsheet-category'; index: number }

const slotLabel: Record<string, string> = {
  filter: 'filter',
  pricecheck: 'price check',
  chat: 'macro',
  appmacro: 'app macro',
  'cheatsheet-global': 'Cheat sheet overlay',
}

function slotsEqual(a: HotkeySlot, b: HotkeySlot): boolean {
  if (a.kind !== b.kind) return false
  if (a.kind === 'chat' && b.kind === 'chat') return a.index === b.index
  if (a.kind === 'appmacro' && b.kind === 'appmacro') return a.index === b.index
  if (a.kind === 'cheatsheet-category' && b.kind === 'cheatsheet-category') return a.index === b.index
  return true
}

/**
 * Find the first slot that already uses the given hotkey, ignoring the slot being edited.
 * Returns null if no collision, otherwise returns the label for a user-facing error message.
 */
export function findHotkeyCollision(settings: AppSettings, hotkey: string, excluding: HotkeySlot): string | null {
  if (!hotkey) return null

  const cheatSheets = settings.cheatSheets
  const slots: Array<{ slot: HotkeySlot; value: string; label?: string }> = [
    { slot: { kind: 'filter' }, value: settings.hotkey ?? '' },
    { slot: { kind: 'pricecheck' }, value: settings.priceCheckHotkey ?? '' },
    ...(settings.chatCommands ?? []).map((c, i) => ({
      slot: { kind: 'chat' as const, index: i },
      value: c.hotkey ?? '',
    })),
    ...(settings.appMacros ?? []).map((m, i) => ({
      slot: { kind: 'appmacro' as const, index: i },
      value: m.hotkey ?? '',
    })),
    ...(cheatSheets ? [{ slot: { kind: 'cheatsheet-global' as const }, value: cheatSheets.globalHotkey ?? '' }] : []),
    ...(cheatSheets?.categories ?? []).map((cat, i) => ({
      slot: { kind: 'cheatsheet-category' as const, index: i },
      value: cat.hotkey ?? '',
      label: `Cheat sheet: ${cat.name}`,
    })),
  ]

  for (const { slot, value, label } of slots) {
    if (slotsEqual(slot, excluding)) continue
    if (value === hotkey) return label ?? slotLabel[slot.kind]
  }
  return null
}

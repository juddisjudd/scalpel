import poe1Raw from './item-classes-poe1.json'
import poe2Raw from './item-classes-poe2.json'

/** Inventory footprint plus known basetypes for a single Path of Exile item class. */
export interface ItemClassInfo {
  /** Full list of basetypes that belong to this class. May be empty when the PoE2
   *  file doesn't yet enumerate bases for a class we just need size info on. */
  bases: string[]
  /** Inventory slot size as `[width, height]`. */
  size: [number, number]
}

// JSON imports widen tuple literals to `number[]`, so cast through `unknown`
// to pin the `[width, height]` pair shape we actually expect at runtime.
const POE1 = poe1Raw as unknown as Record<string, ItemClassInfo>
const POE2_ONLY = poe2Raw as unknown as Record<string, ItemClassInfo>

/** PoE2 class list. PoE2 shares most class names with PoE1 (Amulets, Rings, Body
 *  Armours, ...) so we start from the PoE1 map and overlay PoE2-exclusive entries
 *  on top. If a class name appears in both files the PoE2 definition wins. */
const POE2 = { ...POE1, ...POE2_ONLY }

/** Per-version lookup. Use this wherever the caller knows the active PoE version
 *  (IPC handlers, version-aware renderers). Class names that don't exist in the
 *  requested version simply aren't in the map. */
export function getItemClasses(version: 1 | 2): Record<string, ItemClassInfo> {
  return version === 2 ? POE2 : POE1
}

/** Union of every class we know about across both games. Use this from module-
 *  level static map builds (e.g. base-to-class reverse maps assembled at import
 *  time, before the renderer learns its game version). Class names don't collide
 *  between PoE1 and PoE2, so cross-game entries are harmless: a PoE1 item never
 *  has class "Waystones", so the extra keys only matter to the code that actually
 *  queries them. */
export const ITEM_CLASSES_ALL: Record<string, ItemClassInfo> = POE2

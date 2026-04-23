/** Item classes that are available at Ange's in-game Currency Exchange in PoE2.
 *  Mirrors the PoE1 Faustus-eligible list but for PoE2 economy categories.
 *  Start conservative -- easier to add more classes as users find items that
 *  should trigger the banner but don't. */
export const ANGE_CLASSES = new Set([
  'Currency',
  'Stackable Currency',
  'Essences',
  'Runes',
  'Soul Cores',
  'Idols',
  'Lineage Support Gems',
  'Map Fragments',
  'Omens',
])

export const ANGE_EXCEPTIONS = new Set<string>([])

/** Specific base types that are Ange-eligible regardless of class. Leave empty
 *  until a concrete gap shows up -- class matching covers most cases. */
export const ANGE_BASE_TYPES = new Set<string>([])

export function isAngeItem(itemClass: string, baseType: string, rarity?: string): boolean {
  if (ANGE_EXCEPTIONS.has(baseType) || ANGE_EXCEPTIONS.has(itemClass)) return false
  // Rare/Unique stackables (e.g. beasts in PoE1, analogous cases here) aren't exchangeable.
  if ((rarity === 'Rare' || rarity === 'Unique') && itemClass === 'Stackable Currency') return false
  return ANGE_CLASSES.has(itemClass) || ANGE_BASE_TYPES.has(baseType)
}

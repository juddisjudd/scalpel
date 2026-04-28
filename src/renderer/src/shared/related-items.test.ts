import { describe, it, expect } from 'vitest'
import { findRelated } from './related-items'

describe('findRelated', () => {
  it('returns the curated entry for a known query name', () => {
    const entry = findRelated('Tabula Rasa')
    expect(entry).not.toBeNull()
  })

  it('returns null when the curated dataset has no match', () => {
    expect(findRelated('Nothing Like This Exists')).toBeNull()
  })

  it('returns null for items that exist in uniquesByBase but are not curated', () => {
    // PoE2 uniques live in unique-info-poe2.json (uniquesByBase) but are NOT in
    // related-items.json. The price-check sister intentionally shows no entry
    // for them; "uniques on the same base" surfaces on the filter page's
    // UniquesForBase carousel instead.
    expect(findRelated("Cospri's Will")).toBeNull()
  })
})

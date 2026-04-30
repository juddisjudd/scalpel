import { describe, it, expect } from 'vitest'
import { externalLinkUrl } from './external-link'

describe('externalLinkUrl', () => {
  it('uses baseType for Rare items (random name has no wiki page)', () => {
    const url = externalLinkUrl('wiki', { name: 'Mind Locket Chain Belt', baseType: 'Chain Belt', rarity: 'Rare' }, 1)
    expect(url).toBe('https://www.poewiki.net/wiki/Chain%20Belt')
  })

  it('uses baseType for Magic items', () => {
    const url = externalLinkUrl(
      'poedb',
      { name: 'Sanguine Layered Vest of the Troll', baseType: 'Layered Vest', rarity: 'Magic' },
      1,
    )
    expect(url).toBe('https://poedb.tw/us/Layered_Vest')
  })

  it('uses name for Unique items', () => {
    const url = externalLinkUrl('wiki', { name: 'Headhunter', baseType: 'Leather Belt', rarity: 'Unique' }, 1)
    expect(url).toBe('https://www.poewiki.net/wiki/Headhunter')
  })

  it('strips Foulborn prefix for Foulborn uniques', () => {
    const url = externalLinkUrl('wiki', { name: 'Foulborn Headhunter', baseType: 'Leather Belt', rarity: 'Unique' }, 1)
    expect(url).toBe('https://www.poewiki.net/wiki/Headhunter')
  })

  it('uses name for Normal items (where name == baseType anyway)', () => {
    const url = externalLinkUrl('wiki', { name: 'Chaos Orb', baseType: 'Chaos Orb', rarity: 'Currency' }, 1)
    expect(url).toBe('https://www.poewiki.net/wiki/Chaos%20Orb')
  })

  it('routes to PoE2 hosts for poeVersion 2', () => {
    const wiki = externalLinkUrl('wiki', { name: 'Foo Bar', baseType: 'Bar', rarity: 'Rare' }, 2)
    const poedb = externalLinkUrl('poedb', { name: 'Foo Bar', baseType: 'Bar', rarity: 'Rare' }, 2)
    expect(wiki).toBe('https://www.poe2wiki.net/wiki/Bar')
    expect(poedb).toBe('https://poe2db.tw/us/Bar')
  })

  it('strips apostrophes for poedb slugs', () => {
    const url = externalLinkUrl('poedb', { name: "Jeweller's Orb", baseType: "Jeweller's Orb", rarity: 'Currency' }, 1)
    expect(url).toBe('https://poedb.tw/us/Jewellers_Orb')
  })
})

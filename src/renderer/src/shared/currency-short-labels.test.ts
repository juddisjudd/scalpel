import { describe, it, expect } from 'vitest'
import { getCurrencyShortLabel, CURRENCY_SHORT_LABELS } from './currency-short-labels'
import { getCurrencyIconMap } from '../components/price-check/constants'

describe('getCurrencyShortLabel', () => {
  it('returns short labels for common currencies', () => {
    expect(getCurrencyShortLabel('chaos')).toBe('c')
    expect(getCurrencyShortLabel('divine')).toBe('div')
    expect(getCurrencyShortLabel('exa')).toBe('ex')
    expect(getCurrencyShortLabel('exalted')).toBe('ex')
    expect(getCurrencyShortLabel('mirror')).toBe('mirror')
  })

  it('returns short labels for less-common currencies', () => {
    expect(getCurrencyShortLabel('fusing')).toBe('fuse')
    expect(getCurrencyShortLabel('jewellers')).toBe('jeweller')
    expect(getCurrencyShortLabel('jew')).toBe('jeweller')
    expect(getCurrencyShortLabel('transmute')).toBe('trans')
  })

  it('falls back to the trade key for unknown currencies', () => {
    expect(getCurrencyShortLabel('made-up-currency')).toBe('made-up-currency')
  })

  it('has a label for every key in the PoE1 currency icon map', () => {
    const keys = Object.keys(getCurrencyIconMap(1))
    const missing = keys.filter((k) => !(k in CURRENCY_SHORT_LABELS))
    expect(missing).toEqual([])
  })

  it('has a label for every key in the PoE2 currency icon map', () => {
    const keys = Object.keys(getCurrencyIconMap(2))
    const missing = keys.filter((k) => !(k in CURRENCY_SHORT_LABELS))
    expect(missing).toEqual([])
  })
})

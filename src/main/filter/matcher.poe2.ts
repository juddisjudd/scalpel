import type { ConditionResult, FilterCondition, PoeItem } from '../../shared/types'
import { boolMatch, compareNum } from './matcher'

/**
 * Evaluate a single filter condition that only exists in PoE2 filters. Called
 * from the main matcher's default branch so any condition it doesn't natively
 * handle gets a second chance here before falling back to 'unknown'. Returning
 * 'unknown' for a truly unfamiliar name keeps the existing "unknowns don't
 * poison matches" behavior intact.
 *
 * PoE1-only conditions live inline in matcher.ts; mixing them across files
 * would be cross-talk we explicitly want to avoid. Anything PoE2-exclusive
 * belongs in this file.
 */
export function evaluatePoe2Condition(cond: FilterCondition, item: PoeItem): ConditionResult {
  const { type, operator, values } = cond

  switch (type) {
    case 'TwiceCorrupted':
      return boolMatch(item.twiceCorrupted ?? false, values[0]) ? 'pass' : 'fail'

    case 'IsVaalUnique':
      return boolMatch(item.isVaalUnique ?? false, values[0]) ? 'pass' : 'fail'

    case 'HasVaalUniqueMod':
      return boolMatch(item.hasVaalUniqueMod ?? false, values[0]) ? 'pass' : 'fail'

    case 'UnidentifiedItemTier':
      // Clipboard doesn't currently surface the unid tier on PoE2 rares, so
      // treat it as 'unknown' until the parser populates the field. Tracking
      // this as a deliberate unknown (rather than a hardcoded false) keeps the
      // "block gated only on this" path from accidentally matching everything.
      if (item.unidentifiedItemTier == null) return 'unknown'
      return compareNum(item.unidentifiedItemTier, operator, parseInt(values[0])) ? 'pass' : 'fail'

    default:
      return 'unknown'
  }
}

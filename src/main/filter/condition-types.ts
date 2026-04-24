/** Condition types that emit a comparison operator when serialized. The filter
 *  format accepts a bare `=` default for boolean / list conditions (`Class "Foo"`)
 *  but numeric conditions always need the operator written out (`ItemLevel >= 84`).
 *  Parser preserves the authored operator on `FilterCondition.explicitOperator` so
 *  this set only matters when the editor fabricates a condition from scratch and
 *  there's no authored form to preserve.
 *
 *  Single source of truth shared by both serializers (`writer.ts` for full rewrites,
 *  `merge.ts` for in-place edits). Keep the two call sites importing from here --
 *  forking the list silently causes editor-authored numeric conditions to round-trip
 *  without an operator. */
export const NUMERIC_CONDITION_TYPES = new Set<string>([
  'ItemLevel',
  'AreaLevel',
  'DropLevel',
  'Quality',
  'Sockets',
  'LinkedSockets',
  'GemLevel',
  'StackSize',
  'WaystoneTier',
  'UnidentifiedItemTier',
  'MemoryStrands',
  'BaseArmour',
  'BaseEvasion',
  'BaseEnergyShield',
  'BaseWard',
])

#!/usr/bin/env node
/**
 * Generate `src/shared/data/trade/bulk-exchange-ids-poe2.json` from EE2's
 * items.ndjson. EE2 maintains a curated dataset of every PoE2 item with its
 * trade-exchange tag (the slug the /api/trade2/exchange endpoint wants under
 * `want`/`have`), sourced from GGG's public data and kept in lockstep with
 * each PoE2 patch. Pulling it directly keeps us aligned with the same IDs
 * they use (mirror exchange behavior across tools) without us re-deriving
 * them ourselves from the static endpoint.
 *
 * Reads from the adjacent EE2 clone at C:/www/Exiled-Exchange-2 by default.
 * Pass a path as the first argument to override (for CI or different
 * checkouts).
 *
 * Re-run whenever EE2 refreshes its data after a PoE2 patch.
 */

const fs = require('fs')
const path = require('path')

const EE2_DEFAULT = path.resolve(__dirname, '..', '..', 'Exiled-Exchange-2')
const EE2_ROOT = process.argv[2] || EE2_DEFAULT
const IN_FILE = path.join(EE2_ROOT, 'renderer/public/data/en/items.ndjson')
const OUT_FILE = path.resolve(__dirname, '..', 'src/shared/data/trade/bulk-exchange-ids-poe2.json')

if (!fs.existsSync(IN_FILE)) {
  console.error(`EE2 data not found at ${IN_FILE}`)
  console.error('Clone https://github.com/Kvan7/Exiled-Exchange-2 to a sibling directory, or pass its root as an arg.')
  process.exit(1)
}

const lines = fs.readFileSync(IN_FILE, 'utf8').split('\n').filter(Boolean)
const ids = {}
let skipped = 0
for (const line of lines) {
  let item
  try {
    item = JSON.parse(line)
  } catch {
    skipped++
    continue
  }
  if (!item.refName || !item.tradeTag) continue
  // Prefer name over refName when both differ -- refName is the internal
  // identifier but occasional items use name for display. EE2 keeps them
  // in sync for PoE2 items, so this is defensive.
  ids[item.refName] = item.tradeTag
}

// Sort alphabetically for stable diffs across re-runs.
const sorted = Object.fromEntries(Object.entries(ids).sort(([a], [b]) => a.localeCompare(b)))
fs.writeFileSync(OUT_FILE, JSON.stringify(sorted, null, 2) + '\n')
console.log(`wrote ${Object.keys(sorted).length} entries to ${path.relative(process.cwd(), OUT_FILE)} (skipped ${skipped})`)

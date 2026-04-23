#!/usr/bin/env node
/**
 * Pull PoE2 unique-item icon URLs from repoe-fork's community mirror and merge
 * them into `src/shared/data/items/item-icons-poe2.json`. repoe-fork is the same
 * source Sidekick uses -- an MIT-licensed GitHub Pages host for extracted game
 * art (https://repoe-fork.github.io/poe2/Art/2DItems/...).
 *
 * We source the list from Sidekick's pre-compiled index rather than crawling
 * repoe-fork's directory structure: Sidekick already catalogues every PoE2
 * unique with its artwork URL, and each URL points straight at repoe-fork. Base
 * types aren't covered (Sidekick's data doesn't include them), so those still
 * arrive via the runtime harvester in src/main/trade/icon-cache.ts.
 *
 * Existing web.poecdn.com entries from /api/trade2/data/static are preserved --
 * this only fills unique gaps. Re-run whenever Sidekick pulls new unique data
 * in (typically after a PoE2 content patch).
 */

const fs = require('fs')
const path = require('path')
const https = require('https')

const SIDEKICK_URL = 'https://raw.githubusercontent.com/Sidekick-Poe/Sidekick/main/data/poe2/items/en.json'
const OUT_FILE = path.resolve(__dirname, '..', 'src/shared/data/items/item-icons-poe2.json')

function fetch(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) { res.resume(); reject(new Error(`${res.statusCode} ${url}`)); return }
      let body = ''
      res.on('data', (c) => (body += c))
      res.on('end', () => resolve(body))
    }).on('error', reject)
  })
}

async function main() {
  console.log('fetching', SIDEKICK_URL)
  const raw = await fetch(SIDEKICK_URL)
  const parsed = JSON.parse(raw)
  const entries = parsed.$values ?? []

  const existing = JSON.parse(fs.readFileSync(OUT_FILE, 'utf8'))
  const before = Object.keys(existing).length
  let added = 0

  for (const e of entries) {
    const u = e.uniqueItem
    if (!u?.name || !u?.image) continue
    if (!u.image.includes('repoe-fork')) continue // sanity: we only want community-mirror URLs here
    if (existing[u.name]) continue // preserve any existing entry (web.poecdn wins)
    existing[u.name] = u.image
    added++
  }

  const sorted = Object.fromEntries(Object.entries(existing).sort(([a], [b]) => a.localeCompare(b)))
  fs.writeFileSync(OUT_FILE, JSON.stringify(sorted, null, 2) + '\n')
  console.log(`before: ${before}  added: ${added}  after: ${Object.keys(sorted).length}`)
}

main().catch((e) => { console.error(e); process.exit(1) })

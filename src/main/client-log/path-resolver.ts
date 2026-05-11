import { execFileSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'

/** Best-effort resolve the absolute Client.txt path for the running PoE
 *  process. Strategy: ask PowerShell for the executable Path of any
 *  process named PathOfExile* (covers PathOfExile.exe, PathOfExile_x64.exe,
 *  PathOfExileSteam.exe, PathOfExile2.exe, ...). Strip the filename,
 *  append \logs\Client.txt, confirm the file exists.
 *
 *  Returns null on any failure. Callers should treat null as "watcher
 *  doesn't start" - the toggle simply won't appear. This is silent by
 *  design; the user has no setting to fix in v1. */
export function resolveClientLogPath(): string | null {
  let exePath: string
  try {
    const out = execFileSync(
      'powershell.exe',
      [
        '-NoProfile',
        '-Command',
        "Get-Process | Where-Object { $_.Name -like 'PathOfExile*' } | Select-Object -ExpandProperty Path -First 1",
      ],
      { encoding: 'utf8', timeout: 5000, windowsHide: true },
    )
    exePath = out.trim()
  } catch (err) {
    if (process.env.SCALPEL_DEBUG_LOG) console.log('[client-log] path resolver: PowerShell shellout failed', err)
    return null
  }
  if (!exePath) return null
  const candidate = join(dirname(exePath), 'logs', 'Client.txt')
  if (!existsSync(candidate)) {
    if (process.env.SCALPEL_DEBUG_LOG) console.log('[client-log] path resolver: not found at', candidate)
    return null
  }
  return candidate
}

import type { ThemePalette } from './palette'

function parseHex(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return [r, g, b]
}

function toHex(n: number): string {
  return Math.max(0, Math.min(255, Math.round(n)))
    .toString(16)
    .padStart(2, '0')
}

export function hexToRgba(hex: string, alpha: number): string {
  const [r, g, b] = parseHex(hex)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

/** Multiplicative RGB lighten. factor 1.26 is calibrated so the default
 *  bgCard (#23232e) reproduces the current #2c2c3a hover; the derive anchor
 *  test pins it. */
export function lighten(hex: string, factor: number): string {
  const [r, g, b] = parseHex(hex)
  return `#${toHex(r * factor)}${toHex(g * factor)}${toHex(b * factor)}`
}

const BG_HOVER_LIGHTEN = 1.26

/** Resolve the 21 CSS variables the engine owns from a base palette.
 *  --radius / --font-poe / --font-mono are intentionally NOT produced; they
 *  stay fixed in styles.css. */
export function resolveCssVars(p: ThemePalette): Record<string, string> {
  return {
    '--bg': hexToRgba(p.bgSolid, 0.99),
    '--bg-solid': p.bgSolid,
    '--bg-card': p.bgCard,
    '--bg-hover': lighten(p.bgCard, BG_HOVER_LIGHTEN),
    '--bg-solid-translucent': hexToRgba(p.bgSolid, 0.95),
    '--bg-card-translucent': hexToRgba(p.bgCard, 0.95),
    '--border': hexToRgba(p.border, 0.5),
    '--accent': p.accent,
    '--accent-dim': hexToRgba(p.accent, 0.3),
    '--match': p.match,
    '--match-dim': hexToRgba(p.match, 0.2),
    '--secondary-match': p.secondaryMatch,
    '--secondary-match-dim': hexToRgba(p.secondaryMatch, 0.2),
    '--text': p.text,
    '--text-dim': p.textDim,
    '--danger': p.danger,
    '--warn': p.warn,
    '--danger-bg': p.dangerBg,
    '--hide-color': p.hideColor,
    '--show-color': p.showColor,
    '--minimal-color': p.minimalColor,
  }
}

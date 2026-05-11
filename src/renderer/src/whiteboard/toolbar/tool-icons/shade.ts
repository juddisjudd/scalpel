/** Shift a `#rrggbb` hex color toward white (positive amt) or black
 *  (negative amt). Used to derive 3D-marker shading from a single base
 *  color picked in the toolbar. */
export function shade(hex: string, amt: number): string {
  if (!hex.startsWith('#') || hex.length !== 7) return hex
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const adj = (c: number): number => Math.max(0, Math.min(255, Math.round(c + 255 * amt)))
  return '#' + [adj(r), adj(g), adj(b)].map((x) => x.toString(16).padStart(2, '0')).join('')
}

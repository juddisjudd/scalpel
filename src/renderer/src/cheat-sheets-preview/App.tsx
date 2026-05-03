import { useEffect, useState } from 'react'

interface PreviewState {
  src: string
  anchor: { x: number; y: number; width: number; height: number }
  screen: { width: number; height: number }
}

export function App(): JSX.Element {
  const [state, setState] = useState<PreviewState | null>(null)
  useEffect(() => {
    return window.api.onCheatSheetPreview((s) => setState(s))
  }, [])
  if (!state) return <div />

  const PAD = 8
  const placed = placePreview(state.anchor, state.screen, PAD)

  return (
    <div className="fixed inset-0 pointer-events-none">
      <img
        src={state.src}
        alt=""
        className="absolute object-contain"
        style={{
          left: placed.x,
          top: placed.y,
          maxWidth: placed.maxWidth,
          maxHeight: placed.maxHeight,
        }}
      />
    </div>
  )
}

/** Smart-place the preview adjacent to the anchor (the hovered thumbnail's
 *  screen-space rect). Tries right -> left -> below -> above, falling back to
 *  whichever has the most room. Pure function; unit-tested below. */
export function placePreview(
  anchor: { x: number; y: number; width: number; height: number },
  screen: { width: number; height: number },
  pad: number,
): { x: number; y: number; maxWidth: number; maxHeight: number } {
  const rightSpace = screen.width - (anchor.x + anchor.width) - pad * 2
  if (rightSpace > 200) {
    return { x: anchor.x + anchor.width + pad, y: pad, maxWidth: rightSpace, maxHeight: screen.height - pad * 2 }
  }
  const leftSpace = anchor.x - pad * 2
  if (leftSpace > 200) {
    return { x: pad, y: pad, maxWidth: leftSpace, maxHeight: screen.height - pad * 2 }
  }
  const belowSpace = screen.height - (anchor.y + anchor.height) - pad * 2
  if (belowSpace > 200) {
    return { x: pad, y: anchor.y + anchor.height + pad, maxWidth: screen.width - pad * 2, maxHeight: belowSpace }
  }
  return { x: pad, y: pad, maxWidth: screen.width - pad * 2, maxHeight: anchor.y - pad * 2 }
}

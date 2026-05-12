import { useEffect, useState, type ReactNode } from 'react'
import { PoeVersionProvider } from './poe-version-context'

/** Loads the current PoE version from settings on mount and exposes it via
 *  PoeVersionProvider. Used by secondary-overlay entry points whose renderers
 *  need the version context (for hooks like useStickyZone, usePoeVersion).
 *  Renders children with version=1 until the first settings response lands,
 *  matching PoeVersionContext's default - safe since game-version switches
 *  trigger app.relaunch, so the first read is also the final read. */
export function PoeVersionRoot({ children }: { children: ReactNode }): JSX.Element {
  const [version, setVersion] = useState<1 | 2>(1)
  useEffect(() => {
    void window.api.getSettings().then((s) => {
      setVersion(s.poeVersion ?? 1)
    })
  }, [])
  return <PoeVersionProvider version={version}>{children}</PoeVersionProvider>
}

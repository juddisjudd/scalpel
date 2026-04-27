interface FilterChipProps {
  label: React.ReactNode
  /** Binary mode: chip is on/off. Required when `state` is not provided. */
  active?: boolean
  /** Ternary mode: 'yes' / 'no' / undefined (= any). When provided, the chip
   *  cycles through the three states on click and renders a Yes/No badge. */
  state?: 'yes' | 'no' | undefined
  onClick?: () => void
  onChange?: (next: 'yes' | 'no' | undefined) => void
  color?: string
  icon?: string
}

const TERNARY_GREEN = '#5ba85b'
const TERNARY_RED = '#c95a4f'

function nextTernary(current: 'yes' | 'no' | undefined): 'yes' | 'no' | undefined {
  if (current === undefined) return 'yes'
  if (current === 'yes') return 'no'
  return undefined
}

export function FilterChip({
  label,
  active,
  state,
  onClick,
  onChange,
  color = 'var(--accent)',
  icon,
}: FilterChipProps): JSX.Element {
  // Ternary mode is enabled when an `onChange` handler is provided -- this lets
  // us distinguish "ternary chip with current state = any" from "binary chip"
  // even though both can have undefined visual state.
  const ternary = onChange != null
  const ternaryColor = state === 'yes' ? TERNARY_GREEN : state === 'no' ? TERNARY_RED : color
  const effectiveColor = ternary ? ternaryColor : color
  const effectiveActive = ternary ? state !== undefined : !!active
  const isAccent = effectiveColor === 'var(--accent)'

  const handleClick = (): void => {
    if (ternary) onChange?.(nextTernary(state))
    else onClick?.()
  }

  return (
    <div
      onClick={handleClick}
      className="flex items-center gap-1 px-[10px] py-1 rounded-full cursor-pointer text-[11px] font-semibold select-none relative overflow-visible"
      style={{
        background: effectiveActive
          ? isAccent
            ? 'rgba(200,169,110,0.13)'
            : `${effectiveColor}22`
          : 'rgba(0,0,0,0.25)',
        border: effectiveActive
          ? isAccent
            ? '2px solid rgba(200,169,110,0.4)'
            : `2px solid ${effectiveColor}66`
          : '2px solid var(--border)',
        opacity: effectiveActive ? 1 : 0.5,
        color: effectiveActive ? effectiveColor : 'var(--text-dim)',
      }}
    >
      {icon && effectiveActive && (
        <img
          src={icon}
          alt=""
          className="absolute left-0 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ width: 28, height: 28, objectFit: 'contain', filter: 'blur(6px) saturate(3)', opacity: 0.5 }}
        />
      )}
      {icon && <img src={icon} alt="" className="relative -ml-[3px]" style={{ width: 14, height: 14 }} />}
      <span className="relative flex items-center gap-1">{label}</span>
      {ternary && state && (
        <span
          className="absolute -top-1.5 -right-1.5 px-1 rounded-full text-[8px] font-bold leading-[10px] select-none"
          style={{
            background: ternaryColor,
            color: '#0a0a0a',
            border: '1px solid rgba(0,0,0,0.4)',
            minWidth: 16,
            textAlign: 'center',
          }}
        >
          {state === 'yes' ? 'Yes' : 'No'}
        </span>
      )}
    </div>
  )
}

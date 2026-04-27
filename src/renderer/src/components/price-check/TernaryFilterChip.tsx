interface TernaryFilterChipProps {
  label: React.ReactNode
  state: 'yes' | 'no' | undefined
  onChange: (next: 'yes' | 'no' | undefined) => void
}

const GREEN = '#5ba85b'
const RED = '#c95a4f'

function nextState(current: 'yes' | 'no' | undefined): 'yes' | 'no' | undefined {
  if (current === undefined) return 'yes'
  if (current === 'yes') return 'no'
  return undefined
}

export function TernaryFilterChip({ label, state, onChange }: TernaryFilterChipProps): JSX.Element {
  const color = state === 'yes' ? GREEN : state === 'no' ? RED : 'var(--accent)'
  const active = state !== undefined

  return (
    <div
      onClick={() => onChange(nextState(state))}
      className="flex items-center gap-1 px-[10px] py-1 rounded-full cursor-pointer text-[11px] font-semibold select-none relative"
      style={{
        background: active ? `${color}22` : 'rgba(0,0,0,0.25)',
        border: `2px solid ${active ? `${color}66` : 'var(--border)'}`,
        opacity: active ? 1 : 0.5,
        color: active ? color : 'var(--text-dim)',
      }}
    >
      {label}
      {state && (
        <span
          className="absolute -top-1.5 -right-1.5 px-1 rounded-full text-[8px] font-bold leading-[10px] select-none"
          style={{
            background: color,
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

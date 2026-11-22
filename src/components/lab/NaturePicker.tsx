import { motion } from 'framer-motion'
import type { Nature } from '../../data/samples'
import { sfx } from '../../lib/sound'

const OPTIONS: { id: Nature; label: string; sub: string }[] = [
  { id: 'acid', label: 'Acid', sub: 'pH below 7' },
  { id: 'neutral', label: 'Neutral', sub: 'pH 7' },
  { id: 'base', label: 'Base', sub: 'pH above 7' },
]

export function NaturePicker({
  value,
  onChange,
  disabled,
}: {
  value: Nature | null
  onChange: (n: Nature) => void
  disabled?: boolean
}) {
  return (
    <div className="nature" role="radiogroup" aria-label="Acid, neutral or base">
      {OPTIONS.map((o) => (
        <motion.button
          key={o.id}
          type="button"
          role="radio"
          aria-checked={value === o.id}
          disabled={disabled}
          className={`nature-opt nature-${o.id}${value === o.id ? ' is-selected' : ''}`}
          onClick={() => {
            sfx.click()
            onChange(o.id)
          }}
          whileTap={{ scale: 0.96 }}
        >
          <span className="nature-label">{o.label}</span>
          <span className="nature-sub">{o.sub}</span>
        </motion.button>
      ))}
    </div>
  )
}

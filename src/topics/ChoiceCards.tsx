import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import type { ChoiceOption } from './types'
import { sfx } from '../lib/sound'

const TONES = ['#2a8cf0', '#12b3a2', '#8b7cf6', '#f08c00']

/** Answer options as tactile, illustrated cards (not plain text buttons). */
export function ChoiceCards({
  options,
  value,
  onChange,
}: {
  options: ChoiceOption[]
  value: string | null
  onChange: (id: string) => void
}) {
  const hasArt = options.some((o) => o.art)
  return (
    <div className={`choices${hasArt ? ' has-art' : ''}`} role="radiogroup" aria-label="Answer options">
      {options.map((o, i) => {
        const selected = value === o.id
        return (
          <motion.button
            key={o.id}
            type="button"
            role="radio"
            aria-checked={selected}
            className={`choice${selected ? ' is-selected' : ''}`}
            style={{ ['--tone' as string]: TONES[i % TONES.length] }}
            onClick={() => {
              sfx.click()
              onChange(o.id)
            }}
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.97 }}
            animate={selected ? { scale: [1, 1.03, 1] } : { scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <span className="choice-letter">{String.fromCharCode(65 + i)}</span>
            {o.art && <span className="choice-art">{o.art}</span>}
            <span className="choice-text">
              <span className="choice-label">{o.label}</span>
              {o.sub && <span className="choice-sub">{o.sub}</span>}
            </span>
            <motion.span
              className="choice-check"
              initial={false}
              animate={{ scale: selected ? 1 : 0, opacity: selected ? 1 : 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 22 }}
            >
              <Check size={14} strokeWidth={3} />
            </motion.span>
          </motion.button>
        )
      })}
    </div>
  )
}

import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import type { ReactNode } from 'react'
import './shelf.css'

export interface ShelfItem {
  id: string
  label: string
  art: ReactNode
  /** 0 = untouched, 1 = partly done, 2 = complete */
  progress: 0 | 1 | 2
}

interface SampleShelfProps {
  title: string
  items: ShelfItem[]
  selectedId: string
  onSelect: (id: string) => void
  disabled?: boolean
}

/** A lab shelf of selectable containers that lift when chosen. */
export function SampleShelf({ title, items, selectedId, onSelect, disabled }: SampleShelfProps) {
  return (
    <div className="shelf glass">
      <p className="eyebrow shelf-title">{title}</p>
      <div className="shelf-row" role="radiogroup" aria-label={title}>
        {items.map((item) => {
          const selected = item.id === selectedId
          return (
            <motion.button
              key={item.id}
              type="button"
              role="radio"
              aria-checked={selected}
              className={`shelf-item${selected ? ' is-selected' : ''}`}
              onClick={() => onSelect(item.id)}
              disabled={disabled && !selected}
              animate={{ y: selected ? -12 : 0 }}
              whileHover={selected ? undefined : { y: -5, rotate: -2 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 380, damping: 22 }}
            >
              <span className="shelf-glow" aria-hidden="true" />
              <span className="shelf-art">{item.art}</span>
              <span className="shelf-label">{item.label}</span>
              {item.progress > 0 && (
                <span className={`shelf-badge${item.progress === 2 ? ' is-complete' : ''}`} aria-label={item.progress === 2 ? 'completed' : 'in progress'}>
                  {item.progress === 2 ? <Check size={11} strokeWidth={3.5} /> : null}
                </span>
              )}
            </motion.button>
          )
        })}
      </div>
      <div className="shelf-plank" aria-hidden="true" />
    </div>
  )
}

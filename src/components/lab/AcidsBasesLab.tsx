import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Atom, FlaskConical, Search } from 'lucide-react'
import type { Sample } from '../../data/samples'
import { sfx } from '../../lib/sound'
import { KnownSamplesMode } from './KnownSamplesMode'
import { MysteryMode } from './MysteryMode'
import { MoleculeMode, MoleculeModal } from './MoleculeMode'
import './lab.css'

type Mode = 'known' | 'mystery' | 'molecules'

const MODES: { id: Mode; label: string; icon: typeof Atom; sub: string }[] = [
  { id: 'known', label: 'Known Samples', icon: FlaskConical, sub: 'Test everyday substances' },
  { id: 'mystery', label: 'Mystery Samples', icon: Search, sub: 'Identify the unknowns' },
  { id: 'molecules', label: 'Molecule View', icon: Atom, sub: 'Why colours change' },
]

/** The Acids, Bases & pH laboratory. */
export function AcidsBasesLab() {
  const [mode, setMode] = useState<Mode>('known')
  const [explain, setExplain] = useState<Sample | null>(null)

  return (
    <div className="lab">
      <nav className="mode-tabs" role="tablist" aria-label="Experiment type">
        {MODES.map(({ id, label, icon: Icon, sub }) => (
          <button
            key={id}
            role="tab"
            aria-selected={mode === id}
            className={`mode-tab${mode === id ? ' is-active' : ''}`}
            onClick={() => {
              if (mode !== id) sfx.click()
              setMode(id)
            }}
          >
            {mode === id && <motion.span layoutId="mode-tab-bg" className="mode-tab-bg" transition={{ type: 'spring', stiffness: 400, damping: 34 }} />}
            <Icon size={18} />
            <span className="mode-tab-text">
              <span>{label}</span>
              <small>{sub}</small>
            </span>
          </button>
        ))}
      </nav>

      <AnimatePresence mode="wait">
        <motion.div
          key={mode}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          {mode === 'known' && <KnownSamplesMode onExplain={setExplain} />}
          {mode === 'mystery' && <MysteryMode onExplain={setExplain} />}
          {mode === 'molecules' && <MoleculeMode />}
        </motion.div>
      </AnimatePresence>

      <MoleculeModal sample={explain} onClose={() => setExplain(null)} />
    </div>
  )
}

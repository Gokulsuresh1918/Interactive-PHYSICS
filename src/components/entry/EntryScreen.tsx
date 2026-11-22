import { useState } from 'react'
import type { FormEvent } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Atom, Droplets, FlaskConical, Search, Trophy } from 'lucide-react'
import { HeroLabScene } from './HeroLabScene'
import { sfx } from '../../lib/sound'
import './entry.css'

const TITLE = 'SCIENCE PLAYGROUND'

const FEATURES = [
  { icon: Droplets, label: 'Litmus tests' },
  { icon: FlaskConical, label: 'Universal indicator' },
  { icon: Atom, label: 'Molecule view' },
  { icon: Search, label: 'Mystery samples' },
  { icon: Trophy, label: 'Scores & streaks' },
]

export function EntryScreen({ onStart }: { onStart: (name: string) => void }) {
  const [name, setName] = useState('')
  const [error, setError] = useState(false)
  const [shakeKey, setShakeKey] = useState(0)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const clean = name.trim().replace(/\s+/g, ' ')
    if (!clean) {
      setError(true)
      setShakeKey((k) => k + 1)
      sfx.wrong()
      return
    }
    sfx.select()
    onStart(clean)
  }

  return (
    <main className="entry">
      <section className="entry-copy">
        <motion.p
          className="eyebrow"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          Virtual Science Laboratory
        </motion.p>

        <h1 className="entry-title" aria-label={TITLE}>
          {TITLE.split(' ').map((word, w) => (
            <span key={word} className="entry-title-word" aria-hidden="true">
              {word.split('').map((ch, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 24, filter: 'blur(8px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  transition={{ delay: 0.2 + (w * 8 + i) * 0.035, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                >
                  {ch}
                </motion.span>
              ))}
            </span>
          ))}
        </h1>

        <motion.p
          className="entry-sub"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          Discover science. Experiment. Explore.
        </motion.p>

        <motion.form
          className="entry-card glass"
          onSubmit={submit}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.05, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          noValidate
        >
          <label htmlFor="student-name" className="entry-label">
            What should we call you, scientist?
          </label>
          <motion.div
            key={shakeKey}
            className="entry-row"
            animate={shakeKey ? { x: [0, -10, 10, -6, 6, 0] } : undefined}
            transition={{ duration: 0.4 }}
          >
            <input
              id="student-name"
              className={`entry-input${error ? ' has-error' : ''}`}
              value={name}
              maxLength={20}
              autoComplete="off"
              placeholder="Enter your name"
              onChange={(e) => {
                setName(e.target.value)
                if (error && e.target.value.trim()) setError(false)
              }}
              aria-invalid={error}
              aria-describedby="name-help"
            />
            <button type="submit" className="btn btn-primary entry-start">
              Start Experiment <ArrowRight size={18} />
            </button>
          </motion.div>
          <p id="name-help" className={`entry-help${error ? ' is-error' : ''}`} role={error ? 'alert' : undefined}>
            {error
              ? 'Type your name first so we can put it on the scoreboard.'
              : 'No sign-up needed — your progress lasts for this session.'}
          </p>
        </motion.form>

        <motion.ul
          className="entry-features"
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.08, delayChildren: 1.3 } } }}
        >
          {FEATURES.map(({ icon: Icon, label }) => (
            <motion.li
              key={label}
              variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
            >
              <Icon size={15} /> {label}
            </motion.li>
          ))}
        </motion.ul>
      </section>

      <motion.section
        className="entry-art"
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, duration: 1, ease: [0.22, 1, 0.36, 1] }}
        aria-hidden="true"
      >
        <div className="entry-art-halo" />
        <HeroLabScene />
      </motion.section>
    </main>
  )
}

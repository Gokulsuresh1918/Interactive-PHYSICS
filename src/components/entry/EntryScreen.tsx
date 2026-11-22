import { useState } from 'react'
import type { FormEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Crown, Droplets, FlaskConical, Search, Trophy } from 'lucide-react'
import { HeroLabScene } from './HeroLabScene'
import { Avatar } from '../common/Avatar'
import { sfx } from '../../lib/sound'
import { profileKey, useSession } from '../../state/session'
import { TOPIC_BY_ID } from '../../topics/registry'
import type { TopicId } from '../../topics/types'
import './entry.css'

const TITLE = 'SCIENCE PLAYGROUND'

const FEATURES = [
  { icon: Droplets, label: 'Litmus tests' },
  { icon: FlaskConical, label: 'Universal indicator' },
  { icon: Search, label: 'Mystery samples' },
  { icon: Trophy, label: 'Scores & streaks' },
]

export function EntryScreen({ onStart, topic = 'acids' }: { onStart: (name: string) => void; topic?: TopicId }) {
  const { findProfile, leaderboard } = useSession()
  const [name, setName] = useState('')
  const clean = name.trim().replace(/\s+/g, ' ')
  const existing = clean ? findProfile(clean) : null
  const leader = leaderboard[0]
  const meta = TOPIC_BY_ID[topic]
  const [error, setError] = useState(false)
  const [shakeKey, setShakeKey] = useState(0)

  const submit = (e: FormEvent) => {
    e.preventDefault()
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
          {meta.title}
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
          <span className="entry-welcome">
            Step into the virtual lab, test real-world liquids and find out what makes them acidic, basic or neutral.
          </span>
        </motion.p>

        <motion.form
          className="entry-card card"
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
            <span className="entry-avatar" aria-hidden="true">
              <AnimatePresence mode="popLayout">
                <motion.span
                  key={clean ? profileKey(clean) : 'empty'}
                  initial={{ scale: 0.5, rotate: -25, opacity: 0 }}
                  animate={{ scale: 1, rotate: 0, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 380, damping: 18 }}
                >
                  <Avatar seed={clean ? profileKey(clean) : 'science-playground'} name={clean || 'Student'} size={52} />
                </motion.span>
              </AnimatePresence>
            </span>
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
            <button type="submit" className="btn btn-primary btn-shimmer entry-start">
              {existing ? 'Continue' : 'Start Experiment'} <ArrowRight size={18} />
            </button>
          </motion.div>
          <p id="name-help" className={`entry-help${error ? ' is-error' : ''}`} role={error ? 'alert' : undefined}>
            {error
              ? 'Type your name first so we can put it on the scoreboard.'
              : existing
                ? `Welcome back, ${existing.name}! You have ${existing.boardScore} points on the class leaderboard.`
                : 'No sign-up needed — your scores are saved on this computer for the class leaderboard.'}
          </p>
        </motion.form>

        {leader && (
          <motion.p className="entry-leader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}>
            <Crown size={15} />
            <Avatar seed={leader.seed} name={leader.name} size={24} />
            Class leader: <strong>{leader.name}</strong> with {leader.score} points — can you beat them?
          </motion.p>
        )}

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

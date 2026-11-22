import { motion } from 'framer-motion'
import { ArrowRight, Atom, Lock, Magnet, Orbit, Rocket, Waves, Zap } from 'lucide-react'
import { TOPICS } from '../../data/topics'
import { sfx } from '../../lib/sound'
import './topics.css'

const ICONS: Record<string, typeof Atom> = {
  'acids-bases': Atom,
  light: Zap,
  circuits: Magnet,
  newton: Rocket,
  gravity: Orbit,
  sound: Waves,
}

export function TopicHub({ name, onOpen }: { name: string; onOpen: (topicId: string) => void }) {
  return (
    <main className="topics">
      <div className="topics-head">
        <p className="eyebrow">Choose your laboratory</p>
        <h1>Where to next, {name}?</h1>
        <p className="muted">New labs are being built. For now, the chemistry lab is open.</p>
      </div>
      <div className="topics-grid">
        {TOPICS.map((t, i) => {
          const Icon = ICONS[t.id] ?? Atom
          return (
            <motion.button
              key={t.id}
              className={`topic glass${t.available ? '' : ' is-locked'}`}
              style={{ ['--hue' as string]: t.hue }}
              disabled={!t.available}
              onClick={() => {
                sfx.select()
                onOpen(t.id)
              }}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              whileHover={t.available ? { y: -4 } : undefined}
            >
              <span className="topic-icon">
                <Icon size={24} />
              </span>
              <span className="topic-title">{t.title}</span>
              <span className="topic-tag">{t.tagline}</span>
              <span className="topic-cta">
                {t.available ? (
                  <>
                    Enter lab <ArrowRight size={15} />
                  </>
                ) : (
                  <>
                    <Lock size={13} /> Coming soon
                  </>
                )}
              </span>
            </motion.button>
          )
        })}
      </div>
    </main>
  )
}

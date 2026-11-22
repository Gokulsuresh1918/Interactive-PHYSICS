import { useState } from 'react'
import { ImageIcon, Trash2 } from 'lucide-react'
import { IMAGE_CREDITS } from '../../data/imageCredits'
import { SAMPLE_BY_ID } from '../../data/samples'
import { TOPICS } from '../../topics/registry'
import type { TopicId } from '../../topics/types'
import { Modal } from './Modal'
import './footer.css'

interface FooterProps {
  current: TopicId
  onNavigate: (topic: TopicId) => void
  onClearAll: () => void
}

/** Topic navigation + discreet classroom tools. */
export function Footer({ current, onNavigate, onClearAll }: FooterProps) {
  const [confirm, setConfirm] = useState(false)
  const [credits, setCredits] = useState(false)

  return (
    <footer className="footer">
      <div className="footer-inner">
        <nav className="footer-nav" aria-label="Science topics">
          <span className="footer-title">Explore more science</span>
          <ul className="footer-links">
            {TOPICS.map((t) => {
              const Icon = t.icon
              const active = t.id === current
              return (
                <li key={t.id}>
                  <button
                    type="button"
                    className={`footer-link${active ? ' is-active' : ''}`}
                    style={{ ['--topic' as string]: t.color, ['--topic-soft' as string]: t.soft }}
                    onClick={() => onNavigate(t.id)}
                    aria-current={active ? 'page' : undefined}
                  >
                    <Icon size={14} />
                    {t.title}
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>
        <div className="footer-tools">
          <button type="button" className="footer-tool" onClick={() => setCredits(true)}>
            <ImageIcon size={13} /> Image credits
          </button>
          <button type="button" className="footer-tool footer-danger" onClick={() => setConfirm(true)}>
            <Trash2 size={13} /> Clear all data
          </button>
        </div>
      </div>

      <Modal
        open={confirm}
        title="Clear all classroom data?"
        eyebrow="Classroom reset"
        description="This will delete all saved student scores, leaderboard records and progress from this browser. This action cannot be undone."
        onClose={() => setConfirm(false)}
      >
        <div className="modal-actions">
          <button className="btn" onClick={() => setConfirm(false)} autoFocus>
            Cancel
          </button>
          <button
            className="btn btn-danger"
            onClick={() => {
              setConfirm(false)
              onClearAll()
            }}
          >
            <Trash2 size={15} /> Clear All Data
          </button>
        </div>
      </Modal>

      <Modal open={credits} title="Image credits" eyebrow="Photos from Wikimedia Commons" onClose={() => setCredits(false)}>
        <ul className="credits">
          {Object.entries(IMAGE_CREDITS).map(([id, c]) => (
            <li key={id}>
              <img src={`/images/samples/${id}.webp`} alt="" width={56} height={42} />
              <span>
                <strong>{SAMPLE_BY_ID[id]?.name ?? id}</strong>
                <small>
                  “{c.title}” by {c.author.split('\n')[0]} ·{' '}
                  <a href={c.source} target="_blank" rel="noreferrer noopener">
                    {c.license}
                  </a>
                </small>
              </span>
            </li>
          ))}
        </ul>
        <p className="fine">Images were cropped and resized. Chemical reactions and colours in the lab are controlled by scientific data, not by these photos.</p>
      </Modal>
    </footer>
  )
}

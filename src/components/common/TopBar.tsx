import { Flag, FlaskConical, Volume2, VolumeX } from 'lucide-react'
import { useSettings } from '../../state/settings'
import { TOPIC_BY_ID } from '../../topics/registry'
import type { TopicId } from '../../topics/types'
import { Tip } from './Tip'
import './topbar.css'

interface TopBarProps {
  topic?: TopicId
  label?: string
  onHome?: () => void
  onFinish?: () => void
}

export function TopBar({ topic, label, onHome, onFinish }: TopBarProps) {
  const { sound, toggleSound } = useSettings()
  const meta = topic ? TOPIC_BY_ID[topic] : null
  return (
    <header className="topbar">
      <button type="button" className="topbar-brand" onClick={onHome} disabled={!onHome} aria-label="Science Playground — Acids, Bases & pH">
        <span className="topbar-logo">
          <FlaskConical size={18} />
        </span>
        <span className="topbar-name">SCIENCE PLAYGROUND</span>
      </button>
      {meta ? (
        <span className="topbar-topic" style={{ ['--topic' as string]: meta.color, ['--topic-soft' as string]: meta.soft }}>
          <meta.icon size={14} /> {meta.title}
        </span>
      ) : (
        label && <span className="topbar-topic">{label}</span>
      )}
      <div className="topbar-actions">
        {onFinish && (
          <button className="btn btn-sm" onClick={onFinish}>
            <Flag size={15} /> <span className="topbar-hide-sm">Finish &amp; see results</span>
          </button>
        )}
        <Tip label={sound ? 'Sound on' : 'Sound off'} side="bottom">
          <button
            className={`btn btn-icon${sound ? '' : ' is-off'}`}
            onClick={toggleSound}
            aria-pressed={sound}
            aria-label={sound ? 'Mute sound effects' : 'Turn sound effects on'}
          >
            {sound ? <Volume2 size={17} /> : <VolumeX size={17} />}
          </button>
        </Tip>
      </div>
    </header>
  )
}

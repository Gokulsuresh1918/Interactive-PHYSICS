import { Flag, FlaskConical, Volume2, VolumeX } from 'lucide-react'
import { useSettings } from '../../state/settings'
import './topbar.css'

interface TopBarProps {
  subtitle?: string
  onFinish?: () => void
}

export function TopBar({ subtitle, onFinish }: TopBarProps) {
  const { sound, toggleSound } = useSettings()
  return (
    <header className="topbar">
      <div className="topbar-brand">
        <span className="topbar-logo">
          <FlaskConical size={18} />
        </span>
        <span className="topbar-name">SCIENCE PLAYGROUND</span>
        {subtitle && <span className="topbar-topic">{subtitle}</span>}
      </div>
      <div className="topbar-actions">
        {onFinish && (
          <button className="btn btn-sm" onClick={onFinish}>
            <Flag size={15} /> <span className="topbar-hide-sm">Finish &amp; see results</span>
          </button>
        )}
        <button
          className={`btn btn-icon${sound ? '' : ' is-off'}`}
          onClick={toggleSound}
          aria-pressed={sound}
          aria-label={sound ? 'Mute sound effects' : 'Turn sound effects on'}
          title={sound ? 'Sound on' : 'Sound off'}
        >
          {sound ? <Volume2 size={17} /> : <VolumeX size={17} />}
        </button>
      </div>
    </header>
  )
}

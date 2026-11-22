import { FlaskConical, LayoutGrid, Palette, Volume2, VolumeX } from 'lucide-react'
import { useSettings } from '../../state/settings'
import { sfx } from '../../lib/sound'
import './topbar.css'

interface TopBarProps {
  topicTitle?: string
  onTopics?: () => void
}

export function TopBar({ topicTitle, onTopics }: TopBarProps) {
  const { sound, toggleSound, theme, toggleTheme } = useSettings()
  return (
    <header className="topbar">
      <div className="topbar-brand">
        <span className="topbar-logo">
          <FlaskConical size={18} />
        </span>
        <span className="topbar-name">Science Playground</span>
        {topicTitle && (
          <>
            <span className="topbar-sep">/</span>
            <span className="topbar-topic">{topicTitle}</span>
          </>
        )}
      </div>
      <div className="topbar-actions">
        {onTopics && (
          <button className="btn btn-ghost btn-sm" onClick={onTopics}>
            <LayoutGrid size={15} /> <span className="topbar-hide-sm">All topics</span>
          </button>
        )}
        <button
          className="btn btn-ghost btn-icon"
          onClick={() => {
            toggleTheme()
            sfx.click()
          }}
          aria-label={`Switch lab theme (current: ${theme === 'aqua' ? 'Aqua' : 'Nebula'})`}
          title={`Theme: ${theme === 'aqua' ? 'Aqua lab' : 'Nebula lab'}`}
        >
          <Palette size={17} />
        </button>
        <button
          className={`btn btn-ghost btn-icon${sound ? '' : ' is-off'}`}
          onClick={() => {
            toggleSound()
          }}
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

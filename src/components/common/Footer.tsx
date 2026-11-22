import { Lock, Magnet, Orbit, Rocket, Waves, Zap } from 'lucide-react'
import { TOPICS } from '../../data/topics'
import './footer.css'

const ICONS: Record<string, typeof Zap> = {
  light: Zap,
  circuits: Magnet,
  newton: Rocket,
  gravity: Orbit,
  sound: Waves,
}

/** Small, unobtrusive links to future topics. */
export function Footer() {
  const upcoming = TOPICS.filter((t) => !t.available)
  return (
    <footer className="footer">
      <div className="footer-inner">
        <span className="footer-title">Explore more science</span>
        <ul className="footer-links">
          {upcoming.map((t) => {
            const Icon = ICONS[t.id] ?? Zap
            return (
              <li key={t.id}>
                <button type="button" className="footer-link" disabled title={`${t.title} — coming soon`}>
                  <Icon size={14} style={{ color: t.hue }} />
                  {t.title}
                  <span className="footer-soon">
                    <Lock size={10} /> Soon
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
        <span className="footer-copy">Science Playground · Acids, Bases &amp; pH</span>
      </div>
    </footer>
  )
}

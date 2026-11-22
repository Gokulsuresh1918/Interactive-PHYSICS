import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { MotionConfig } from 'framer-motion'
import './index.css'
import App from './App.tsx'
import { SessionProvider } from './state/session'
import { SettingsProvider } from './state/settings'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MotionConfig reducedMotion="user">
      <SettingsProvider>
        <SessionProvider>
          <App />
        </SessionProvider>
      </SettingsProvider>
    </MotionConfig>
  </StrictMode>,
)

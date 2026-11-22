import { createContext, useContext, useEffect, useLayoutEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { setSoundEnabled } from '../lib/sound'

export type ThemeId = 'aqua' | 'nebula'

interface Settings {
  sound: boolean
  theme: ThemeId
  toggleSound: () => void
  toggleTheme: () => void
}

const KEY = 'science-playground/settings'

function read(): { sound: boolean; theme: ThemeId } {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? '{}')
    return { sound: v.sound ?? true, theme: v.theme === 'nebula' ? 'nebula' : 'aqua' }
  } catch {
    return { sound: true, theme: 'aqua' }
  }
}

const SettingsContext = createContext<Settings | null>(null)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [initial] = useState(read)
  const [sound, setSound] = useState(initial.sound)
  const [theme, setTheme] = useState<ThemeId>(initial.theme)

  // Layout effect so the theme attribute is set before children read CSS variables.
  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  useEffect(() => {
    setSoundEnabled(sound)
    try {
      localStorage.setItem(KEY, JSON.stringify({ sound, theme }))
    } catch {
      /* ignore */
    }
  }, [sound, theme])

  const value = useMemo(
    () => ({
      sound,
      theme,
      toggleSound: () => setSound((s) => !s),
      toggleTheme: () => setTheme((t) => (t === 'aqua' ? 'nebula' : 'aqua')),
    }),
    [sound, theme],
  )
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}

export function useSettings() {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings must be used inside SettingsProvider')
  return ctx
}

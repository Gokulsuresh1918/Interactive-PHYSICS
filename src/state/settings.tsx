import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { setSoundEnabled } from '../lib/sound'

interface Settings {
  sound: boolean
  toggleSound: () => void
}

const KEY = 'science-playground/settings'

function readSound(): boolean {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? '{}')
    return v.sound ?? true
  } catch {
    return true
  }
}

const SettingsContext = createContext<Settings | null>(null)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [sound, setSound] = useState(readSound)

  useEffect(() => {
    setSoundEnabled(sound)
    try {
      localStorage.setItem(KEY, JSON.stringify({ sound }))
    } catch {
      /* storage unavailable — ignore */
    }
  }, [sound])

  const value = useMemo(() => ({ sound, toggleSound: () => setSound((s) => !s) }), [sound])
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}

export function useSettings() {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings must be used inside SettingsProvider')
  return ctx
}

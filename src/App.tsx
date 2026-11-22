import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { AmbientBackground } from './components/common/AmbientBackground'
import { Footer } from './components/common/Footer'
import { TopBar } from './components/common/TopBar'
import { EntryScreen } from './components/entry/EntryScreen'
import { LabFlow } from './components/flow/LabFlow'
import { Sidebar } from './components/lab/Sidebar'
import { ResultsScreen } from './components/results/ResultsScreen'
import { useSession } from './state/session'
import './app.css'

type Screen = 'welcome' | 'lab' | 'results'

/**
 * Science Playground. The Acids, Bases & pH lab is the main experience;
 * future topics are linked from the footer.
 */
export default function App() {
  const { state, start, reset } = useSession()
  const [screen, setScreen] = useState<Screen>(state.name ? 'lab' : 'welcome')

  const go = (s: Screen) => {
    setScreen(s)
    window.scrollTo({ top: 0 })
  }

  return (
    <>
      <AmbientBackground />
      <AnimatePresence mode="wait">
        <motion.div
          key={screen}
          className="screen"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {screen === 'welcome' && (
            <EntryScreen
              onStart={(name) => {
                start(name)
                go('lab')
              }}
            />
          )}

          {screen === 'lab' && (
            <>
              <TopBar subtitle="Acids, Bases & pH" onFinish={() => go('results')} />
              <div className="lab-layout">
                <Sidebar />
                <main className="lab-main">
                  <LabFlow key={state.sessionId} onFinish={() => go('results')} />
                </main>
              </div>
            </>
          )}

          {screen === 'results' && (
            <>
              <TopBar subtitle="Your results" />
              <ResultsScreen
                onReplay={() => {
                  reset(true)
                  go('lab')
                }}
                onBack={() => go('lab')}
                onHome={() => {
                  reset(false)
                  go('welcome')
                }}
              />
            </>
          )}

          <Footer />
        </motion.div>
      </AnimatePresence>
    </>
  )
}

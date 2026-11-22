import { Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { AmbientBackground } from './components/common/AmbientBackground'
import { Footer } from './components/common/Footer'
import { TipProvider } from './components/common/Tip'
import { TopBar } from './components/common/TopBar'
import { EntryScreen } from './components/entry/EntryScreen'
import { LabFlow } from './components/flow/LabFlow'
import { Sidebar } from './components/lab/Sidebar'
import { ResultsScreen } from './components/results/ResultsScreen'
import { useSession } from './state/session'
import { TopicNavContext } from './topics/nav'
import { TOPIC_BY_ID, isTopicId } from './topics/registry'
import type { TopicId } from './topics/types'
import './app.css'

type Screen = 'welcome' | 'lab' | 'results'

/** Acids, Bases & pH is the default route ("/"); physics topics live at #/optics, #/circuits … */
function topicFromHash(): TopicId {
  const id = window.location.hash.replace(/^#\/?/, '')
  return isTopicId(id) ? id : 'acids'
}

export default function App() {
  const { state, profile, start, reset, clearAll } = useSession()
  const [screen, setScreen] = useState<Screen>(profile ? 'lab' : 'welcome')
  const [topic, setTopic] = useState<TopicId>(topicFromHash)

  useEffect(() => {
    const onHash = () => setTopic(topicFromHash())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  // If the active profile disappears (e.g. data cleared in another tab), go back to the welcome screen.
  useEffect(() => {
    if (!profile && screen !== 'welcome') setScreen('welcome')
  }, [profile, screen])

  const go = useCallback((s: Screen) => {
    setScreen(s)
    window.scrollTo({ top: 0 })
  }, [])

  const navigate = useCallback(
    (id: TopicId) => {
      const hash = id === 'acids' ? '' : `#/${id}`
      if (window.location.hash !== hash) {
        history.pushState(null, '', hash || window.location.pathname)
      }
      setTopic(id)
      if (profile) go('lab')
      else window.scrollTo({ top: 0 })
    },
    [profile, go],
  )

  const nav = useMemo(() => ({ onNavigate: navigate, onFinish: () => go('results') }), [navigate, go])
  const meta = TOPIC_BY_ID[topic]
  const TopicPage = meta.page

  return (
    <TipProvider>
      <AmbientBackground />
      <AnimatePresence mode="wait">
        <motion.div
          key={screen === 'lab' ? `lab-${topic}` : screen}
          className="screen"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          {screen === 'welcome' && (
            <EntryScreen
              topic={topic}
              onStart={(name) => {
                start(name)
                go('lab')
              }}
            />
          )}

          {screen === 'lab' && profile && (
            <>
              <TopBar topic={topic} onHome={() => navigate('acids')} onFinish={() => go('results')} />
              <div className="lab-layout">
                <Sidebar
                  topic={topic}
                  onSwitchStudent={() => {
                    reset(false)
                    go('welcome')
                  }}
                />
                <main className="lab-main">
                  <TopicNavContext.Provider value={nav}>
                    {TopicPage ? (
                      <Suspense fallback={<div className="topic-loading">Setting up the {meta.title} lab…</div>}>
                        <TopicPage key={`${topic}-${state.sessionId}`} />
                      </Suspense>
                    ) : (
                      <LabFlow key={state.sessionId} onFinish={() => go('results')} />
                    )}
                  </TopicNavContext.Provider>
                </main>
              </div>
            </>
          )}

          {screen === 'results' && profile && (
            <>
              <TopBar label="Your results" onHome={() => navigate('acids')} />
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

          <Footer
            current={topic}
            onNavigate={navigate}
            onClearAll={() => {
              clearAll()
              history.replaceState(null, '', window.location.pathname)
              setTopic('acids')
              go('welcome')
            }}
          />
        </motion.div>
      </AnimatePresence>
    </TipProvider>
  )
}

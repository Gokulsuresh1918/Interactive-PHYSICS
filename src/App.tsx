import { useState } from 'react'
import type { ComponentType } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { AmbientBackground } from './components/common/AmbientBackground'
import { TopBar } from './components/common/TopBar'
import { EntryScreen } from './components/entry/EntryScreen'
import { AcidsBasesLab } from './components/lab/AcidsBasesLab'
import { Sidebar } from './components/lab/Sidebar'
import { ResultsScreen } from './components/results/ResultsScreen'
import { TopicHub } from './components/topics/TopicHub'
import { TOPICS } from './data/topics'
import { useSession } from './state/session'
import './app.css'

/** Register each topic's lab component here as new topics are built. */
const TOPIC_LABS: Record<string, ComponentType> = {
  'acids-bases': AcidsBasesLab,
}

type Screen = 'entry' | 'topics' | 'lab' | 'results'

export default function App() {
  const { state, start, reset } = useSession()
  const [screen, setScreen] = useState<Screen>(state.name ? 'lab' : 'entry')
  const [topicId, setTopicId] = useState('acids-bases')

  const topic = TOPICS.find((t) => t.id === topicId)!
  const Lab = TOPIC_LABS[topicId]

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
          transition={{ duration: 0.35 }}
        >
          {screen === 'entry' && (
            <EntryScreen
              onStart={(name) => {
                start(name)
                go('lab')
              }}
            />
          )}

          {screen === 'topics' && (
            <div className="shell">
              <TopBar />
              <TopicHub
                name={state.name}
                onOpen={(id) => {
                  setTopicId(id)
                  go('lab')
                }}
              />
            </div>
          )}

          {screen === 'lab' && Lab && (
            <div className="shell">
              <TopBar topicTitle={topic.title} onTopics={() => go('topics')} />
              <div className="lab-layout">
                <Sidebar onFinish={() => go('results')} />
                <main className="lab-main">
                  <Lab key={state.sessionId} />
                </main>
              </div>
            </div>
          )}

          {screen === 'results' && (
            <div className="shell">
              <TopBar topicTitle="Results" />
              <ResultsScreen
                onReplay={() => {
                  reset(true)
                  go('lab')
                }}
                onBack={() => go('lab')}
                onHome={() => {
                  reset(false)
                  go('entry')
                }}
              />
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </>
  )
}

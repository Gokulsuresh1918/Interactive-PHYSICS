import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { KnownFlow } from './KnownFlow'
import { MysteryFlow } from './MysteryFlow'
import { SampleChooser } from './SampleChooser'
import type { ChooserTab } from './SampleChooser'
import './flow.css'

type Route = { view: 'choose' } | { view: 'known'; id: string } | { view: 'mystery'; id: string }

/** The Acids, Bases & pH experience: choose a sample, then follow a guided experiment. */
export function LabFlow({ onFinish }: { onFinish: () => void }) {
  const [route, setRoute] = useState<Route>({ view: 'choose' })
  const [tab, setTab] = useState<ChooserTab>('known')

  const choose = () => {
    setRoute({ view: 'choose' })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const openSample = (id: string) => {
    setRoute({ view: 'known', id })
    window.scrollTo({ top: 0 })
  }
  const openMystery = (id: string) => {
    setRoute({ view: 'mystery', id })
    window.scrollTo({ top: 0 })
  }

  const key = route.view === 'choose' ? 'choose' : `${route.view}-${route.id}`

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={key}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      >
        {route.view === 'choose' && (
          <SampleChooser tab={tab} onTab={setTab} onPickSample={openSample} onPickMystery={openMystery} />
        )}
        {route.view === 'known' && (
          <KnownFlow sampleId={route.id} onChooseSample={choose} onOpenSample={openSample} onFinish={onFinish} />
        )}
        {route.view === 'mystery' && (
          <MysteryFlow
            mysteryId={route.id}
            onChooseSample={() => {
              setTab('mystery')
              choose()
            }}
            onOpenMystery={openMystery}
            onFinish={onFinish}
          />
        )}
      </motion.div>
    </AnimatePresence>
  )
}

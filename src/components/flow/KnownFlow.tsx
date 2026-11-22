import { useState } from 'react'
import type { ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Atom, BookOpen, CheckCircle2, Droplets, Pipette } from 'lucide-react'
import { SAMPLES, SAMPLE_BY_ID } from '../../data/samples'
import type { Nature } from '../../data/samples'
import { formatPhRange, natureLabel, phColor, phColorName } from '../../lib/chemistry'
import { POINTS, scoreNature, scorePh } from '../../lib/scoring'
import { sfx } from '../../lib/sound'
import { useSession } from '../../state/session'
import { Modal } from '../common/Modal'
import { FeedbackCard } from '../lab/FeedbackCard'
import { MoleculeView } from '../lab/MoleculeView'
import { NaturePicker } from '../lab/NaturePicker'
import { ObservationLog } from '../lab/ObservationLog'
import { PhScale } from '../lab/PhScale'
import { Workbench } from '../lab/Workbench'
import type { BenchTests } from '../lab/Workbench'
import { Evidence } from './Evidence'
import { Stepper } from './Stepper'

type Test = 'litmus' | 'indicator'
type Step = 'test' | 'observe' | 'predict' | 'result'

const STEPS = ['Choose sample', 'Choose test', 'Observe', 'Predict', 'Result']
const STEP_INDEX: Record<Step, number> = { test: 1, observe: 2, predict: 3, result: 4 }

const LITMUS_REASON: Record<Nature, string> = {
  acid: 'Blue litmus turns red only in acids. Red litmus stays red.',
  base: 'Red litmus turns blue only in bases. Blue litmus stays blue.',
  neutral: 'Neither strip changes colour in a neutral solution.',
}

const article = (n: Nature) => (n === 'acid' ? 'an acid' : n === 'base' ? 'a base' : 'neutral')
const challengeId = (test: Test, sampleId: string) => `${test === 'litmus' ? 'litmus' : 'ph'}:${sampleId}`

interface KnownFlowProps {
  sampleId: string
  onChooseSample: () => void
  onOpenSample: (id: string) => void
  onFinish: () => void
}

/** Guided experiment for one known sample: one task per screen. */
export function KnownFlow({ sampleId, onChooseSample, onOpenSample, onFinish }: KnownFlowProps) {
  const { state, answer } = useSession()
  const sample = SAMPLE_BY_ID[sampleId]
  const [step, setStep] = useState<Step>('test')
  const [test, setTest] = useState<Test>('litmus')
  const [tests, setTests] = useState<BenchTests>({})
  const [run, setRun] = useState(0)
  const [busy, setBusy] = useState(false)
  const [nature, setNature] = useState<Nature | null>(null)
  const [ph, setPh] = useState<number | null>(null)
  const [fresh, setFresh] = useState<string | null>(null)
  const [modal, setModal] = useState<'guide' | 'molecules' | null>(null)

  const answered = (t: Test) => state.answered[challengeId(t, sample.id)]
  const go = (s: Step) => {
    setStep(s)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const startTest = (t: Test) => {
    sfx.click()
    setTest(t)
    setTests({})
    setNature(null)
    setPh(null)
    setRun((r) => r + 1)
    go('observe')
  }

  const observed = test === 'litmus' ? !!(tests.red || tests.blue) : !!tests.indicator
  const record = answered(test)

  const submit = () => {
    const id = challengeId(test, sample.id)
    if (test === 'litmus' && nature) {
      answer(id, { category: 'litmus', results: [scoreNature(nature, sample.nature)], given: { nature } })
    } else if (test === 'indicator' && ph !== null) {
      answer(id, { category: 'ph', results: [scorePh(ph, sample.phRange)], given: { ph } })
    } else return
    setFresh(id)
    go('result')
  }

  // What comes after this result: the other test, then the next unfinished sample.
  const otherTest: Test = test === 'litmus' ? 'indicator' : 'litmus'
  const nextSample = (() => {
    const i = SAMPLES.findIndex((s) => s.id === sample.id)
    const order = [...SAMPLES.slice(i + 1), ...SAMPLES.slice(0, i)]
    return order.find((s) => !state.answered[`litmus:${s.id}`] || !state.answered[`ph:${s.id}`])
  })()

  return (
    <div className="flow">
      <Stepper steps={STEPS} current={STEP_INDEX[step]} />

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          className="flow-screen"
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        >
          {step === 'test' && (
            <>
              <div className="screen-head">
                <div className="screen-title-row">
                  <span className="screen-bottle">
                    <img src={`/images/samples/${sample.id}.webp`} alt={sample.name} width={84} height={84} />
                  </span>
                  <div>
                    <p className="eyebrow">Sample: {sample.name}</p>
                    <h2>How do you want to test it?</h2>
                    <p className="muted">{sample.description}</p>
                  </div>
                </div>
                <button className="btn btn-ghost" onClick={onChooseSample}>
                  <ArrowLeft size={16} /> Change sample
                </button>
              </div>

              <div className="test-cards">
                <TestCard
                  icon={<Droplets size={26} />}
                  tone="litmus"
                  title="Litmus test"
                  question="Is it an acid, a base or neutral?"
                  done={!!answered('litmus')}
                  points={answered('litmus')?.points}
                  onClick={() => startTest('litmus')}
                />
                <TestCard
                  icon={<Pipette size={26} />}
                  tone="indicator"
                  title="Universal indicator"
                  question="What is its pH value?"
                  done={!!answered('indicator')}
                  points={answered('indicator')?.points}
                  onClick={() => startTest('indicator')}
                />
              </div>
            </>
          )}

          {step === 'observe' && (
            <div className="observe">
              <section className="card observe-bench">
                <Workbench
                  key={run}
                  sample={sample}
                  label={sample.name}
                  pourKey={`${sample.id}-${run}`}
                  tests={tests}
                  tools={test === 'litmus' ? ['red', 'blue'] : ['indicator']}
                  onTestComplete={(patch) => setTests((t) => ({ ...t, ...patch }))}
                  onBusyChange={setBusy}
                />
              </section>
              <aside className="card observe-side">
                <p className="eyebrow">{test === 'litmus' ? 'Litmus test' : 'Universal indicator'}</p>
                <h3>
                  {test === 'litmus'
                    ? `Dip the litmus strips into the ${sample.name.toLowerCase()}`
                    : `Add universal indicator to the ${sample.name.toLowerCase()}`}
                </h3>
                <p className="muted">
                  {test === 'litmus'
                    ? 'Use both the red and the blue strip, then watch the wet end of each strip.'
                    : 'Add three drops and watch the colour of the liquid change.'}
                </p>
                <ObservationLog tests={tests} sample={sample} />
                {test === 'litmus' && observed && !(tests.red && tests.blue) && (
                  <p className="tip">Tip: one strip can be ambiguous — test the other colour too.</p>
                )}
                <div className="side-actions">
                  <button className="btn btn-ghost" onClick={() => go('test')} disabled={busy}>
                    <ArrowLeft size={16} /> Back
                  </button>
                  <button
                    className="btn btn-primary btn-lg"
                    disabled={!observed || busy}
                    onClick={() => {
                      sfx.click()
                      go(record ? 'result' : 'predict')
                    }}
                  >
                    {record ? 'See your result' : 'Continue'} <ArrowRight size={17} />
                  </button>
                </div>
              </aside>
            </div>
          )}

          {step === 'predict' && (
            <div className="qa">
              <aside className="card qa-evidence">
                <Evidence sample={sample} tests={tests} />
              </aside>
              <section className="card qa-question">
                <p className="eyebrow">
                  Question · {test === 'litmus' ? POINTS.nature : POINTS.ph} points
                </p>
                {test === 'litmus' ? (
                  <>
                    <h2>What is the nature of {sample.name.toLowerCase()}?</h2>
                    <NaturePicker value={nature} onChange={setNature} />
                    <button className="link-btn" onClick={() => setModal('guide')}>
                      <BookOpen size={15} /> Need a reminder? Open the litmus guide
                    </button>
                  </>
                ) : (
                  <>
                    <h2>What do you think the pH value is?</h2>
                    <p className="muted">
                      The solution turned <strong>{phColorName(sample.ph)}</strong>. Click or drag on the scale to
                      the colour that matches best.
                    </p>
                    <PhScale value={ph} onChange={setPh} observedColor={phColor(sample.ph)} />
                  </>
                )}
                <div className="qa-actions">
                  <button className="btn btn-ghost" onClick={() => go('observe')}>
                    <ArrowLeft size={16} /> Back to the beaker
                  </button>
                  <button
                    className="btn btn-primary btn-lg"
                    disabled={test === 'litmus' ? !nature : ph === null}
                    onClick={submit}
                  >
                    Submit answer
                  </button>
                </div>
              </section>
            </div>
          )}

          {step === 'result' && record && (
            <div className="result">
              <section className="card result-main">
                {test === 'litmus' ? (
                  <div className="result-row">
                  <FeedbackCard
                    outcome={record.results[0].outcome}
                    points={record.points}
                    fresh={fresh === challengeId(test, sample.id)}
                    title={
                      record.results[0].outcome === 'correct'
                        ? `Correct — it's ${article(sample.nature)}!`
                        : `Not quite — it's ${article(sample.nature)}`
                    }
                  >
                    {record.results[0].outcome !== 'correct' && (
                      <p>
                        You chose <strong>{natureLabel(record.given.nature as Nature)}</strong>. Scientists learn from
                        every result!
                      </p>
                    )}
                    <p>{LITMUS_REASON[sample.nature]}</p>
                    <p>{sample.science}</p>
                  </FeedbackCard>
                  <Evidence sample={sample} tests={tests} />
                  </div>
                ) : (
                  <>
                    <FeedbackCard
                      outcome={record.results[0].outcome}
                      points={record.points}
                      fresh={fresh === challengeId(test, sample.id)}
                      title={
                        record.results[0].outcome === 'correct'
                          ? `Great estimate! pH ${formatPhRange(sample.phRange)}`
                          : record.results[0].outcome === 'close'
                            ? `Close! The pH is ${formatPhRange(sample.phRange)}`
                            : `The pH is ${formatPhRange(sample.phRange)}`
                      }
                    >
                      <p>
                        You estimated <strong>pH {String(record.given.ph)}</strong>. A{' '}
                        <strong>{phColorName(sample.ph)}</strong> colour means{' '}
                        {sample.ph < 7 ? 'acidic' : sample.ph > 7 ? 'basic' : 'neutral'}. {sample.science}
                      </p>
                      <p className="fine">
                        Real indicator colours vary a little, so answers within 1 pH unit count as correct.
                      </p>
                    </FeedbackCard>
                    <PhScale value={Number(record.given.ph)} actual={sample.phRange} observedColor={phColor(sample.ph)} />
                  </>
                )}
              </section>

              <aside className="card result-next">
                <button className="why-card" onClick={() => setModal('molecules')}>
                  <span className="why-icon">
                    <Atom size={22} />
                  </span>
                  <span>
                    <strong>Why does the colour change?</strong>
                    <small>See the molecules inside {sample.name.toLowerCase()}</small>
                  </span>
                </button>

                <p className="eyebrow">What next?</p>
                {!answered(otherTest) ? (
                  <button className="btn btn-primary btn-lg" onClick={() => startTest(otherTest)}>
                    Next: {otherTest === 'litmus' ? 'litmus test' : 'universal indicator'} <ArrowRight size={17} />
                  </button>
                ) : nextSample ? (
                  <button
                    className="btn btn-primary btn-lg"
                    onClick={() => {
                      sfx.select()
                      onOpenSample(nextSample.id)
                    }}
                  >
                    Next sample: {nextSample.name} <ArrowRight size={17} />
                  </button>
                ) : (
                  <button className="btn btn-primary btn-lg" onClick={onFinish}>
                    See my results <ArrowRight size={17} />
                  </button>
                )}
                <button className="btn" onClick={onChooseSample}>
                  Choose another sample
                </button>
              </aside>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <Modal open={modal === 'guide'} title="Litmus guide" eyebrow="Reminder" onClose={() => setModal(null)}>
        <LitmusGuide />
      </Modal>
      <Modal
        open={modal === 'molecules'}
        size="lg"
        eyebrow="Microscope view"
        title={`Inside ${sample.name.toLowerCase()} (pH ${formatPhRange(sample.phRange).replace('≈ ', '')})`}
        onClose={() => setModal(null)}
      >
        <MoleculeView ph={sample.ph} />
      </Modal>
    </div>
  )
}

function TestCard({
  icon,
  tone,
  title,
  question,
  done,
  points,
  onClick,
}: {
  icon: ReactNode
  tone: 'litmus' | 'indicator'
  title: string
  question: string
  done: boolean
  points?: number
  onClick: () => void
}) {
  return (
    <motion.button className={`test-card test-card-${tone}`} onClick={onClick} whileHover={{ y: -5 }} whileTap={{ scale: 0.98 }}>
      <span className="test-card-art" aria-hidden="true">
        {tone === 'litmus' ? <LitmusArt /> : <IndicatorArt />}
      </span>
      <span className="test-card-icon">{icon}</span>
      <span className="test-card-title">{title}</span>
      <span className="test-card-q">{question}</span>
      <span className={`test-card-status${done ? ' is-done' : ''}`}>
        {done ? (
          <>
            <CheckCircle2 size={15} /> Completed · +{points} pts
          </>
        ) : (
          <>
            Start <ArrowRight size={15} />
          </>
        )}
      </span>
    </motion.button>
  )
}

function LitmusArt() {
  return (
    <svg viewBox="0 0 120 90">
      <g transform="rotate(-10 40 45)">
        <rect x="30" y="8" width="18" height="74" rx="3" fill="#e05a6e" />
        <rect x="30" y="50" width="18" height="32" rx="3" fill="#c43a52" />
        <rect x="28" y="4" width="22" height="10" rx="3" fill="#5b6f8c" />
      </g>
      <g transform="rotate(10 80 45)">
        <rect x="70" y="8" width="18" height="74" rx="3" fill="#5b8def" />
        <rect x="70" y="50" width="18" height="32" rx="3" fill="#3462c9" />
        <rect x="68" y="4" width="22" height="10" rx="3" fill="#5b6f8c" />
      </g>
    </svg>
  )
}

function IndicatorArt() {
  const colors = ['#ef3e22', '#f8951d', '#efe01f', '#4cbb47', '#1f7ccc', '#5a3aa3']
  return (
    <svg viewBox="0 0 120 90">
      {colors.map((c, i) => (
        <circle key={c} cx={20 + i * 16} cy={60} r="9" fill={c} className="art-dot" style={{ animationDelay: `${i * 0.15}s` }} />
      ))}
      <rect x="54" y="4" width="12" height="14" rx="5" fill="#8b7cf6" />
      <path d="M56 18 H64 V36 L60 44 L56 36 Z" fill="#eaf3ff" stroke="#7f9bba" strokeWidth="1.5" />
    </svg>
  )
}

function LitmusGuide() {
  return (
    <table className="guide-table">
      <thead>
        <tr>
          <th>Solution</th>
          <th>Blue litmus</th>
          <th>Red litmus</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Acid</td>
          <td>turns red</td>
          <td>stays red</td>
        </tr>
        <tr>
          <td>Base</td>
          <td>stays blue</td>
          <td>turns blue</td>
        </tr>
        <tr>
          <td>Neutral</td>
          <td>no change</td>
          <td>no change</td>
        </tr>
      </tbody>
    </table>
  )
}


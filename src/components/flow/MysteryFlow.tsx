import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Atom, Eye, FileSearch, Lock, ScanSearch } from 'lucide-react'
import { MYSTERIES } from '../../data/mysteries'
import type { Mystery } from '../../data/mysteries'
import { SAMPLE_BY_ID } from '../../data/samples'
import type { Nature } from '../../data/samples'
import { formatPhRange, natureLabel, phColor } from '../../lib/chemistry'
import { POINTS, identityValue, scoreIdentity, scoreNature, scorePh } from '../../lib/scoring'
import type { QuestionResult } from '../../lib/scoring'
import { sfx } from '../../lib/sound'
import { useSession } from '../../state/session'
import { Modal } from '../common/Modal'
import { Bottle } from '../lab/Bottle'
import { FeedbackCard } from '../lab/FeedbackCard'
import { MoleculeView } from '../lab/MoleculeView'
import { NaturePicker } from '../lab/NaturePicker'
import { ObservationLog } from '../lab/ObservationLog'
import { PhScale } from '../lab/PhScale'
import { Workbench } from '../lab/Workbench'
import type { BenchTests } from '../lab/Workbench'
import { Evidence } from './Evidence'
import { Stepper } from './Stepper'
import '../lab/mystery.css'

type Step = 'case' | 'observe' | 'nature' | 'ph' | 'identity' | 'result'
const STEPS = ['Choose sample', 'Case file', 'Investigate', 'Conclude', 'Result']
const STEP_INDEX: Record<Step, number> = { case: 1, observe: 2, nature: 3, ph: 3, identity: 3, result: 4 }
const QUESTION_NO: Partial<Record<Step, number>> = { nature: 1, ph: 2, identity: 3 }

interface MysteryFlowProps {
  mysteryId: string
  onChooseSample: () => void
  onOpenMystery: (id: string) => void
  onFinish: () => void
}

/** Guided investigation of one unknown sample. */
export function MysteryFlow({ mysteryId, onChooseSample, onOpenMystery, onFinish }: MysteryFlowProps) {
  const { state, answer, takeHint } = useSession()
  const mystery = MYSTERIES.find((m) => m.id === mysteryId)!
  const sample = SAMPLE_BY_ID[mystery.sampleId]
  const recordId = `mystery:${mystery.id}`
  const record = state.answered[recordId]
  const hintsUsed = state.hints[mystery.id] ?? 0

  const [step, setStep] = useState<Step>(record ? 'result' : 'case')
  const [tests, setTests] = useState<BenchTests>({})
  const [busy, setBusy] = useState(false)
  const [nature, setNature] = useState<Nature | null>(null)
  const [ph, setPh] = useState<number | null>(null)
  const [identity, setIdentity] = useState<string | null>(null)
  const [fresh, setFresh] = useState(false)
  const [modal, setModal] = useState<'case' | 'molecules' | null>(null)

  const go = (s: Step) => {
    setStep(s)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const hint = () => {
    sfx.hint()
    takeHint(mystery.id, mystery.hints.length)
  }

  const submit = () => {
    if (!nature || ph === null || !identity) return
    const results: QuestionResult[] = [
      scoreNature(nature, sample.nature),
      scorePh(ph, sample.phRange),
      ...scoreIdentity(identity, sample.id, hintsUsed),
    ]
    answer(recordId, { category: 'mystery', results, given: { nature, ph, identity, hints: hintsUsed } })
    setFresh(true)
    go('result')
  }

  const anyTest = !!(tests.red || tests.blue || tests.indicator || tests.conductivity)
  const nextMystery = (() => {
    const i = MYSTERIES.findIndex((m) => m.id === mystery.id)
    return [...MYSTERIES.slice(i + 1), ...MYSTERIES.slice(0, i)].find((m) => !state.answered[`mystery:${m.id}`])
  })()

  const question = QUESTION_NO[step]

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
          {step === 'case' && (
            <div className="case">
              <section className="card case-hero">
                <motion.span
                  className="case-vial"
                  animate={{ rotate: [0, -4, 4, 0], y: [0, -6, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Bottle color="#d9e6f2" opacity={0.6} cap="#8b7cf6" mystery code={mystery.code} />
                </motion.span>
                <p className="eyebrow">Mystery sample</p>
                <h2>Unknown #{mystery.code}</h2>
                <p className="muted">Use lab tests to find out what this liquid is.</p>
              </section>
              <section className="card case-file-card">
                <CaseFile mystery={mystery} hintsUsed={hintsUsed} solved={false} onHint={hint} />
                <div className="side-actions">
                  <button className="btn btn-ghost" onClick={onChooseSample}>
                    <ArrowLeft size={16} /> Change sample
                  </button>
                  <button className="btn btn-primary btn-lg" onClick={() => go('observe')}>
                    Start investigating <ArrowRight size={17} />
                  </button>
                </div>
              </section>
            </div>
          )}

          {step === 'observe' && (
            <div className="observe">
              <section className="card observe-bench">
                <Workbench
                  sample={sample}
                  masked
                  label={`Unknown #${mystery.code}`}
                  pourKey={`${mystery.id}`}
                  tests={tests}
                  tools={['red', 'blue', 'indicator', 'conductivity']}
                  onTestComplete={(patch) => setTests((t) => ({ ...t, ...patch }))}
                  onBusyChange={setBusy}
                />
              </section>
              <aside className="card observe-side">
                <p className="eyebrow">Investigate</p>
                <h3>Gather evidence with any tools you like</h3>
                <p className="muted">Litmus shows acid or base, indicator shows pH, and the tester shows dissolved ions.</p>
                <button className="link-btn" onClick={() => setModal('case')}>
                  <ScanSearch size={15} /> Open case file ({1 + hintsUsed} clue{hintsUsed ? 's' : ''})
                </button>
                <ObservationLog tests={tests} sample={sample} />
                <div className="side-actions">
                  <button className="btn btn-ghost" onClick={() => go('case')} disabled={busy}>
                    <ArrowLeft size={16} /> Back
                  </button>
                  <button className="btn btn-primary btn-lg" disabled={!anyTest || busy} onClick={() => go('nature')}>
                    I'm ready to answer <ArrowRight size={17} />
                  </button>
                </div>
              </aside>
            </div>
          )}

          {question && (
            <div className="qa">
              <aside className="card qa-evidence">
                <Evidence sample={sample} tests={tests} masked />
                <button className="link-btn" onClick={() => setModal('case')}>
                  <ScanSearch size={15} /> Case file
                </button>
              </aside>
              <section className="card qa-question">
                <p className="eyebrow">
                  Question {question} of 3 ·{' '}
                  {step === 'identity' ? identityValue(hintsUsed) : step === 'ph' ? POINTS.ph : POINTS.nature} points
                </p>
                {step === 'nature' && (
                  <>
                    <h2>Is Unknown #{mystery.code} an acid, a base or neutral?</h2>
                    <NaturePicker value={nature} onChange={setNature} />
                  </>
                )}
                {step === 'ph' && (
                  <>
                    <h2>What do you think its pH value is?</h2>
                    {!tests.indicator && (
                      <p className="tip">Tip: universal indicator gives the best pH evidence — you can go back and use it.</p>
                    )}
                    <PhScale value={ph} onChange={setPh} observedColor={tests.indicator ? phColor(sample.ph) : null} />
                  </>
                )}
                {step === 'identity' && (
                  <>
                    <h2>Which substance is it?</h2>
                    <div className="suspects" role="radiogroup" aria-label="Possible identity">
                      {mystery.candidates.map((id) => (
                        <button
                          key={id}
                          type="button"
                          role="radio"
                          aria-checked={identity === id}
                          className={`suspect${identity === id ? ' is-selected' : ''}`}
                          onClick={() => {
                            sfx.click()
                            setIdentity(id)
                          }}
                        >
                          <span className="suspect-bottle">
                            <Bottle color={SAMPLE_BY_ID[id].liquidColor} opacity={0.6} cap={SAMPLE_BY_ID[id].cap} />
                          </span>
                          {SAMPLE_BY_ID[id].name}
                        </button>
                      ))}
                    </div>
                    <p className="fine">
                      {hintsUsed === 0
                        ? `No hints used — a correct answer also earns the +${POINTS.noHintBonus} bonus.`
                        : `${hintsUsed} hint${hintsUsed > 1 ? 's' : ''} used — identification is worth ${identityValue(hintsUsed)} pts.`}
                    </p>
                  </>
                )}
                <div className="qa-actions">
                  <button
                    className="btn btn-ghost"
                    onClick={() => go(step === 'nature' ? 'observe' : step === 'ph' ? 'nature' : 'ph')}
                  >
                    <ArrowLeft size={16} /> Back
                  </button>
                  {step === 'identity' ? (
                    <button className="btn btn-primary btn-lg" disabled={!identity} onClick={submit}>
                      Submit conclusion
                    </button>
                  ) : (
                    <button
                      className="btn btn-primary btn-lg"
                      disabled={step === 'nature' ? !nature : ph === null}
                      onClick={() => {
                        sfx.click()
                        go(step === 'nature' ? 'ph' : 'identity')
                      }}
                    >
                      Next question <ArrowRight size={17} />
                    </button>
                  )}
                </div>
              </section>
            </div>
          )}

          {step === 'result' && record && (
            <div className="result">
              <section className="card result-main">
                <Verdict mystery={mystery} record={record.results} given={record.given} fresh={fresh} />
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
                {nextMystery ? (
                  <button
                    className="btn btn-primary btn-lg"
                    onClick={() => {
                      sfx.select()
                      onOpenMystery(nextMystery.id)
                    }}
                  >
                    Next mystery: #{nextMystery.code} <ArrowRight size={17} />
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

      <Modal open={modal === 'case'} title={`Unknown #${mystery.code}`} eyebrow="Case file" onClose={() => setModal(null)}>
        <CaseFile mystery={mystery} hintsUsed={hintsUsed} solved={!!record} onHint={hint} />
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

function CaseFile({
  mystery,
  hintsUsed,
  solved,
  onHint,
}: {
  mystery: Mystery
  hintsUsed: number
  solved: boolean
  onHint: () => void
}) {
  const left = mystery.hints.length - hintsUsed
  return (
    <div className="casefile">
      <div className="casefile-head">
        <FileSearch size={18} />
        <h3>Clues</h3>
      </div>
      <ul className="clues">
        <li className="clue clue-starter">
          <span className="clue-tag">Clue</span>
          {mystery.starterClue}
        </li>
        <AnimatePresence initial={false}>
          {mystery.hints.slice(0, hintsUsed).map((h, i) => (
            <motion.li
              key={h}
              className="clue"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.35 }}
            >
              <span className="clue-tag clue-tag-hint">Hint {i + 1}</span>
              {h}
            </motion.li>
          ))}
        </AnimatePresence>
        {Array.from({ length: left }, (_, i) => (
          <li key={`locked-${i}`} className="clue clue-locked">
            <Lock size={13} /> Hidden hint
          </li>
        ))}
      </ul>
      {!solved && (
        <div className="casefile-foot">
          <button className="btn btn-sm" onClick={onHint} disabled={left === 0}>
            <Eye size={15} /> {left === 0 ? 'No hints left' : 'Reveal a hint'}
          </button>
          <p className="fine">
            Each hint lowers the identification reward by {POINTS.hintPenalty} and removes the +{POINTS.noHintBonus}{' '}
            no-hint bonus.
          </p>
        </div>
      )}
    </div>
  )
}

const ROW_LABEL: Record<string, string> = {
  nature: 'Acid, base or neutral',
  ph: 'pH estimate',
  identity: 'Identification',
  bonus: 'No-hint bonus',
}

function Verdict({
  mystery,
  record,
  given,
  fresh,
}: {
  mystery: Mystery
  record: QuestionResult[]
  given: Record<string, string | number>
  fresh: boolean
}) {
  const sample = SAMPLE_BY_ID[mystery.sampleId]
  const total = record.reduce((s, r) => s + r.points, 0)
  const allRight = record.filter((r) => r.kind !== 'bonus').every((r) => r.outcome === 'correct')
  const idRight = record.find((r) => r.kind === 'identity')?.outcome === 'correct'
  const yours: Record<string, string> = {
    nature: natureLabel(given.nature as Nature),
    ph: `pH ${given.ph}`,
    identity: SAMPLE_BY_ID[String(given.identity)]?.name ?? '—',
    bonus: 'No hints',
  }
  const actual: Record<string, string> = {
    nature: natureLabel(sample.nature),
    ph: `pH ${formatPhRange(sample.phRange)}`,
    identity: sample.name,
    bonus: '',
  }

  return (
    <div className="verdict">
      <motion.div
        className="reveal"
        initial={fresh ? { rotateX: 90, opacity: 0 } : false}
        animate={{ rotateX: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <span className="reveal-photo">
          <img src={`/images/samples/${sample.id}.webp`} alt={sample.name} width={160} height={120} />
        </span>
        <span className="reveal-code">Unknown #{mystery.code} was…</span>
        <span className="reveal-name">{sample.name}</span>
      </motion.div>

      <FeedbackCard
        outcome={allRight ? 'correct' : idRight ? 'close' : 'wrong'}
        points={total}
        fresh={fresh}
        title={allRight ? 'Case solved! Great detective work.' : idRight ? 'Sample identified!' : 'Not this time — check the evidence'}
      >
        <table className="breakdown">
          <tbody>
            {record.map((r) => (
              <tr key={r.kind} className={`row-${r.outcome}`}>
                <td>{ROW_LABEL[r.kind]}</td>
                <td>{yours[r.kind]}</td>
                <td>{r.kind !== 'bonus' && r.outcome !== 'correct' ? `Actual: ${actual[r.kind]}` : '✓'}</td>
                <td className="pts">+{r.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p>{sample.science}</p>
      </FeedbackCard>
    </div>
  )
}

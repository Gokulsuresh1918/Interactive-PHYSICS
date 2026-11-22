import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Atom, Eye, FileSearch, Lock, ScanSearch } from 'lucide-react'
import { MYSTERIES } from '../../data/mysteries'
import type { Mystery } from '../../data/mysteries'
import { SAMPLE_BY_ID } from '../../data/samples'
import type { Nature, Sample } from '../../data/samples'
import { formatPhRange, natureLabel, phColor } from '../../lib/chemistry'
import { POINTS, identityValue, scoreIdentity, scoreNature, scorePh } from '../../lib/scoring'
import type { QuestionResult } from '../../lib/scoring'
import { sfx } from '../../lib/sound'
import { useSession } from '../../state/session'
import { Bottle } from './Bottle'
import { FeedbackCard } from './FeedbackCard'
import { NaturePicker } from './NaturePicker'
import { ObservationLog } from './ObservationLog'
import { PhScale } from './PhScale'
import { SampleShelf } from './SampleShelf'
import { Workbench } from './Workbench'
import type { BenchTests } from './Workbench'
import './mystery.css'

export function MysteryMode({ onExplain }: { onExplain: (sample: Sample) => void }) {
  const { state, answer, takeHint } = useSession()
  const [selectedId, setSelectedId] = useState(MYSTERIES[0].id)
  const [rinse, setRinse] = useState(0)
  const [tests, setTests] = useState<BenchTests>({})
  const [nature, setNature] = useState<Nature | null>(null)
  const [ph, setPh] = useState<number | null>(null)
  const [identity, setIdentity] = useState<string | null>(null)
  const [fresh, setFresh] = useState<string | null>(null)

  const mystery = MYSTERIES.find((m) => m.id === selectedId)!
  const sample = SAMPLE_BY_ID[mystery.sampleId]
  const recordId = `mystery:${mystery.id}`
  const record = state.answered[recordId]
  const hintsUsed = state.hints[mystery.id] ?? 0
  const solved = !!record

  const select = (id: string) => {
    if (id === selectedId) return
    sfx.select()
    setSelectedId(id)
    setTests({})
    setNature(null)
    setPh(null)
    setIdentity(null)
    setFresh(null)
  }

  const submit = () => {
    if (!nature || ph === null || !identity) return
    const results: QuestionResult[] = [
      scoreNature(nature, sample.nature),
      scorePh(ph, sample.phRange),
      ...scoreIdentity(identity, sample.id, hintsUsed),
    ]
    answer(recordId, { category: 'mystery', results, given: { nature, ph, identity, hints: hintsUsed } })
    setFresh(recordId)
  }

  return (
    <div className="mode">
      <SampleShelf
        title="Evidence locker — choose an unknown sample"
        selectedId={selectedId}
        onSelect={select}
        items={MYSTERIES.map((m) => {
          const done = !!state.answered[`mystery:${m.id}`]
          return {
            id: m.id,
            label: done ? `#${m.code} · ${SAMPLE_BY_ID[m.sampleId].name}` : `Sample #${m.code}`,
            progress: done ? 2 : 0,
            art: <Bottle color="#cfe3f0" opacity={0.5} mystery code={m.code} />,
          }
        })}
      />

      <div className="mode-grid">
        <section className="glass mode-bench">
          <Workbench
            sample={sample}
            masked
            label={solved ? sample.name : `Unknown #${mystery.code}`}
            pourKey={`${mystery.id}-${rinse}`}
            tests={tests}
            onTestComplete={(patch) => setTests((t) => ({ ...t, ...patch }))}
            onRinse={() => {
              setRinse((r) => r + 1)
              setTests({})
            }}
          />
        </section>

        <aside className="mode-side">
          <CaseFile
            mystery={mystery}
            hintsUsed={hintsUsed}
            solved={solved}
            onHint={() => {
              sfx.hint()
              takeHint(mystery.id, mystery.hints.length)
            }}
          />
          <div className="glass panel">
            <ObservationLog tests={tests} sample={sample} />
          </div>
        </aside>
      </div>

      <section className="glass panel conclusion">
        <div className="challenge-head">
          <span className="challenge-num">
            <FileSearch size={16} />
          </span>
          <div>
            <h4>Your conclusion</h4>
            <p className="muted">
              {solved
                ? 'Case closed — here is how your investigation went.'
                : 'Use your evidence to decide. You can submit once per sample.'}
            </p>
          </div>
        </div>

        {record ? (
          <Verdict mystery={mystery} sample={sample} record={record.results} given={record.given} fresh={fresh === recordId} onExplain={onExplain} />
        ) : (
          <div className="conclusion-steps">
            <div className="step">
              <p className="step-title">
                <span>1</span> Acid, base or neutral? <em>{POINTS.nature} pts</em>
              </p>
              <NaturePicker value={nature} onChange={setNature} />
            </div>

            <div className="step">
              <p className="step-title">
                <span>2</span> Estimated pH <em>{POINTS.ph} pts</em>
              </p>
              <PhScale value={ph} onChange={setPh} observedColor={tests.indicator ? phColor(sample.ph) : null} />
              {!tests.indicator && (
                <p className="challenge-tip">Tip: universal indicator gives the most reliable pH evidence.</p>
              )}
            </div>

            <div className="step">
              <p className="step-title">
                <span>3</span> Identify the sample <em>{identityValue(hintsUsed)} pts</em>
              </p>
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
                    {SAMPLE_BY_ID[id].name}
                  </button>
                ))}
              </div>
            </div>

            <div className="conclusion-submit">
              <p className="muted">
                {!nature || ph === null || !identity
                  ? 'Complete all three parts to submit.'
                  : hintsUsed === 0
                    ? `No hints used — correct identification earns a +${POINTS.noHintBonus} bonus.`
                    : `${hintsUsed} hint${hintsUsed > 1 ? 's' : ''} used — identification is worth ${identityValue(hintsUsed)} pts.`}
              </p>
              <button className="btn btn-primary" disabled={!nature || ph === null || !identity} onClick={submit}>
                Submit conclusion
              </button>
            </div>
          </div>
        )}
      </section>
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
    <div className="glass panel casefile">
      <div className="casefile-head">
        <ScanSearch size={18} />
        <div>
          <p className="eyebrow">Case file</p>
          <h3>UNKNOWN SAMPLE #{mystery.code}</h3>
        </div>
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
            Each hint lowers the identification reward by {POINTS.hintPenalty} (min {POINTS.identityMin}) and removes
            the +{POINTS.noHintBonus} no-hint bonus.
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
  sample,
  record,
  given,
  fresh,
  onExplain,
}: {
  mystery: Mystery
  sample: Sample
  record: QuestionResult[]
  given: Record<string, string | number>
  fresh: boolean
  onExplain: (s: Sample) => void
}) {
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
        <span className="reveal-code">Unknown #{mystery.code} was…</span>
        <span className="reveal-name">{sample.name}</span>
        <span className="reveal-swatch" style={{ background: phColor(sample.ph) }} />
      </motion.div>

      <FeedbackCard
        outcome={allRight ? 'correct' : idRight ? 'close' : 'wrong'}
        points={total}
        fresh={fresh}
        title={
          allRight
            ? "Case solved! You're a real chemistry detective."
            : idRight
              ? 'Sample identified — check the details below.'
              : 'Not this time — but look at what the evidence was saying.'
        }
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
        <div>
          <button className="btn btn-sm" onClick={() => onExplain(sample)}>
            <Atom size={15} /> See the molecules behind the colour
          </button>
        </div>
      </FeedbackCard>
    </div>
  )
}

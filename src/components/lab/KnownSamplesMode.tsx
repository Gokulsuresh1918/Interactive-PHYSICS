import { useState } from 'react'
import { Atom, Lock } from 'lucide-react'
import { SAMPLES, SAMPLE_BY_ID } from '../../data/samples'
import type { Nature, Sample } from '../../data/samples'
import { formatPhRange, natureLabel, phColor, phColorName } from '../../lib/chemistry'
import { POINTS, scoreNature, scorePh } from '../../lib/scoring'
import { sfx } from '../../lib/sound'
import { useSession } from '../../state/session'
import { Bottle } from './Bottle'
import { FeedbackCard } from './FeedbackCard'
import { NaturePicker } from './NaturePicker'
import { ObservationLog, observationsFor } from './ObservationLog'
import { PhScale } from './PhScale'
import { SampleShelf } from './SampleShelf'
import { Workbench } from './Workbench'
import type { BenchTests } from './Workbench'

const LITMUS_REASON: Record<Nature, string> = {
  acid: 'Blue litmus turns red only in acidic solutions, while red litmus stays red.',
  base: 'Red litmus turns blue only in basic (alkaline) solutions, while blue litmus stays blue.',
  neutral: 'In a neutral solution neither red nor blue litmus changes colour.',
}

const article = (n: Nature) => (n === 'acid' ? 'an acid' : n === 'base' ? 'a base' : 'neutral')

export function KnownSamplesMode({ onExplain }: { onExplain: (sample: Sample) => void }) {
  const { state, answer } = useSession()
  const [selectedId, setSelectedId] = useState(SAMPLES[0].id)
  const [rinse, setRinse] = useState(0)
  const [tests, setTests] = useState<BenchTests>({})
  const [nature, setNature] = useState<Nature | null>(null)
  const [ph, setPh] = useState<number | null>(null)
  const [fresh, setFresh] = useState<string | null>(null)

  const sample = SAMPLE_BY_ID[selectedId]
  const litmusId = `litmus:${sample.id}`
  const phId = `ph:${sample.id}`
  const litmusRecord = state.answered[litmusId]
  const phRecord = state.answered[phId]
  const litmusTested = !!(tests.red || tests.blue)

  const select = (id: string) => {
    if (id === selectedId) return
    sfx.select()
    setSelectedId(id)
    setTests({})
    setNature(null)
    setPh(null)
    setFresh(null)
  }

  const submitNature = () => {
    if (!nature) return
    answer(litmusId, { category: 'litmus', results: [scoreNature(nature, sample.nature)], given: { nature } })
    setFresh(litmusId)
  }

  const submitPh = () => {
    if (ph === null) return
    answer(phId, { category: 'ph', results: [scorePh(ph, sample.phRange)], given: { ph } })
    setFresh(phId)
  }

  const evidence = observationsFor(tests, sample)
    .filter((o) => o.key === 'red' || o.key === 'blue')
    .map((o) => o.text)

  return (
    <div className="mode">
      <SampleShelf
        title="Sample shelf — choose a substance"
        selectedId={selectedId}
        onSelect={select}
        items={SAMPLES.map((s) => {
          const done = [state.answered[`litmus:${s.id}`], state.answered[`ph:${s.id}`]].filter(Boolean).length
          return {
            id: s.id,
            label: s.name,
            progress: done as 0 | 1 | 2,
            art: <Bottle color={s.liquidColor} opacity={Math.max(0.45, s.liquidOpacity)} />,
          }
        })}
      />

      <div className="mode-grid">
        <section className="glass mode-bench">
          <Workbench
            sample={sample}
            label={sample.name}
            pourKey={`${sample.id}-${rinse}`}
            tests={tests}
            onTestComplete={(patch) => setTests((t) => ({ ...t, ...patch }))}
            onRinse={() => {
              setRinse((r) => r + 1)
              setTests({})
            }}
          />
        </section>

        <aside className="mode-side">
          <div className="glass panel sample-info">
            <p className="eyebrow">Selected sample</p>
            <h3>{sample.name}</h3>
            <p className="muted">{sample.description}</p>
            <ObservationLog tests={tests} sample={sample} />
          </div>

          <div className="glass panel challenge">
            <div className="challenge-head">
              <span className="challenge-num">1</span>
              <div>
                <h4>Litmus challenge</h4>
                <p className="muted">Is {sample.name.toLowerCase()} an acid, a base or neutral?</p>
              </div>
              <span className="challenge-worth">{POINTS.nature} pts</span>
            </div>

            {litmusRecord ? (
              <FeedbackCard
                outcome={litmusRecord.results[0].outcome}
                points={litmusRecord.points}
                fresh={fresh === litmusId}
                title={
                  litmusRecord.results[0].outcome === 'correct'
                    ? `Correct — it's ${article(sample.nature)}!`
                    : `Not quite — it's ${article(sample.nature)}`
                }
              >
                {litmusRecord.results[0].outcome !== 'correct' && (
                  <p>
                    You chose <strong>{natureLabel(litmusRecord.given.nature as Nature)}</strong>. Scientists learn from
                    every result — here's how to read the strips:
                  </p>
                )}
                <p>{LITMUS_REASON[sample.nature]}</p>
                <p>{sample.science}</p>
              </FeedbackCard>
            ) : !litmusTested ? (
              <p className="challenge-locked">
                <Lock size={14} /> Dip a red or blue litmus strip into the beaker to collect evidence.
              </p>
            ) : (
              <>
                {evidence.length === 1 && (
                  <p className="challenge-tip">
                    Tip: one strip can be ambiguous — testing the other colour gives stronger evidence.
                  </p>
                )}
                <NaturePicker value={nature} onChange={setNature} />
                <button className="btn btn-primary" disabled={!nature} onClick={submitNature}>
                  Submit prediction
                </button>
                <LitmusGuide />
              </>
            )}
          </div>
        </aside>
      </div>

      <section className="glass panel ph-panel">
        <div className="challenge-head">
          <span className="challenge-num">2</span>
          <div>
            <h4>pH challenge</h4>
            <p className="muted">
              {phRecord
                ? 'Result recorded — compare your estimate with the actual value.'
                : tests.indicator
                  ? `The solution turned ${phColorName(sample.ph)}. Drag the marker to the colour that matches best.`
                  : 'Add universal indicator to the beaker, then estimate the pH from its colour.'}
            </p>
          </div>
          <span className="challenge-worth">{POINTS.ph} pts</span>
        </div>

        <PhScale
          value={phRecord ? Number(phRecord.given.ph) : ph}
          onChange={phRecord || !tests.indicator ? undefined : setPh}
          actual={phRecord ? sample.phRange : null}
          observedColor={tests.indicator || phRecord ? phColor(sample.ph) : null}
        />

        {phRecord ? (
          <FeedbackCard
            outcome={phRecord.results[0].outcome}
            points={phRecord.points}
            fresh={fresh === phId}
            title={
              phRecord.results[0].outcome === 'correct'
                ? `Great estimate! pH ${formatPhRange(sample.phRange)}`
                : phRecord.results[0].outcome === 'close'
                  ? `Close! The actual pH is ${formatPhRange(sample.phRange)}`
                  : `The actual pH is ${formatPhRange(sample.phRange)}`
            }
          >
            <p>
              You estimated <strong>pH {String(phRecord.given.ph)}</strong>. {sample.name} gives a{' '}
              <strong>{phColorName(sample.ph)}</strong> colour with universal indicator, which matches pH{' '}
              {formatPhRange(sample.phRange).replace('≈ ', '')} — {sample.ph < 7 ? 'acidic' : sample.ph > 7 ? 'basic' : 'neutral'}.
            </p>
            <p className="fine">
              Real indicator colours vary a little with concentration and brand, so estimates within 1 pH unit count as
              correct and within 2 earn partial points.
            </p>
            <div>
              <button className="btn btn-sm" onClick={() => onExplain(sample)}>
                <Atom size={15} /> Why this colour? See the molecules
              </button>
            </div>
          </FeedbackCard>
        ) : (
          <div className="ph-actions">
            {!tests.indicator ? (
              <p className="challenge-locked">
                <Lock size={14} /> Use the universal indicator tool first.
              </p>
            ) : (
              <p className="muted">
                {ph === null ? 'Click or drag on the scale to place your marker.' : `Your estimate: pH ${ph}`}
              </p>
            )}
            <button className="btn btn-primary" disabled={ph === null || !tests.indicator} onClick={submitPh}>
              Submit pH estimate
            </button>
          </div>
        )}
      </section>
    </div>
  )
}

function LitmusGuide() {
  return (
    <details className="guide">
      <summary>Need a reminder? Litmus guide</summary>
      <table>
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
    </details>
  )
}

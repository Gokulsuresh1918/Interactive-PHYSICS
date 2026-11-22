import { useCallback, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, CheckCircle2, Eye, Flag, RotateCcw, Sparkles, Target } from 'lucide-react'
import { POINTS } from '../lib/scoring'
import type { QuestionResult } from '../lib/scoring'
import { sfx } from '../lib/sound'
import { useSession } from '../state/session'
import { FeedbackCard } from '../components/lab/FeedbackCard'
import { Stepper } from '../components/flow/Stepper'
import { ChoiceCards } from './ChoiceCards'
import { TOPICS, TOPIC_BY_ID, activityDone } from './registry'
import { challengeKey, questionKey } from './types'
import type { ChallengeResult, SimMap, TopicContent, TopicId } from './types'
import './topic.css'

type Phase = 'intro' | 'explore' | 'question' | 'feedback' | 'summary'

interface TopicFlowProps {
  content: TopicContent
  sims: SimMap
  onNavigate: (topic: TopicId) => void
  onFinish: () => void
}

/**
 * Shared guided flow for every physics topic:
 * intro → (explore the simulation → one question per screen → feedback) × activities → summary.
 * Each topic supplies its own simulations, so the experiments stay unique.
 */
export function TopicFlow({ content, sims, onNavigate, onFinish }: TopicFlowProps) {
  const { state, answer } = useSession()
  const meta = TOPIC_BY_ID[content.id]
  const firstOpen = content.activities.findIndex((_, i) => !activityDone(content, i, state.answered))
  const [phase, setPhase] = useState<Phase>('intro')
  const [ai, setAi] = useState(Math.max(0, firstOpen))
  const [qi, setQi] = useState(0)
  const [choice, setChoice] = useState<string | null>(null)
  const [ready, setReady] = useState(false)
  const [status, setStatus] = useState<string | undefined>()
  const [feedback, setFeedback] = useState<'challenge' | 'question'>('question')
  const [fresh, setFresh] = useState<string | null>(null)
  const [run, setRun] = useState(0)

  const activity = content.activities[ai]
  const question = activity.questions[qi]
  const qKey = question ? questionKey(content.id, activity.id, question.id) : ''
  const cKey = challengeKey(content.id, activity.id)
  const Sim = sims[activity.id]

  const go = (p: Phase) => {
    setPhase(p)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const openActivity = (i: number) => {
    setAi(i)
    setQi(0)
    setChoice(null)
    setReady(false)
    setStatus(undefined)
    setRun((r) => r + 1)
    go('explore')
  }

  const onReady = useCallback((r: boolean, s?: string) => {
    setReady(r)
    setStatus(s)
  }, [])

  const onChallenge = useCallback(
    (r: ChallengeResult) => {
      if (state.answered[cKey]) return
      const result: QuestionResult = { kind: 'question', outcome: r.correct ? 'correct' : 'wrong', points: r.correct ? POINTS.ph : 0 }
      answer(cKey, { category: content.id, results: [result], given: { answer: r.given, explain: r.explain } })
      setFresh(cKey)
      setFeedback('challenge')
      go('feedback')
    },
    [answer, cKey, content.id, state.answered],
  )

  const startQuestions = () => {
    sfx.click()
    setQi(0)
    setChoice(null)
    const k = questionKey(content.id, activity.id, activity.questions[0].id)
    setFeedback('question')
    go(state.answered[k] ? 'feedback' : 'question')
  }

  const submit = () => {
    if (!choice || !question) return
    const correct = choice === question.answer
    const result: QuestionResult = { kind: 'question', outcome: correct ? 'correct' : 'wrong', points: correct ? POINTS.nature : 0 }
    answer(qKey, { category: content.id, results: [result], given: { choice } })
    setFresh(qKey)
    setFeedback('question')
    go('feedback')
  }

  const next = () => {
    sfx.click()
    if (feedback === 'challenge') return startQuestions()
    if (qi < activity.questions.length - 1) {
      const nq = qi + 1
      setQi(nq)
      setChoice(null)
      const k = questionKey(content.id, activity.id, activity.questions[nq].id)
      go(state.answered[k] ? 'feedback' : 'question')
      return
    }
    if (ai < content.activities.length - 1) openActivity(ai + 1)
    else go('summary')
  }

  const topicPoints = useMemo(
    () =>
      Object.entries(state.answered)
        .filter(([k]) => k.startsWith(`${content.id}:`))
        .reduce((n, [, r]) => n + r.points, 0),
    [state.answered, content.id],
  )
  const maxPoints = content.activities.reduce((n, a) => n + (a.questions.length + (a.challenge ? 1 : 0)) * POINTS.nature, 0)
  const doneCount = content.activities.filter((_, i) => activityDone(content, i, state.answered)).length

  const nextTopic = (() => {
    const order = TOPICS.map((t) => t.id)
    const i = order.indexOf(content.id)
    return TOPIC_BY_ID[order[(i + 1) % order.length]]
  })()

  const steps = [...content.activities.map((a) => a.title), 'Summary']
  const stepIndex = phase === 'intro' ? -1 : phase === 'summary' ? steps.length - 1 : ai
  const record = feedback === 'challenge' ? state.answered[cKey] : state.answered[qKey]

  return (
    <div className="flow topic" style={{ ['--topic' as string]: meta.color, ['--topic-soft' as string]: meta.soft }}>
      {phase !== 'intro' && (
        <Stepper
          steps={steps}
          current={stepIndex}
          done={[...content.activities.map((_, i) => activityDone(content, i, state.answered)), false]}
        />
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={`${phase}-${ai}-${qi}`}
          className="flow-screen"
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        >
          {phase === 'intro' && (
            <section className="topic-intro">
              <div className="topic-intro-copy">
                <p className="eyebrow topic-eyebrow">Science Playground · {meta.short}</p>
                <h1>{content.title}</h1>
                <p className="topic-tagline">{content.tagline}</p>
                <div className="topic-intro-actions">
                  <button className="btn btn-primary btn-lg btn-shimmer topic-cta" onClick={() => openActivity(Math.max(0, firstOpen))}>
                    {firstOpen === -1 ? 'Explore again' : firstOpen > 0 ? 'Continue experimenting' : 'Start experimenting'}
                    <ArrowRight size={18} />
                  </button>
                  {doneCount > 0 && (
                    <span className="topic-progress-pill">
                      <CheckCircle2 size={15} /> {doneCount}/{content.activities.length} activities done
                    </span>
                  )}
                </div>
              </div>
              <ol className="topic-activities">
                {content.activities.map((a, i) => {
                  const Icon = a.icon
                  const done = activityDone(content, i, state.answered)
                  return (
                    <motion.li
                      key={a.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + i * 0.08 }}
                    >
                      <button className={`topic-activity${done ? ' is-done' : ''}`} onClick={() => openActivity(i)}>
                        <span className="topic-activity-icon">
                          <Icon size={22} />
                        </span>
                        <span className="topic-activity-text">
                          <small>Activity {i + 1}</small>
                          <strong>{a.title}</strong>
                        </span>
                        {done ? <CheckCircle2 className="topic-activity-done" size={20} /> : <ArrowRight size={18} />}
                      </button>
                    </motion.li>
                  )
                })}
              </ol>
            </section>
          )}

          {phase === 'explore' && (
            <div className="observe">
              <section className="card observe-bench topic-sim">
                <Sim
                  key={run}
                  onReady={onReady}
                  onChallenge={activity.challenge ? onChallenge : undefined}
                  challengeDone={!!state.answered[cKey]}
                />
              </section>
              <aside className="card observe-side">
                <p className="eyebrow topic-eyebrow">
                  Activity {ai + 1} of {content.activities.length}
                </p>
                <h3>{activity.title}</h3>
                <p className="topic-instruction">
                  <Target size={16} /> {activity.instruction}
                </p>
                {status && <p className="topic-status">{status}</p>}
                {activity.challenge && (
                  <p className={`topic-challenge${state.answered[cKey]?.results[0].outcome === 'correct' ? ' is-done' : ''}`}>
                    <Sparkles size={15} />
                    {!state.answered[cKey]
                      ? activity.challenge.prompt
                      : state.answered[cKey].results[0].outcome === 'correct'
                        ? 'Challenge completed!'
                        : 'Challenge attempted — keep exploring to see how it works.'}
                  </p>
                )}
                <AnimatePresence>
                  {(ready || state.answered[cKey]) && (
                    <motion.p
                      className="topic-notice"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <Eye size={15} /> {activity.notice}
                    </motion.p>
                  )}
                </AnimatePresence>
                <div className="side-actions">
                  <button className="btn btn-ghost" onClick={() => go('intro')}>
                    <ArrowLeft size={16} /> Overview
                  </button>
                  {activity.challenge && !state.answered[cKey] ? (
                    <span className="fine">Complete the challenge in the experiment.</span>
                  ) : (
                    <button className="btn btn-primary btn-lg" disabled={!ready && !state.answered[cKey]} onClick={startQuestions}>
                      Continue <ArrowRight size={17} />
                    </button>
                  )}
                </div>
              </aside>
            </div>
          )}

          {phase === 'question' && question && (
            <section className="card qa-question topic-question">
              <p className="eyebrow topic-eyebrow">
                {activity.title} · Question {qi + 1} of {activity.questions.length} · {POINTS.nature} points
              </p>
              <h2>{question.prompt}</h2>
              <ChoiceCards options={question.options} value={choice} onChange={setChoice} />
              <div className="qa-actions">
                <button className="btn btn-ghost" onClick={() => go('explore')}>
                  <ArrowLeft size={16} /> Back to the experiment
                </button>
                <button className="btn btn-primary btn-lg" disabled={!choice} onClick={submit}>
                  Submit answer
                </button>
              </div>
            </section>
          )}

          {phase === 'feedback' && record && (
            <div className="result">
              <section className="card result-main">
                {feedback === 'challenge' ? (
                  <FeedbackCard
                    outcome={record.results[0].outcome}
                    points={record.points}
                    fresh={fresh === cKey}
                    title={record.results[0].outcome === 'correct' ? 'Challenge complete!' : 'Close — but not quite'}
                  >
                    <p>{String(record.given.explain)}</p>
                  </FeedbackCard>
                ) : (
                  <FeedbackCard
                    outcome={record.results[0].outcome}
                    points={record.points}
                    fresh={fresh === qKey}
                    title={record.results[0].outcome === 'correct' ? 'Correct!' : 'Not quite — keep experimenting!'}
                  >
                    {record.results[0].outcome !== 'correct' && (
                      <p>
                        The answer is <strong>{question.options.find((o) => o.id === question.answer)?.label}</strong>.
                      </p>
                    )}
                    <p>{question.explain}</p>
                  </FeedbackCard>
                )}
              </section>
              <aside className="card result-next">
                <p className="eyebrow topic-eyebrow">What next?</p>
                <button className="btn btn-primary btn-lg" onClick={next}>
                  {feedback === 'challenge'
                    ? 'Next: quick question'
                    : qi < activity.questions.length - 1
                      ? 'Next question'
                      : ai < content.activities.length - 1
                        ? `Next: ${content.activities[ai + 1].title}`
                        : 'See topic summary'}
                  <ArrowRight size={17} />
                </button>
                <button className="btn" onClick={() => go('explore')}>
                  <RotateCcw size={15} /> Back to the experiment
                </button>
              </aside>
            </div>
          )}

          {phase === 'summary' && (
            <section className="card topic-summary">
              <span className="topic-summary-icon">
                <meta.icon size={34} />
              </span>
              <p className="eyebrow topic-eyebrow">Topic complete</p>
              <h2>{content.title}</h2>
              <div className="topic-summary-stats">
                <div>
                  <strong>
                    {topicPoints}
                    <small>/{maxPoints}</small>
                  </strong>
                  <span>points earned</span>
                </div>
                <div>
                  <strong>
                    {doneCount}
                    <small>/{content.activities.length}</small>
                  </strong>
                  <span>activities done</span>
                </div>
              </div>
              <div className="topic-summary-actions">
                <button className="btn btn-primary btn-lg" onClick={() => onNavigate(nextTopic.id)}>
                  Next: {nextTopic.title} <ArrowRight size={17} />
                </button>
                <button className="btn" onClick={() => go('intro')}>
                  <RotateCcw size={15} /> Explore this topic again
                </button>
                <button className="btn btn-ghost" onClick={onFinish}>
                  <Flag size={15} /> See my results
                </button>
              </div>
            </section>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

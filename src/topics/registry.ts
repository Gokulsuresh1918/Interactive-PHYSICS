import { lazy } from 'react'
import type { ComponentType, LazyExoticComponent } from 'react'
import { Activity, AudioWaveform, FlaskConical, Orbit, Sun, Zap } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { TOTAL_EXPERIMENTS, countCompleted } from '../state/session'
import type { AnswerRecord } from '../state/session'
import { challengeKey, questionKey } from './types'
import type { TopicContent, TopicId } from './types'
import { OPTICS } from './optics/content'
import { CIRCUITS } from './circuits/content'
import { MOTION } from './motion/content'
import { GRAVITY } from './gravity/content'
import { SOUND } from './sound/content'

export interface TopicMeta {
  id: TopicId
  title: string
  short: string
  icon: LucideIcon
  /** Topic accent colour + soft tint. */
  color: string
  soft: string
  total: number
  countDone: (answered: Record<string, AnswerRecord>) => number
  /** Score categories this topic writes (for the results breakdown). */
  categories: Record<string, string>
  page?: LazyExoticComponent<ComponentType>
}

export function activityDone(content: TopicContent, activityIndex: number, answered: Record<string, AnswerRecord>) {
  const a = content.activities[activityIndex]
  const keys = a.questions.map((q) => questionKey(content.id, a.id, q.id))
  if (a.challenge) keys.push(challengeKey(content.id, a.id))
  return keys.every((k) => answered[k])
}

function physics(
  content: TopicContent,
  icon: LucideIcon,
  color: string,
  soft: string,
  short: string,
  label: string,
  page: () => Promise<{ default: ComponentType }>,
): TopicMeta {
  return {
    id: content.id,
    title: content.title,
    short,
    icon,
    color,
    soft,
    total: content.activities.length,
    countDone: (answered) => content.activities.filter((_, i) => activityDone(content, i, answered)).length,
    categories: { [content.id]: label },
    page: lazy(page),
  }
}

export const TOPICS: TopicMeta[] = [
  {
    id: 'acids',
    title: 'Acids, Bases & pH',
    short: 'Acids & Bases',
    icon: FlaskConical,
    color: '#12b3a2',
    soft: '#e2f7f4',
    total: TOTAL_EXPERIMENTS,
    countDone: countCompleted,
    categories: { litmus: 'Litmus reading', ph: 'pH estimation', mystery: 'Mystery solving' },
  },
  physics(OPTICS, Sun, '#f08c00', '#fff4e0', 'Light', 'Light & optics', () => import('./optics/OpticsTopic')),
  physics(CIRCUITS, Zap, '#5b5bd6', '#eeeeff', 'Circuits', 'Electric circuits', () => import('./circuits/CircuitsTopic')),
  physics(MOTION, Activity, '#e8590c', '#fff0e6', 'Motion', "Newton's laws", () => import('./motion/MotionTopic')),
  physics(GRAVITY, Orbit, '#7c4dff', '#f1ebff', 'Gravity', 'Gravitation', () => import('./gravity/GravityTopic')),
  physics(SOUND, AudioWaveform, '#e64980', '#ffeef5', 'Sound', 'Sound waves', () => import('./sound/SoundTopic')),
]

export const TOPIC_BY_ID = Object.fromEntries(TOPICS.map((t) => [t.id, t])) as Record<TopicId, TopicMeta>

export const ALL_CATEGORIES: Record<string, string> = Object.assign({}, ...TOPICS.map((t) => t.categories))

export const TOTAL_ACTIVITIES = TOPICS.reduce((n, t) => n + t.total, 0)

export function countAllDone(answered: Record<string, AnswerRecord>) {
  return TOPICS.reduce((n, t) => n + t.countDone(answered), 0)
}

export function isTopicId(v: string): v is TopicId {
  return v in TOPIC_BY_ID
}

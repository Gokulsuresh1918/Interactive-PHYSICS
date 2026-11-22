import type { ComponentType, ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'

export type TopicId = 'acids' | 'optics' | 'circuits' | 'motion' | 'gravity' | 'sound'

export interface ChoiceOption {
  id: string
  label: string
  sub?: string
  /** Optional small illustration shown on the answer card. */
  art?: ReactNode
}

export interface TopicQuestion {
  id: string
  prompt: string
  options: ChoiceOption[]
  answer: string
  /** Short explanation shown after answering. */
  explain: string
}

export interface TopicActivity {
  id: string
  title: string
  icon: LucideIcon
  /** One simple instruction for the explore step. */
  instruction: string
  /** What the student should notice (shown once ready). */
  notice: string
  questions: TopicQuestion[]
  /** Optional hands-on challenge scored by the simulation itself. */
  challenge?: { prompt: string }
}

export interface ChallengeResult {
  correct: boolean
  given: string
  explain: string
}

export interface SimProps {
  /** Report whether the student has explored enough to continue. */
  onReady: (ready: boolean, status?: string) => void
  /** Challenge activities: the simulation submits the result. */
  onChallenge?: (r: ChallengeResult) => void
  /** True once the challenge has been scored (sim can stay explorable). */
  challengeDone?: boolean
}

export interface TopicContent {
  id: Exclude<TopicId, 'acids'>
  title: string
  tagline: string
  activities: TopicActivity[]
}

export type SimMap = Record<string, ComponentType<SimProps>>

export const questionKey = (topic: string, activity: string, q: string) => `${topic}:${activity}:${q}`
export const challengeKey = (topic: string, activity: string) => `${topic}:${activity}:challenge`

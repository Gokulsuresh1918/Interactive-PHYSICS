import { createContext, useContext } from 'react'
import type { TopicId } from './types'

interface TopicNav {
  onNavigate: (topic: TopicId) => void
  onFinish: () => void
}

/** Lets lazily loaded topic pages navigate without prop drilling through Suspense. */
export const TopicNavContext = createContext<TopicNav>({ onNavigate: () => {}, onFinish: () => {} })

export function useTopicNav() {
  return useContext(TopicNavContext)
}

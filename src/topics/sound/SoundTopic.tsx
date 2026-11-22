import { TopicFlow } from '../TopicFlow'
import { useTopicNav } from '../nav'
import { SOUND } from './content'
import { LoudnessSim, MatchSim, PitchSim } from './SoundSims'

export default function SoundTopic() {
  const nav = useTopicNav()
  return <TopicFlow content={SOUND} sims={{ pitch: PitchSim, loudness: LoudnessSim, match: MatchSim }} {...nav} />
}

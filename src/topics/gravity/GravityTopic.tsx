import { TopicFlow } from '../TopicFlow'
import { useTopicNav } from '../nav'
import { GRAVITY } from './content'
import { DistanceSim, MassSim, PullSim } from './GravitySims'

export default function GravityTopic() {
  const nav = useTopicNav()
  return <TopicFlow content={GRAVITY} sims={{ mass: MassSim, distance: DistanceSim, pull: PullSim }} {...nav} />
}

import { TopicFlow } from '../TopicFlow'
import { useTopicNav } from '../nav'
import { CIRCUITS } from './content'
import { LightBulbSim, MaterialsSim, SwitchSim } from './CircuitSims'

export default function CircuitsTopic() {
  const nav = useTopicNav()
  return <TopicFlow content={CIRCUITS} sims={{ light: LightBulbSim, switch: SwitchSim, materials: MaterialsSim }} {...nav} />
}

import { TopicFlow } from '../TopicFlow'
import { useTopicNav } from '../nav'
import { OPTICS } from './content'
import { ReflectionSim, RefractionSim, TirSim } from './OpticsSims'

export default function OpticsTopic() {
  const nav = useTopicNav()
  return <TopicFlow content={OPTICS} sims={{ reflect: ReflectionSim, refract: RefractionSim, tir: TirSim }} {...nav} />
}

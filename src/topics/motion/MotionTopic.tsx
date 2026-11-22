import { TopicFlow } from '../TopicFlow'
import { useTopicNav } from '../nav'
import { MOTION } from './content'
import { FirstLawSim, SecondLawSim, ThirdLawSim } from './MotionSims'

export default function MotionTopic() {
  const nav = useTopicNav()
  return <TopicFlow content={MOTION} sims={{ second: SecondLawSim, first: FirstLawSim, third: ThirdLawSim }} {...nav} />
}

import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

/** Shows where the student is in the current experiment. */
export function Stepper({ steps, current, done }: { steps: string[]; current: number; done?: boolean[] }) {
  return (
    <ol className="stepper" aria-label="Experiment progress">
      {steps.map((label, i) => {
        // With explicit completion flags (topics), show real progress; otherwise it's a linear flow.
        const state = i === current ? 'current' : (done ? done[i] : i < current) ? 'done' : 'todo'
        return (
          <li key={label} className={`stepper-item is-${state}`} aria-current={state === 'current' ? 'step' : undefined}>
            <span className="stepper-dot">
              {state === 'done' ? <Check size={13} strokeWidth={3} /> : i + 1}
              {state === 'current' && (
                <motion.span layoutId="stepper-ring" className="stepper-ring" transition={{ type: 'spring', stiffness: 380, damping: 30 }} />
              )}
            </span>
            <span className="stepper-label">{label}</span>
            {i < steps.length - 1 && <span className="stepper-line" />}
          </li>
        )
      })}
    </ol>
  )
}

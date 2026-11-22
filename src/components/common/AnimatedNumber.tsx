import { useEffect, useRef, useState } from 'react'
import { animate, useReducedMotion } from 'framer-motion'

/** Counts smoothly from the currently shown value to the new one. */
export function AnimatedNumber({ value, duration = 0.9 }: { value: number; duration?: number }) {
  const [shown, setShown] = useState(value)
  const current = useRef(value)
  const reduce = useReducedMotion()

  useEffect(() => {
    if (reduce) {
      current.current = value
      setShown(value)
      return
    }
    const controls = animate(current.current, value, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => {
        current.current = v
        setShown(Math.round(v))
      },
    })
    return () => controls.stop()
  }, [value, duration, reduce])

  return <>{shown}</>
}

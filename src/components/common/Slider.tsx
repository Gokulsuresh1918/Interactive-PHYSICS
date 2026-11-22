import { useId } from 'react'
import './slider.css'

interface SliderProps {
  label: string
  value: number
  min: number
  max: number
  step?: number
  unit?: string
  format?: (v: number) => string
  onChange: (v: number) => void
  color?: string
}

/** Styled native range input — accessible and keyboard friendly. */
export function Slider({ label, value, min, max, step = 1, unit = '', format, onChange, color }: SliderProps) {
  const id = useId()
  const pct = ((value - min) / (max - min)) * 100
  return (
    <div className="slider" style={{ ['--slider' as string]: color ?? 'var(--sky)', ['--pct' as string]: `${pct}%` }}>
      <div className="slider-head">
        <label htmlFor={id}>{label}</label>
        <output htmlFor={id}>{format ? format(value) : `${value}${unit}`}</output>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  )
}

import { createRef, useEffect, useMemo, useRef, useState } from 'react'
import type { RefObject } from 'react'
import { motion } from 'framer-motion'
import { Check, Hand, X } from 'lucide-react'
import { sfx } from '../../lib/sound'
import type { SimProps } from '../types'
import { CircuitBoard, Part } from './CircuitBoard'
import { MATERIALS, SLOTS, analyse, isMaterial } from './circuit'
import type { MaterialId, PartId, SlotId, Slots } from './circuit'
import './circuits.css'

const PART_NAMES: Record<string, string> = { battery: 'Battery', bulb: 'Bulb', switch: 'Switch', wire: 'Wire' }
const partName = (p: PartId) => (isMaterial(p) ? MATERIALS[p].name : PART_NAMES[p])

interface LabProps {
  initial: Slots
  locked: SlotId[]
  palette: PartId[]
  /** Slots a palette part may go into (default: any unlocked). */
  testSlot?: SlotId
  onChange: (slots: Slots, switchClosed: boolean, placed: PartId | null) => void
  footer?: React.ReactNode
}

/** Interactive workbench: click a part then a gap, or drag the part onto a gap. */
function CircuitLab({ initial, locked, palette, testSlot, onChange, footer }: LabProps) {
  const [slots, setSlots] = useState<Slots>(initial)
  const [switchClosed, setSwitchClosed] = useState(false)
  const [selected, setSelected] = useState<PartId | null>(null)
  const [hover, setHover] = useState<SlotId | null>(null)
  const slotRefs = useMemo(
    () => Object.fromEntries(SLOTS.map((s) => [s, createRef<SVGRectElement>()])) as Record<SlotId, RefObject<SVGRectElement | null>>,
    [],
  )
  const dragged = useRef(false)
  const state = analyse(slots, switchClosed)
  const lastPlaced = useRef<PartId | null>(null)

  useEffect(() => {
    onChange(slots, switchClosed, lastPlaced.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slots, switchClosed])

  const prevOn = useRef(false)
  useEffect(() => {
    if (state.current && !prevOn.current && !state.short) sfx.reaction()
    if (state.short && !prevOn.current) sfx.buzz(1)
    prevOn.current = state.current
  }, [state.current, state.short])

  const canPlace = (slot: SlotId) => !locked.includes(slot) && (!testSlot || slot === testSlot)

  const place = (slot: SlotId, part: PartId) => {
    if (!canPlace(slot)) return
    sfx.select()
    lastPlaced.current = part
    setSlots((s) => ({ ...s, [slot]: part }))
    if (part === 'switch') setSwitchClosed(false)
    setSelected(null)
  }

  const onSlot = (slot: SlotId) => {
    const current = slots[slot]
    if (current === 'switch') {
      sfx.click()
      setSwitchClosed((c) => !c)
      return
    }
    if (selected) return place(slot, selected)
    if (current && !locked.includes(slot)) remove(slot)
  }

  const remove = (slot: SlotId) => {
    sfx.click()
    lastPlaced.current = null
    setSlots((s) => ({ ...s, [slot]: null }))
  }

  const slotAt = (x: number, y: number) =>
    SLOTS.find((s) => {
      const r = slotRefs[s].current?.getBoundingClientRect()
      return r && x >= r.left && x <= r.right && y >= r.top && y <= r.bottom && canPlace(s)
    }) ?? null

  return (
    <div className="sim">
      <div className="sim-stage circuit-stage">
        <CircuitBoard
          slots={slots}
          state={state}
          switchClosed={switchClosed}
          locked={locked}
          armed={!!selected}
          hover={hover}
          onSlot={onSlot}
          onRemove={remove}
          slotRefs={slotRefs}
        />
        <span className="sim-hint">
          <Hand size={13} /> {selected ? `Now click a gap to place the ${partName(selected).toLowerCase()}` : 'Pick a part, then click a gap (or drag it)'}
        </span>
      </div>
      <div className="parts-tray" role="listbox" aria-label="Circuit parts">
        {palette.map((p) => (
          <motion.button
            key={p}
            type="button"
            role="option"
            aria-selected={selected === p}
            className={`part-card${selected === p ? ' is-selected' : ''}`}
            drag
            dragSnapToOrigin
            dragMomentum={false}
            whileDrag={{ scale: 1.08, zIndex: 30 }}
            whileHover={{ y: -3 }}
            onDragStart={() => {
              dragged.current = true
              setSelected(p)
            }}
            onDrag={(e) => {
              const pe = e as PointerEvent
              setHover(slotAt(pe.clientX, pe.clientY))
            }}
            onDragEnd={(e) => {
              const pe = e as PointerEvent
              const s = slotAt(pe.clientX, pe.clientY)
              setHover(null)
              if (s) place(s, p)
              setTimeout(() => (dragged.current = false), 0)
            }}
            onClick={() => {
              if (dragged.current) return
              sfx.click()
              setSelected((cur) => (cur === p ? null : p))
            }}
          >
            <svg viewBox="-80 -50 160 100" className="part-card-art" aria-hidden="true">
              <Part id={p} switchClosed brightness={0} labels={false} />
            </svg>
            <span>{partName(p)}</span>
          </motion.button>
        ))}
      </div>
      {footer}
    </div>
  )
}

/* ---------------- Activity 1: light the bulb ---------------- */

export function LightBulbSim({ onReady }: SimProps) {
  return (
    <CircuitLab
      initial={{ left: null, top: null, right: null, bottom: null }}
      locked={[]}
      palette={['battery', 'bulb', 'wire']}
      onChange={(slots, closed) => {
        const s = analyse(slots, closed)
        onReady(s.current && !s.short, s.message)
      }}
    />
  )
}

/* ---------------- Activity 2: switch ---------------- */

export function SwitchSim({ onReady }: SimProps) {
  const seen = useRef({ on: false, off: false })
  return (
    <CircuitLab
      initial={{ left: 'battery', top: 'bulb', right: null, bottom: 'wire' }}
      locked={['left', 'top', 'bottom']}
      palette={['switch', 'wire']}
      onChange={(slots, closed) => {
        const hasSwitch = SLOTS.some((s) => slots[s] === 'switch')
        const s = analyse(slots, closed)
        if (hasSwitch) {
          if (s.current) seen.current.on = true
          else seen.current.off = true
        }
        const done = seen.current.on && seen.current.off
        onReady(
          done,
          !hasSwitch
            ? 'Place the switch in the empty gap.'
            : done
              ? `Switch ${closed ? 'closed — bulb on' : 'open — bulb off'}.`
              : `Switch ${closed ? 'closed' : 'open'} — now click it to ${closed ? 'open' : 'close'} it.`,
        )
      }}
    />
  )
}

/* ---------------- Activity 3: conductors & insulators ---------------- */

const TEST_MATERIALS: MaterialId[] = ['copper', 'plastic', 'nail', 'rubber', 'foil', 'wood', 'graphite', 'glass']

export function MaterialsSim({ onReady }: SimProps) {
  const [tested, setTested] = useState<MaterialId[]>([])

  useEffect(() => {
    const conductors = tested.filter((m) => MATERIALS[m].conductor).length
    const ready = tested.length >= 4 && conductors > 0 && conductors < tested.length
    onReady(ready, `Materials tested: ${Math.min(tested.length, 4)}/4${tested.length >= 4 && !ready ? ' — try both kinds!' : ''}`)
  }, [tested, onReady])

  return (
    <CircuitLab
      initial={{ left: 'battery', top: 'bulb', right: 'wire', bottom: null }}
      locked={['left', 'top', 'right']}
      testSlot="bottom"
      palette={TEST_MATERIALS}
      onChange={(slots, _closed, placed) => {
        const m = slots.bottom
        if (m && isMaterial(m) && placed === m) setTested((t) => (t.includes(m) ? t : [...t, m]))
      }}
      footer={
        <div className="material-results" aria-live="polite">
          <p className="control-label">Test results</p>
          {tested.length === 0 ? (
            <p className="fine">Drop a material into the test gap at the bottom.</p>
          ) : (
            <div className="chip-row">
              {tested.map((m) => (
                <motion.span
                  key={m}
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className={`result-chip${MATERIALS[m].conductor ? ' is-yes' : ' is-no'}`}
                >
                  {MATERIALS[m].conductor ? <Check size={14} /> : <X size={14} />}
                  {MATERIALS[m].name} · {MATERIALS[m].conductor ? 'conductor' : 'insulator'}
                </motion.span>
              ))}
            </div>
          )}
        </div>
      }
    />
  )
}

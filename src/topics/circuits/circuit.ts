/** Circuit model for a single series loop with four slots. */

export type SlotId = 'left' | 'top' | 'right' | 'bottom'
export const SLOTS: SlotId[] = ['left', 'top', 'right', 'bottom']

export type PartId = 'battery' | 'bulb' | 'switch' | 'wire' | MaterialId
export type MaterialId = 'copper' | 'nail' | 'foil' | 'graphite' | 'plastic' | 'rubber' | 'wood' | 'glass'

export const MATERIALS: Record<MaterialId, { name: string; conductor: boolean; color: string; edge: string }> = {
  copper: { name: 'Copper wire', conductor: true, color: '#e08a4b', edge: '#b4622a' },
  nail: { name: 'Iron nail', conductor: true, color: '#9aa5b1', edge: '#6b7785' },
  foil: { name: 'Aluminium foil', conductor: true, color: '#d9e1ea', edge: '#9fb0c2' },
  graphite: { name: 'Pencil lead', conductor: true, color: '#4a4f57', edge: '#2c3036' },
  plastic: { name: 'Plastic ruler', conductor: false, color: '#7cc6ff', edge: '#3d97dd' },
  rubber: { name: 'Rubber band', conductor: false, color: '#f2a65a', edge: '#c97a2f' },
  wood: { name: 'Wooden stick', conductor: false, color: '#c99a63', edge: '#9a6d3a' },
  glass: { name: 'Glass rod', conductor: false, color: '#d8f3ff', edge: '#8cc8e2' },
}

export const isMaterial = (p: PartId): p is MaterialId => p in MATERIALS

export type Slots = Record<SlotId, PartId | null>

export interface CircuitState {
  closed: boolean
  current: boolean
  short: boolean
  brightness: number
  message: string
}

/** Series circuit: every slot must conduct for current to flow. */
export function analyse(slots: Slots, switchClosed: boolean): CircuitState {
  const parts = SLOTS.map((s) => slots[s])
  const batteries = parts.filter((p) => p === 'battery').length
  const bulbs = parts.filter((p) => p === 'bulb').length

  if (parts.some((p) => p === null)) {
    return { closed: false, current: false, short: false, brightness: 0, message: 'Open circuit — there is a gap.' }
  }
  if (parts.some((p) => p === 'switch') && !switchClosed) {
    return { closed: false, current: false, short: false, brightness: 0, message: 'Switch open — the loop is broken.' }
  }
  const blocker = parts.find((p) => p && isMaterial(p) && !MATERIALS[p].conductor)
  if (blocker) {
    return {
      closed: false,
      current: false,
      short: false,
      brightness: 0,
      message: `${MATERIALS[blocker as MaterialId].name}: insulator — no current.`,
    }
  }
  if (batteries === 0) {
    return { closed: true, current: false, short: false, brightness: 0, message: 'Closed loop, but no battery.' }
  }
  if (bulbs === 0) {
    return { closed: true, current: true, short: true, brightness: 0, message: 'Short circuit! No bulb — wires get hot.' }
  }
  // Series: more cells → brighter, more bulbs → dimmer.
  const brightness = Math.min(1, (batteries / bulbs) * 0.75)
  return {
    closed: true,
    current: true,
    short: false,
    brightness,
    message: brightness >= 0.75 ? 'Closed circuit — the bulb glows!' : 'Closed circuit — bulbs glow dimly.',
  }
}

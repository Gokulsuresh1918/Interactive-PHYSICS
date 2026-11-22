/**
 * Science topic registry. To add a topic later: add an entry here and
 * register its lab component in `App.tsx` (TOPIC_LABS).
 */
export interface Topic {
  id: string
  title: string
  tagline: string
  available: boolean
  /** Accent hue for the topic card. */
  hue: string
}

export const TOPICS: Topic[] = [
  {
    id: 'acids-bases',
    title: 'Acids, Bases & pH',
    tagline: 'Litmus, universal indicator, the pH scale and mystery samples.',
    available: true,
    hue: '#34e0c8',
  },
  {
    id: 'light',
    title: 'Reflection & Refraction',
    tagline: 'Bend and bounce light with mirrors, lenses and prisms.',
    available: false,
    hue: '#ffd166',
  },
  {
    id: 'circuits',
    title: 'Electricity & Circuits',
    tagline: 'Wire up cells, bulbs and switches.',
    available: false,
    hue: '#7aa7ff',
  },
  {
    id: 'newton',
    title: "Newton's Laws of Motion",
    tagline: 'Forces, mass and acceleration in action.',
    available: false,
    hue: '#ff8fab',
  },
  {
    id: 'gravity',
    title: 'Gravitation',
    tagline: 'Orbits, falling objects and weight.',
    available: false,
    hue: '#b79cff',
  },
  {
    id: 'sound',
    title: 'Sound Waves',
    tagline: 'Frequency, amplitude and echoes.',
    available: false,
    hue: '#5ee6a0',
  },
]

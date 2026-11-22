import { Lightbulb, Pencil, ToggleLeft } from 'lucide-react'
import type { TopicContent } from '../types'

export const CIRCUITS: TopicContent = {
  id: 'circuits',
  title: 'Electricity & Circuits',
  tagline: 'Build real circuits on the workbench, switch them on and off, and find out which materials let electricity through.',
  activities: [
    {
      id: 'light',
      title: 'Light the bulb',
      icon: Lightbulb,
      instruction: 'Click (or drag) a battery, a bulb and wires into the gaps until the bulb glows.',
      notice: 'Current only flows when there is a complete loop: from the battery, through the bulb and back again.',
      questions: [
        {
          id: 'why',
          prompt: 'Why does the bulb light up?',
          options: [
            { id: 'loop', label: 'The circuit is a closed loop', sub: 'Current can flow all the way round' },
            { id: 'near', label: 'The battery is near the bulb' },
            { id: 'self', label: 'Bulbs make their own energy' },
            { id: 'colour', label: 'The wires are copper-coloured' },
          ],
          answer: 'loop',
          explain: 'A bulb only glows when current flows through it, and current needs a complete (closed) loop back to the battery.',
        },
        {
          id: 'gap',
          prompt: 'What happens if one wire is removed?',
          options: [
            { id: 'off', label: 'The bulb goes out', sub: 'The circuit becomes open' },
            { id: 'brighter', label: 'The bulb gets brighter' },
            { id: 'same', label: 'Nothing changes' },
            { id: 'dimmer', label: 'It glows a little dimmer' },
          ],
          answer: 'off',
          explain: 'Removing a wire leaves a gap. With the loop broken (an open circuit) no current flows anywhere.',
        },
      ],
    },
    {
      id: 'switch',
      title: 'Use a switch',
      icon: ToggleLeft,
      instruction: 'Put the switch into the empty gap, then click it to open and close the circuit.',
      notice: 'An open switch makes a gap in the loop, so no current flows. Closing it completes the circuit.',
      questions: [
        {
          id: 'open',
          prompt: 'When the switch is open, the circuit is…',
          options: [
            { id: 'open', label: 'Open — no current flows' },
            { id: 'closed', label: 'Closed — current flows' },
            { id: 'short', label: 'A short circuit' },
            { id: 'brighter', label: 'Extra bright' },
          ],
          answer: 'open',
          explain: 'A switch works by opening a gap in the circuit. Open switch → open circuit → no current → bulb off.',
        },
      ],
    },
    {
      id: 'materials',
      title: 'Conductor or insulator?',
      icon: Pencil,
      instruction: 'Place different materials in the test gap. Test at least 4 and watch the bulb.',
      notice: 'Metals and graphite let current through (conductors). Plastic, rubber, wood and glass block it (insulators).',
      questions: [
        {
          id: 'insulator',
          prompt: 'Which material is an insulator?',
          options: [
            { id: 'copper', label: 'Copper wire' },
            { id: 'foil', label: 'Aluminium foil' },
            { id: 'plastic', label: 'Plastic ruler' },
            { id: 'nail', label: 'Iron nail' },
          ],
          answer: 'plastic',
          explain: 'Plastic does not let electric current flow through it, so the bulb stays off — it is an insulator.',
        },
        {
          id: 'graphite',
          prompt: 'Pencil lead (graphite) is not a metal. In the test it…',
          options: [
            { id: 'yes', label: 'Conducted electricity', sub: 'The bulb lit up' },
            { id: 'no', label: 'Did not conduct' },
            { id: 'melted', label: 'Melted' },
            { id: 'colour', label: 'Changed colour' },
          ],
          answer: 'yes',
          explain: 'Graphite is a surprising non-metal conductor — that is why it is used in batteries and electric motors.',
        },
      ],
    },
  ],
}

import { Droplets, FlipHorizontal2, Gem } from 'lucide-react'
import type { TopicContent } from '../types'

export const OPTICS: TopicContent = {
  id: 'optics',
  title: 'Reflection & Refraction',
  tagline: 'Bounce laser light off mirrors, bend it through water and glass, and trap it inside a glass block.',
  activities: [
    {
      id: 'reflect',
      title: 'Mirror reflection',
      icon: FlipHorizontal2,
      instruction: 'Drag the laser around the mirror (or use the slider). Try at least 3 different angles.',
      notice: 'The angle of reflection always equals the angle of incidence — both measured from the dashed normal line.',
      questions: [
        {
          id: 'equal-angle',
          prompt: 'Light hits a mirror at an angle of incidence of 35°. What is the angle of reflection?',
          options: [
            { id: '35', label: '35°', sub: 'The same angle' },
            { id: '55', label: '55°', sub: '90° − 35°' },
            { id: '70', label: '70°', sub: 'Double the angle' },
            { id: '17', label: '17.5°', sub: 'Half the angle' },
          ],
          answer: '35',
          explain: 'Law of reflection: the angle of incidence equals the angle of reflection, so it reflects at 35°.',
        },
        {
          id: 'normal',
          prompt: 'Both angles are measured from…',
          options: [
            { id: 'normal', label: 'The normal', sub: 'A line at 90° to the mirror' },
            { id: 'mirror', label: 'The mirror surface' },
            { id: 'laser', label: 'The laser' },
            { id: 'floor', label: 'The floor' },
          ],
          answer: 'normal',
          explain: 'Scientists measure from the normal — the dashed line at right angles to the surface where the light hits.',
        },
      ],
    },
    {
      id: 'refract',
      title: 'Light bending',
      icon: Droplets,
      instruction: 'Shine the laser into water, glass and diamond. Try at least 2 materials and 2 angles.',
      notice: 'Light slows down in denser materials and bends towards the normal. Diamond bends it the most.',
      questions: [
        {
          id: 'toward',
          prompt: 'When light passes from air into glass, it bends…',
          options: [
            { id: 'toward', label: 'Towards the normal', sub: 'Smaller angle inside the glass' },
            { id: 'away', label: 'Away from the normal' },
            { id: 'none', label: 'It does not bend' },
            { id: 'back', label: 'Back towards the laser' },
          ],
          answer: 'toward',
          explain: 'Light slows down in glass, so it bends towards the normal and the angle inside the glass is smaller.',
        },
        {
          id: 'most',
          prompt: 'Which material bends light the most?',
          options: [
            { id: 'water', label: 'Water', sub: 'n = 1.33' },
            { id: 'glass', label: 'Glass', sub: 'n = 1.50' },
            { id: 'diamond', label: 'Diamond', sub: 'n = 2.42' },
            { id: 'air', label: 'Air', sub: 'n = 1.00' },
          ],
          answer: 'diamond',
          explain: 'Diamond has the highest refractive index (2.42), so it slows and bends light the most — that is why it sparkles.',
        },
      ],
    },
    {
      id: 'tir',
      title: 'Trapped light',
      icon: Gem,
      instruction: 'The laser is now inside a glass block, shining up into the air. Increase the angle until no light escapes.',
      notice: 'Beyond the critical angle (about 42° for glass) all the light reflects back inside — this is how optical fibres carry light.',
      challenge: { prompt: 'Challenge: find an angle where the light is completely trapped, then press "Check".' },
      questions: [
        {
          id: 'when',
          prompt: 'Total internal reflection happens when light travels…',
          options: [
            { id: 'glass-air', label: 'From glass into air', sub: 'At a large angle' },
            { id: 'air-glass', label: 'From air into glass' },
            { id: 'small', label: 'At very small angles' },
            { id: 'never', label: 'It never happens' },
          ],
          answer: 'glass-air',
          explain: 'It only happens going from a denser material (glass) into a less dense one (air), at angles above the critical angle.',
        },
      ],
    },
  ],
}

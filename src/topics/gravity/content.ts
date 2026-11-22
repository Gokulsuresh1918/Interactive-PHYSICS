import { Magnet, Ruler, Weight } from 'lucide-react'
import type { TopicContent } from '../types'

export const GRAVITY: TopicContent = {
  id: 'gravity',
  title: 'Gravitation',
  tagline: 'Pick planets and moons, change their mass and distance, and watch the invisible pull of gravity change.',
  activities: [
    {
      id: 'mass',
      title: 'Mass matters',
      icon: Weight,
      instruction: 'Change the mass of either object (at least 3 values) and watch the pull arrows and the force.',
      notice: 'Force is proportional to mass: double one mass and the gravitational pull doubles.',
      questions: [
        {
          id: 'double',
          prompt: 'If one object’s mass doubles (distance unchanged), the gravitational force…',
          options: [
            { id: 'x2', label: 'Doubles', sub: '× 2' },
            { id: 'half', label: 'Halves', sub: '÷ 2' },
            { id: 'x4', label: 'Becomes 4 times bigger', sub: '× 4' },
            { id: 'same', label: 'Stays the same' },
          ],
          answer: 'x2',
          explain: 'F = G × m₁ × m₂ ÷ r². Doubling one mass doubles the top of the fraction, so the force doubles.',
        },
      ],
    },
    {
      id: 'distance',
      title: 'Distance matters',
      icon: Ruler,
      instruction: 'Move the objects closer together and further apart. Try at least 3 distances, including doubling it.',
      notice: 'Gravity weakens fast with distance: double the distance and the force drops to one quarter.',
      questions: [
        {
          id: 'inverse-square',
          prompt: 'If the distance between two objects doubles, the force becomes…',
          options: [
            { id: 'quarter', label: 'One quarter', sub: '÷ 4' },
            { id: 'half', label: 'One half', sub: '÷ 2' },
            { id: 'x2', label: 'Twice as big', sub: '× 2' },
            { id: 'same', label: 'The same' },
          ],
          answer: 'quarter',
          explain: 'Gravity follows an inverse-square law: F ∝ 1 ÷ r². Doubling r makes r² four times bigger, so F is ÷ 4.',
        },
      ],
    },
    {
      id: 'pull',
      title: 'Who pulls harder?',
      icon: Magnet,
      instruction: 'Pick two different objects and press Release to let gravity pull them together.',
      notice: 'Both objects pull on each other with the same force, but the lighter one accelerates more and moves further.',
      questions: [
        {
          id: 'equal',
          prompt: 'Earth pulls the Moon with a force F. The Moon pulls Earth with…',
          options: [
            { id: 'same', label: 'The same force F' },
            { id: 'smaller', label: 'A smaller force' },
            { id: 'none', label: 'No force at all' },
            { id: 'bigger', label: 'A bigger force' },
          ],
          answer: 'same',
          explain: 'Gravitational forces come in equal and opposite pairs (Newton’s third law) — even between a planet and a moon.',
        },
        {
          id: 'moves',
          prompt: 'When released, which object moves further?',
          options: [
            { id: 'light', label: 'The lighter object' },
            { id: 'heavy', label: 'The heavier object' },
            { id: 'same', label: 'Both move the same distance' },
          ],
          answer: 'light',
          explain: 'Same force, but a = F ÷ m — the lighter object gets a bigger acceleration, so it moves further.',
        },
      ],
    },
  ],
}

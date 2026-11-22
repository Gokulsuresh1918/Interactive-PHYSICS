import { Rocket, Snowflake, Users } from 'lucide-react'
import type { TopicContent } from '../types'

export const MOTION: TopicContent = {
  id: 'motion',
  title: "Newton's Laws of Motion",
  tagline: 'Push trolleys and crates, glide pucks across ice and launch skaters apart to discover the three laws of motion.',
  activities: [
    {
      id: 'second',
      title: 'Force, mass & acceleration',
      icon: Rocket,
      instruction: 'Choose an object, set its mass and the force, then press Push! Do at least 3 pushes with 2 different masses.',
      notice: 'Acceleration = force ÷ mass. The same push makes a light object speed up much more than a heavy one.',
      questions: [
        {
          id: 'lighter',
          prompt: 'With the same push, which object speeds up more?',
          options: [
            { id: 'light', label: 'The lighter object', sub: 'Less mass' },
            { id: 'heavy', label: 'The heavier object', sub: 'More mass' },
            { id: 'same', label: 'Both the same' },
            { id: 'neither', label: 'Neither moves' },
          ],
          answer: 'light',
          explain: 'Newton’s second law: a = F ÷ m. With the same force, a smaller mass gives a bigger acceleration.',
        },
        {
          id: 'calc',
          prompt: 'A 20 N force pushes a 4 kg trolley. What is its acceleration?',
          options: [
            { id: '5', label: '5 m/s²', sub: '20 ÷ 4' },
            { id: '80', label: '80 m/s²', sub: '20 × 4' },
            { id: '16', label: '16 m/s²', sub: '20 − 4' },
            { id: '24', label: '24 m/s²', sub: '20 + 4' },
          ],
          answer: '5',
          explain: 'a = F ÷ m = 20 N ÷ 4 kg = 5 m/s².',
        },
      ],
    },
    {
      id: 'first',
      title: 'Inertia on ice',
      icon: Snowflake,
      instruction: 'Flick the puck across ice, then across grass. Compare what happens after the push ends.',
      notice: 'With no friction the puck keeps moving at the same speed. Friction is an unbalanced force that slows it down.',
      questions: [
        {
          id: 'ice',
          prompt: 'On frictionless ice, after the push ends, the puck…',
          options: [
            { id: 'same', label: 'Keeps moving at the same speed' },
            { id: 'stops', label: 'Slows down and stops' },
            { id: 'faster', label: 'Keeps speeding up' },
            { id: 'back', label: 'Moves backwards' },
          ],
          answer: 'same',
          explain: 'Newton’s first law (inertia): an object keeps moving at the same speed in a straight line unless a force acts on it.',
        },
        {
          id: 'grass',
          prompt: 'What makes the puck stop on grass?',
          options: [
            { id: 'friction', label: 'Friction', sub: 'A force against the motion' },
            { id: 'tired', label: 'It runs out of force' },
            { id: 'gravity', label: 'Gravity pushes it back' },
            { id: 'inertia', label: 'Inertia stops it' },
          ],
          answer: 'friction',
          explain: 'Moving objects do not “run out of force”. Friction from the grass acts against the motion and slows the puck down.',
        },
      ],
    },
    {
      id: 'third',
      title: 'Action & reaction',
      icon: Users,
      instruction: 'Set the two skaters’ masses and press Push off! Try at least 2 different combinations.',
      notice: 'Both skaters feel the same size force in opposite directions — but the lighter skater moves away faster.',
      questions: [
        {
          id: 'equal',
          prompt: 'When skater A pushes skater B, the force on A is…',
          options: [
            { id: 'equal', label: 'Equal and opposite', sub: 'Same size, other direction' },
            { id: 'zero', label: 'Zero — A did the pushing' },
            { id: 'smaller', label: 'Smaller than the force on B' },
            { id: 'bigger', label: 'Bigger than the force on B' },
          ],
          answer: 'equal',
          explain: 'Newton’s third law: forces come in pairs. If A pushes B, B pushes A back with an equal and opposite force.',
        },
        {
          id: 'faster',
          prompt: 'After pushing off, who moves away faster?',
          options: [
            { id: 'light', label: 'The lighter skater' },
            { id: 'heavy', label: 'The heavier skater' },
            { id: 'same', label: 'They always move at the same speed' },
          ],
          answer: 'light',
          explain: 'The forces are equal, but a = F ÷ m, so the skater with less mass gets the bigger speed.',
        },
      ],
    },
  ],
}

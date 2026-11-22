import { Music, Volume2, Waves } from 'lucide-react'
import type { TopicContent } from '../types'
import { WaveArt } from './WaveArt'

export const SOUND: TopicContent = {
  id: 'sound',
  title: 'Sound Waves',
  tagline: 'Turn the dials on a wave machine, see how air particles vibrate, and hear how frequency and amplitude change a sound.',
  activities: [
    {
      id: 'pitch',
      title: 'Pitch & frequency',
      icon: Music,
      instruction: 'Slide the frequency from low (under 300 Hz) to high (over 700 Hz). Press Play to listen if you like.',
      notice: 'Higher frequency = more waves each second = higher pitch. The waves also get shorter (smaller wavelength).',
      questions: [
        {
          id: 'pitch',
          prompt: 'As the frequency increases, the pitch…',
          options: [
            { id: 'higher', label: 'Gets higher', sub: 'Like a whistle' },
            { id: 'lower', label: 'Gets lower', sub: 'Like a drum' },
            { id: 'louder', label: 'Gets louder' },
            { id: 'same', label: 'Stays the same' },
          ],
          answer: 'higher',
          explain: 'Pitch is how our ears hear frequency: more vibrations per second sound higher.',
        },
        {
          id: 'wavelength',
          prompt: 'As the frequency increases, the wavelength…',
          options: [
            { id: 'shorter', label: 'Gets shorter', art: <WaveArt cycles={5} amp={0.7} /> },
            { id: 'longer', label: 'Gets longer', art: <WaveArt cycles={1.2} amp={0.7} /> },
            { id: 'same', label: 'Stays the same', art: <WaveArt cycles={2.5} amp={0.7} /> },
          ],
          answer: 'shorter',
          explain: 'Sound travels at about 343 m/s, and wavelength = speed ÷ frequency, so higher frequency means shorter waves.',
        },
      ],
    },
    {
      id: 'loudness',
      title: 'Loudness & amplitude',
      icon: Volume2,
      instruction: 'Change the amplitude from small (under 30%) to large (over 80%). Watch the air particles.',
      notice: 'Bigger amplitude = particles vibrate further = louder sound. The pitch does not change.',
      questions: [
        {
          id: 'loudest',
          prompt: 'All four waves have the same frequency. Which one is the loudest?',
          options: [
            { id: 'a', label: 'Wave A', art: <WaveArt cycles={3} amp={0.35} color="#2a8cf0" /> },
            { id: 'b', label: 'Wave B', art: <WaveArt cycles={3} amp={0.95} color="#e64980" /> },
            { id: 'c', label: 'Wave C', art: <WaveArt cycles={3} amp={0.15} color="#12b3a2" /> },
            { id: 'd', label: 'Wave D', art: <WaveArt cycles={3} amp={0.6} color="#8b7cf6" /> },
          ],
          answer: 'b',
          explain: 'Loudness depends on amplitude — the height of the wave. Wave B is the tallest, so it is the loudest.',
        },
        {
          id: 'changes',
          prompt: 'Changing the amplitude changes the sound’s…',
          options: [
            { id: 'loudness', label: 'Loudness' },
            { id: 'pitch', label: 'Pitch' },
            { id: 'speed', label: 'Speed' },
            { id: 'wavelength', label: 'Wavelength' },
          ],
          answer: 'loudness',
          explain: 'Amplitude controls how much energy the wave carries, which we hear as loudness.',
        },
      ],
    },
    {
      id: 'match',
      title: 'Match the mystery sound',
      icon: Waves,
      instruction: 'A mystery wave is shown as a dashed line. Adjust frequency and amplitude until your wave matches it.',
      notice: 'Matching both dials means matching both pitch (frequency) and loudness (amplitude).',
      challenge: { prompt: 'Challenge: match the dashed mystery wave, then press "Check match".' },
      questions: [
        {
          id: 'low-quiet',
          prompt: 'Which wave shows a LOW and QUIET sound?',
          options: [
            { id: 'a', label: 'Wave A', art: <WaveArt cycles={6} amp={0.9} color="#2a8cf0" /> },
            { id: 'b', label: 'Wave B', art: <WaveArt cycles={1.5} amp={0.25} color="#12b3a2" /> },
            { id: 'c', label: 'Wave C', art: <WaveArt cycles={6} amp={0.25} color="#8b7cf6" /> },
            { id: 'd', label: 'Wave D', art: <WaveArt cycles={1.5} amp={0.9} color="#e64980" /> },
          ],
          answer: 'b',
          explain: 'Low pitch → few waves (low frequency). Quiet → small height (small amplitude). Wave B has both.',
        },
      ],
    },
  ],
}

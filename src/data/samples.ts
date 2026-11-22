/**
 * Predefined, scientifically consistent sample properties.
 * Everything in the lab (litmus, indicator colour, conductivity, clues)
 * is derived from these values — nothing is randomised.
 *
 * pH values are typical approximations for everyday substances; real values
 * vary with concentration, brand and temperature.
 */

export type Nature = 'acid' | 'base' | 'neutral'
export type Conductivity = 'none' | 'weak' | 'strong'

export interface Sample {
  id: string
  name: string
  /** Typical pH used for colours and scoring (midpoint of range). */
  ph: number
  /** Approximate pH range shown to students. */
  phRange: [number, number]
  nature: Nature
  /** Natural colour of the liquid before any indicator is added. */
  liquidColor: string
  liquidOpacity: number
  /** Bottle cap colour on the sample shelf. */
  cap: string
  cloudy?: boolean
  fizzy?: boolean
  conductivity: Conductivity
  /** Neutral one-line description (does not give away the answer). */
  description: string
  /** Explanation shown after the student answers. */
  science: string
  /** Simulation observations — presented as recorded data, never as instructions. */
  sensoryNote: string
  observation: string
}

const SOUR =
  'Reference data: described as tasting sour. (In a real lab, never taste samples!)'
const SLIPPERY =
  'Reference data: solutions like this feel slippery or soapy. (Never touch unknown chemicals!)'
const NEITHER = 'Reference data: no sour or slippery character recorded.'

export const SAMPLES: Sample[] = [
  {
    id: 'lemon',
    cap: '#f5b800',
    name: 'Lemon Juice',
    ph: 2,
    phRange: [2, 2],
    nature: 'acid',
    liquidColor: '#f3e27a',
    liquidOpacity: 0.72,
    cloudy: true,
    conductivity: 'weak',
    description: 'Juice squeezed from fresh lemons.',
    science:
      'Lemon juice contains citric acid. In water, acids release hydrogen ions (H⁺), which turn blue litmus red and give universal indicator a red colour.',
    sensoryNote: SOUR,
    observation: 'Cloudy, pale-yellow liquid; a citrus smell was recorded.',
  },
  {
    id: 'vinegar',
    cap: '#c0843d',
    name: 'Vinegar',
    ph: 3,
    phRange: [3, 3],
    nature: 'acid',
    liquidColor: '#e9dcc0',
    liquidOpacity: 0.45,
    conductivity: 'weak',
    description: 'A kitchen liquid used for pickling and salad dressing.',
    science:
      'Vinegar is a dilute solution of acetic (ethanoic) acid. It is a weak acid, but still releases enough H⁺ ions to give a pH of about 3.',
    sensoryNote: SOUR,
    observation: 'Clear liquid; a sharp, pungent smell was recorded.',
  },
  {
    id: 'orange',
    cap: '#f97316',
    name: 'Orange Juice',
    ph: 3.5,
    phRange: [3, 4],
    nature: 'acid',
    liquidColor: '#f7a23b',
    liquidOpacity: 0.85,
    cloudy: true,
    conductivity: 'weak',
    description: 'Juice pressed from oranges.',
    science:
      'Orange juice contains citric acid and ascorbic acid (vitamin C), making it acidic with a pH of roughly 3–4.',
    sensoryNote: SOUR,
    observation: 'Opaque orange liquid containing bits of pulp.',
  },
  {
    id: 'soda',
    cap: '#e0445a',
    name: 'Soda',
    ph: 3.5,
    phRange: [3, 4],
    nature: 'acid',
    liquidColor: '#b86a35',
    liquidOpacity: 0.7,
    fizzy: true,
    conductivity: 'weak',
    description: 'A fizzy soft drink.',
    science:
      'Dissolved carbon dioxide forms carbonic acid, and many sodas also contain citric or phosphoric acid — so soda is acidic (about pH 3–4; colas can be even lower).',
    sensoryNote: SOUR,
    observation: 'Small gas bubbles keep rising through the liquid (fizzing).',
  },
  {
    id: 'water',
    cap: '#2a8cf0',
    name: 'Pure Water',
    ph: 7,
    phRange: [7, 7],
    nature: 'neutral',
    liquidColor: '#bfe6ff',
    liquidOpacity: 0.28,
    conductivity: 'none',
    description: 'Distilled water — water with dissolved substances removed.',
    science:
      'Pure water contains tiny, equal amounts of H⁺ and OH⁻ ions, so it is neutral (pH 7). With almost no dissolved ions, it barely conducts electricity.',
    sensoryNote: NEITHER,
    observation: 'Leaves no residue when a drop evaporates.',
  },
  {
    id: 'salt',
    cap: '#12b3a2',
    name: 'Salt Water',
    ph: 7,
    phRange: [7, 7],
    nature: 'neutral',
    liquidColor: '#cfeef5',
    liquidOpacity: 0.32,
    conductivity: 'strong',
    description: 'Table salt (sodium chloride) dissolved in water.',
    science:
      'Sodium chloride is a neutral salt: dissolving it adds Na⁺ and Cl⁻ ions but no extra H⁺ or OH⁻, so the pH stays at about 7. Those ions do let it conduct electricity well.',
    sensoryNote: NEITHER,
    observation: 'Leaves tiny white crystals when a drop evaporates.',
  },
  {
    id: 'bakingsoda',
    cap: '#8b7cf6',
    name: 'Baking Soda Solution',
    ph: 8.5,
    phRange: [8, 9],
    nature: 'base',
    liquidColor: '#eef2f4',
    liquidOpacity: 0.6,
    cloudy: true,
    conductivity: 'strong',
    description: 'Baking soda powder stirred into water.',
    science:
      'Baking soda is sodium hydrogen carbonate. In water it produces some hydroxide ions (OH⁻), making a mild base of about pH 8–9 — that is why it is used in antacids.',
    sensoryNote: SLIPPERY,
    observation: 'Fizzes strongly when a little vinegar is added (in a separate test).',
  },
  {
    id: 'soap',
    cap: '#ec6fb5',
    name: 'Soap Solution',
    ph: 9.5,
    phRange: [9, 10],
    nature: 'base',
    liquidColor: '#d8e8ff',
    liquidOpacity: 0.55,
    cloudy: true,
    conductivity: 'weak',
    description: 'Bar soap dissolved in warm water.',
    science:
      'Soap is made by reacting fats with a strong base, and a soap solution is mildly alkaline (about pH 9–10). Bases often feel slippery for this reason.',
    sensoryNote: SLIPPERY,
    observation: 'Forms a foamy lather when the container is shaken.',
  },
  {
    id: 'ammonia',
    cap: '#5b6fd8',
    name: 'Ammonia Cleaner',
    ph: 11.5,
    phRange: [11, 12],
    nature: 'base',
    liquidColor: '#e4f3f7',
    liquidOpacity: 0.3,
    conductivity: 'weak',
    description: 'A household glass cleaner containing ammonia.',
    science:
      'Ammonia reacts with water to form hydroxide ions (OH⁻). Household ammonia solutions are quite basic — around pH 11–12 — and give universal indicator a violet colour.',
    sensoryNote: SLIPPERY,
    observation: 'A strong, sharp smell was recorded — handled only in a fume cupboard.',
  },
]

export const SAMPLE_BY_ID: Record<string, Sample> = Object.fromEntries(
  SAMPLES.map((s) => [s.id, s]),
)

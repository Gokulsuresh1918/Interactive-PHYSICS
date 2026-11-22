/**
 * Mystery samples reuse the exact properties of the known samples.
 * Each one is solvable from its starter clue + lab tests alone;
 * hints make it easier but reduce the identification reward.
 */

export interface Mystery {
  id: string
  code: string
  sampleId: string
  /** Free clue shown from the start. */
  starterClue: string
  /** Extra clues revealed on request (cost points). */
  hints: string[]
  /** Identities the student chooses between. */
  candidates: string[]
}

export const MYSTERIES: Mystery[] = [
  {
    id: 'm1',
    code: '01',
    sampleId: 'vinegar',
    starterClue: 'A clear, colourless liquid taken from a kitchen cupboard.',
    hints: [
      'Reference data: described as tasting sour. (Never taste lab samples!)',
      'A sharp, pungent smell was recorded when the bottle was opened.',
      'Expected pH region: acidic — somewhere around 2 to 4.',
    ],
    candidates: ['bakingsoda', 'vinegar', 'salt', 'water'],
  },
  {
    id: 'm2',
    code: '02',
    sampleId: 'bakingsoda',
    starterClue: 'A cloudy white liquid made by stirring a kitchen powder into water.',
    hints: [
      'Reference data: solutions like this feel slippery. (Never touch unknown chemicals!)',
      'It fizzes strongly when a little vinegar is added in a separate test.',
      'Expected pH region: mildly basic — around 8 to 9.',
    ],
    candidates: ['soap', 'lemon', 'bakingsoda', 'salt'],
  },
  {
    id: 'm3',
    code: '03',
    sampleId: 'salt',
    starterClue: 'A clear, colourless liquid. Its secret may only show up with electricity.',
    hints: [
      'Reference data: no sour or slippery character recorded.',
      'Tiny white crystals were left behind when a drop evaporated.',
      'The dissolved substance splits into ions that carry current very well.',
    ],
    candidates: ['water', 'salt', 'vinegar', 'soap'],
  },
  {
    id: 'm4',
    code: '04',
    sampleId: 'soda',
    starterClue: 'Poured from a sealed can that hissed when it was opened.',
    hints: [
      'Reference data: described as tasting sour. (Never taste lab samples!)',
      'Small gas bubbles keep rising through the liquid.',
      'Expected pH region: acidic — around 3 to 4.',
    ],
    candidates: ['orange', 'ammonia', 'water', 'soda'],
  },
  {
    id: 'm5',
    code: '05',
    sampleId: 'soap',
    starterClue: 'A slightly cloudy liquid collected from a washroom sink.',
    hints: [
      'Reference data: solutions like this feel slippery. (Never touch unknown chemicals!)',
      'It forms a foamy lather when the container is shaken.',
      'Expected pH region: basic — around 9 to 10, but not as high as 11.',
    ],
    candidates: ['bakingsoda', 'ammonia', 'soap', 'lemon'],
  },
  {
    id: 'm6',
    code: '06',
    sampleId: 'water',
    starterClue: 'A clear, colourless liquid with no smell recorded.',
    hints: [
      'Reference data: no sour or slippery character recorded.',
      'It leaves no residue at all when a drop evaporates.',
      'It barely conducts electricity — almost no dissolved ions are present.',
    ],
    candidates: ['salt', 'water', 'lemon', 'ammonia'],
  },
]

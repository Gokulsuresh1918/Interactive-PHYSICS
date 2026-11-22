# Science Playground

An interactive virtual science lab for secondary-school students. The main experience is **Acids, Bases & pH**. Students enter their name, choose a sample, run an experiment, watch the reaction, answer one question at a time and build their score.

Frontend only: React 19 + TypeScript + Vite, Framer Motion, SVG/Canvas, and Web Audio. There is no backend or login, and progress is kept in `sessionStorage`.

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production build into dist/
```

## Student flow

1. **Welcome:** enter a name.
2. **Choose a sample:** known substances, or a mystery sample.
3. **Choose a test:** litmus or universal indicator. Mystery samples get a case file with clues and paid hints instead.
4. **Observe:** a focused beaker scene with only the tools for that test.
5. **Predict:** one question per screen, with the evidence shown alongside.
6. **Result:** feedback, points, an optional "Why does the colour change?" molecule popup, and a single "Next" action.

The score sidebar (a compact bar on small screens) stays visible the whole time.

## Where things live

| Area | Files |
|---|---|
| Sample properties (pH, litmus, conductivity, clues) | `src/data/samples.ts` |
| Mystery samples (reuse known sample data) | `src/data/mysteries.ts` |
| Future topics shown in the footer | `src/data/topics.ts` |
| Chemistry rules (indicator colours, litmus) | `src/lib/chemistry.ts` |
| Points, partial credit, hints, ranks | `src/lib/scoring.ts` |
| Generated sound effects | `src/lib/sound.ts` |
| Session state (score, streak, no-farming guard) | `src/state/session.tsx` |
| Step-by-step flow (chooser, known, mystery, stepper) | `src/components/flow/` |
| Lab building blocks (beaker, tools, pH scale, molecules, sidebar) | `src/components/lab/` |
| Top bar, footer, modal, background | `src/components/common/` |

## Adding a topic later

Topics listed in `src/data/topics.ts` with `available: false` appear in the footer as "Coming soon". To build one, give it its own page or route and flip `available` to `true`.

pH values are typical approximations. Real values vary with concentration and brand.

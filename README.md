# Science Playground

An interactive virtual science lab for secondary-school students. The first topic is **Acids, Bases & the pH Scale**.

Frontend only: React 19 + TypeScript + Vite, Framer Motion, SVG/Canvas, and Web Audio. There is no backend or login, and progress is kept in `sessionStorage`.

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production build into dist/
```

## Where things live

| Area | Files |
|---|---|
| Sample properties (pH, litmus, conductivity, clues) | `src/data/samples.ts` |
| Mystery samples (reuse known sample data) | `src/data/mysteries.ts` |
| Topic list / "coming soon" topics | `src/data/topics.ts` and `TOPIC_LABS` in `src/App.tsx` |
| Chemistry rules (indicator colours, litmus) | `src/lib/chemistry.ts` |
| Points, partial credit, hints, ranks | `src/lib/scoring.ts` |
| Generated sound effects | `src/lib/sound.ts` |
| Session state (score, streak, no-farming guard) | `src/state/session.tsx` |
| Sound / theme settings | `src/state/settings.tsx` |
| Lab UI (bench, tools, pH scale, modes, sidebar) | `src/components/lab/` |
| Entry, topics, results screens | `src/components/entry`, `topics`, `results` |

## Adding a topic

1. Set `available: true` for the topic in `src/data/topics.ts`.
2. Build its lab component and register it in `TOPIC_LABS` in `src/App.tsx`.

pH values are typical approximations. Real values vary with concentration and brand.

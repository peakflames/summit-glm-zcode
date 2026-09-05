# Summit

> A single-page habit tracker — add habits, mark them done, build streaks. Public reference
> example for the `peak-workflow` plugin.

## Install

```bash
npm install
```

## Quick Start

```bash
npm run dev
```

Then open http://localhost:5173 — add a habit, mark it done for today, and watch the streak
build. All data is stored locally in your browser (`localStorage`); there is no backend.

## Documentation

- [Architecture](docs/architecture.md)
- [Design Notes](docs/design-notes.md)
- [Requirements](docs/requirements/) — TOR requirements baseline
- [Implementation Plan](docs/implementation-plan/) — epic registry; run `/peak-workflow:status` for the dashboard

## Development

See [AGENTS.md](AGENTS.md) for the project's development workflow conventions — zcode loads
it automatically every session.

## Built with Peak-Workflow

Summit is the public reference example for
[`peak-workflow`](https://github.com/peakflames/claude-plugins-peakflames), built end-to-end
using the plugin's requirements-driven lifecycle. The token spend below covers more than
application code — it includes generating and maintaining the full set of SLCD (Software Life
Cycle Data) artifacts and requirements-to-code traceability, produced to a rigor sufficient for
a DO-330 TQL-5 engineering tool. Below is a usage snapshot of ZCode (powered by GLM) while
building Summit v0.3.0 with ZCode CLI version `<fill-in>` and peak-workflow v1.5.0:

<!-- TODO: replace the placeholder cells/bullets below with real usage numbers -->

| Model | Cost | Tokens |
|-------|------|--------|
| glm-5.3-flash | $X.XX | NNN tok |

- Cache hit at NN% — most prompts reuse cache
- NN% one-shot — edits landing first try

## License

No license file yet — add one before publishing (see the repo hygiene audit from setup).

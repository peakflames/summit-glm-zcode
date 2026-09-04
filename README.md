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

## License

No license file yet — add one before publishing (see the repo hygiene audit from setup).

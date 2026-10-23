# Project Drishti

Autonomous AI SOC: a multi-agent pipeline that detects, investigates and mitigates threats from logs.
Final-year BE IT project. Everything runs locally / self-hosted; no cloud LLM APIs.

**Read `docs/PROJECT_PLAN.md` before every task.** It is the source of truth: phases, data model, API, design system.
Work one phase at a time; tick checkboxes there and add a Progress Log line when done.
Architecture diagrams: `docs/Project_Drishti_Architectural_Diagrams.pdf`.

## Pipeline

1. **Watcher (SEE)**: ingests logs, filters noise, detects anomalies, fetches history from PostgreSQL.
2. **Detective (UNDERSTAND)**: RAG over MITRE ATT&CK (ChromaDB) + Llama 3.2 3B (Ollama). Can ask Watcher for more context (max 2 loops).
3. **Confidence Gate (DECIDE)**: > 80% autonomous, < 80% human approval on the dashboard.
4. **Bouncer (DEFEND)**: executes mitigation (e.g. block IP). **Simulated by default.**

Orchestrated with LangGraph; shared state is `IncidentState`.

## Tech stack

- Frontend: React, Vite, TypeScript (strict), Tailwind v4, shadcn/ui, React Router, Framer Motion, lucide-react, TanStack Query
- Backend: FastAPI, Pydantic v2, SQLAlchemy 2 + Alembic, LangGraph
- Data: PostgreSQL, ChromaDB; LLM via Ollama (Llama 3.2 3B)
- Infra: Docker Compose (postgres, chromadb, ollama)

## Folder map

- `frontend/src/` app (router, providers, layout) | pages | components/{ui,layout,animation,agents,common} | features | lib | mocks | types | styles
- Agent characters live in `components/animation/pipeline/Characters.tsx` (origin-centred); use them in the app via `components/agents/AgentGlyph`.
- `backend/app/` main.py | core | api/v1/routes | agents | orchestration | rag | llm | mitigation | db | schemas | services
- `backend/tests/`, `data/{sample_logs,mitre}`, `scripts/`, `evaluation/`, `docs/`

## Run

Frontend (from `frontend/`): `npm install`, `npm run dev` -> http://localhost:5173
Backend (from `backend/`, PowerShell):

```
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Infra: `docker compose up -d`. Tests: `pytest` (backend), `npm run build` (frontend).

## Conventions

- TypeScript strict, functional components, hooks. Tailwind only; the one CSS exception is `styles/tokens.css` (+ base styles in `index.css`).
- Data access only through `lib/api.ts` / TanStack Query. Types in `src/types` mirror backend schemas.
- Python type hints everywhere; Pydantic for all I/O. Business logic in `agents/` and `services/`, not routes.
- LLM prompts are files in `llm/prompts/`. Validate all LLM output; never trust raw text.
- Every agent decision writes an audit entry.
- Never touch the real host firewall unless `MITIGATION_MODE=real` AND the IP is not allowlisted.
- Commits: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`. One feature per branch. No secrets in git.
- Never add Co-Authored-By, Claude-Session or Generated-with lines to commits or PRs. Commits show only the user as author (also enforced by `.claude/settings.json` `attribution`).

## UI rules

**Keep the UI minimal with very little text.** One or two short lines per section; let space and motion explain.
Respect `prefers-reduced-motion`. Few charts. Logs/investigations on separate pages.

## Colour tokens: "Acid Moss" (`frontend/src/styles/tokens.css`, Tailwind: `bg-surface`, `text-primary`, `border-sage`, `text-threat`, ...)

| Token | Hex |
|---|---|
| bg (deep moss black) | #0E1410 |
| surface | #141C17 |
| card | #1A241E |
| border | #2A3A30 |
| primary (acid lime) | #C8FF3D |
| primary-deep | #9ED11F |
| primary-light | #DBFF7A |
| sage (secondary) | #5E7A63 |
| threat (coral) | #FF5A4E |
| success (mint) | #5FE3B0 |
| warning (amber) | #FFC24B |
| text (sage-white) | #D7E3D2 |
| text-muted | #8FA393 |

**Lime** (`text-primary`): headline words, stage labels, small labels, logo text, links, active nav, active/popped card, fibres and iris. Primary buttons: `bg-primary` with moss-black text (`text-bg`). Lime never goes on long text.
**Sage** (`border-sage`): borders, inactive states, secondary button outlines, railway. Never small text (~4:1 on bg).
**Coral** (`text-threat`): threats (threat beads, BLOCKED, alert badges, the locked iris tick) plus a small text accent: the italic headline accent word, the How it works stage labels and key example values. About one accent per section; never body text or buttons; solid, no glow.
The hero DRISHTI title is soft white `#F4F7F2`; the tagline is sage-white `text-text`. How it works card descriptions and the "Drishti" logo word are pure white `#FFFFFF`. Titles in cards/panels are `text-text`; body is `text-text` / `text-text-muted`.
No text glow, no matrix/terminal-green clichés. Keep the faint moss glows, grid and noise from `index.css`; never flat black.

## Typography

- `font-display` **Unbounded** for big uppercase headings (landing); `font-serif` **Instrument Serif** italic (sage-white) for one accent word per headline. Use `Headline` / `Accent` from `features/landing/sections/Headline.tsx`.
- `font-sans` **Inter** for body and the whole dashboard. `font-mono` **JetBrains Mono** for logs, IPs, IDs, data.

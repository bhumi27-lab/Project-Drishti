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

- `frontend/src/` app (router, providers, layout) | pages | components/{ui,layout,animation,agents} | features | lib | mocks | types | styles
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

## UI rules

**Keep the UI minimal with very little text.** One or two short lines per section; let space and motion explain.
Respect `prefers-reduced-motion`. Few charts. Logs/investigations on separate pages.

## Colour tokens (`frontend/src/styles/tokens.css`, Tailwind: `bg-surface`, `text-threat`, ...)

| Token | Hex |
|---|---|
| bg (jet black) | #0B0C0F |
| surface | #12151C |
| card | #171B24 |
| border | #232A36 |
| primary (cerulean) | #1E9BD7 |
| primary-deep | #007BA7 |
| primary-glow | #4FC3F7 |
| threat (neon rose) | #FF3D81 |
| success | #2ED3A0 |
| warning | #F5B544 |
| text | #E8EEF5 |
| text-muted | #8A94A6 |

Neon rose is **only** for threats, alerts and blocked items, never decoration.
Do not use flat black: keep the cerulean radial glows, faint grid and noise from `index.css`.

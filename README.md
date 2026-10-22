# Project Drishti

**Autonomous AI SOC: multi-agent orchestration for real-time threat detection and mitigation.**
*The AI That Fights Back.*

Drishti watches logs, investigates suspicious events with grounded reasoning (RAG over MITRE ATT&CK plus a local LLM),
scores its own confidence, and either acts on its own or asks a human analyst. Everything runs locally.

## Pipeline

**SEE → UNDERSTAND → DECIDE → DEFEND**

| Stage | Agent | Role |
|---|---|---|
| SEE | Watcher | Detects anomalies, filters noise, pulls history from PostgreSQL |
| UNDERSTAND | Detective | MITRE ATT&CK RAG (ChromaDB) + Llama 3.2 3B; can ask Watcher for more context |
| DECIDE | Confidence Gate | > 80% autonomous, < 80% human approval |
| DEFEND | Bouncer | Executes mitigation such as an IP block (simulated by default) |

```text
Logs → Watcher → Detective → Confidence Gate ─┬─ ≥ 80% → Bouncer
          ▲          │                         └─ < 80% → Human analyst
          └──────────┘ (needs more context)
```

More in [docs/architecture.md](docs/architecture.md) and [docs/PROJECT_PLAN.md](docs/PROJECT_PLAN.md).

## Stack

React · Vite · TypeScript · Tailwind · shadcn/ui · Framer Motion | FastAPI · LangGraph · SQLAlchemy |
PostgreSQL · ChromaDB · Ollama (Llama 3.2 3B) | Docker Compose

## Run

Needs Node 20+, Python 3.11+, Docker (optional until Phase 3).

```powershell
# Frontend  ->  http://localhost:5173
cd frontend
npm install
npm run dev

# Backend  ->  http://localhost:8000/health
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload

# Infrastructure (postgres, chromadb, ollama)
Copy-Item .env.example .env
docker compose up -d
```

## Layout

```
frontend/   React app          backend/   FastAPI + agents + LangGraph
data/       sample logs, MITRE scripts/   log simulator, seeding
evaluation/ metrics            docs/      plan, architecture, diagrams
```

## Safety

Mitigation is **simulated by default**. The real firewall is never touched unless `MITIGATION_MODE=real`
is set and the target is not allowlisted.

## Team

Vedang Doulatabad · Bhumi Sirvi · Lakshyaveer Rana. BE Information Technology, SPPU, 2026–27.

## License

MIT

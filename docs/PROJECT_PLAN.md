  # Project Drishti — Master Plan

> **For Claude Code:** This is the single source of truth for building Project Drishti.
> Read this file before every task. Work **one phase at a time**, in order. Do not jump ahead.
> When a task is done, tick its checkbox here (`- [x]`) and add a one-line note to the **Progress Log** at the bottom.
> If something in this plan is unclear or seems wrong, ask before inventing a new direction.
> Companion docs: `docs/project-brief.md` (presentation content) and `docs/Project_Drishti_Architectural_Diagrams.pdf`.

---

## 1. What Drishti is

**Project Drishti** — *Autonomous AI SOC: Multi-Agent AI Orchestration for Real-Time Cyber Threat Detection & Mitigation*
**Tagline:** "The AI That Fights Back."
**Team:** Vedang Doulatabad · Bhumi Sirvi · Lakshyaveer Rana — BE Information Technology, SPPU, AY 2026–27
**Meaning:** *Drishti* = sight / vision — a system that keeps watch.

Security teams drown in alerts, investigate slowly, and use separate tools for detection, investigation and response. Drishti closes that loop. A team of specialised AI agents watches logs, investigates suspicious events with grounded reasoning (RAG over MITRE ATT&CK + a local LLM), decides how confident it is, and either acts on its own or asks a human analyst.

> "We are not trying to remove the human from cybersecurity. We are trying to remove unnecessary human effort from cybersecurity."

### The 4-stage pipeline

| # | Stage | Verb | What it does | Main tech |
|---|---|---|---|---|
| 1 | **Watcher** | SEE | Ingests logs, filters noise, detects anomalies, pulls historical context | Rules + statistical/ML anomaly detection, PostgreSQL |
| 2 | **Detective** | UNDERSTAND | Investigates the alert: retrieves MITRE ATT&CK patterns, reasons with the LLM, can ask Watcher for more context | ChromaDB, Ollama + Llama 3.2 3B |
| 3 | **Confidence Gate** | DECIDE | Combines evidence into a score. **> 80% → autonomous**; **< 80% → human approval** | Scoring function |
| 4 | **Bouncer** | DEFEND | Executes a controlled response (e.g. block IP), logs everything | Mitigation adapters (**simulated by default**) |

Two key ideas to show off:
- **Bidirectional context retrieval:** Detective can say "insufficient context" and ask Watcher for related or historical events instead of guessing.
- **Controlled autonomy:** it's fast when confident and defers to a human when not. It never pretends to know.

---

## 2. Scope

### In scope (prototype)
- Web dashboard for a SOC analyst (React)
- FastAPI backend with REST + WebSocket live updates
- Log simulator that produces normal traffic + attack scenarios
- The 4 pipeline stages wired together with LangGraph
- RAG over the MITRE ATT&CK Enterprise dataset in ChromaDB
- Local LLM (Llama 3.2 3B via Ollama), with no cloud LLM APIs
- Human approval queue for low-confidence verdicts
- Simulated firewall that records blocks (real firewall only behind an explicit flag)
- Audit trail of every decision
- Evaluation metrics + a repeatable demo

### Out of scope
- Mobile app
- Real production-scale ingestion (Kafka, ELK, etc.)
- Multi-tenant / user management beyond a simple login (optional)
- Changing the real host firewall during development

---

## 3. Tech stack

| Layer | Choice | Notes |
|---|---|---|
| Frontend | React + Vite + TypeScript + Tailwind CSS + shadcn/ui | Framer Motion for animation, lucide-react icons, React Router, TanStack Query |
| Charts | Recharts | Use sparingly |
| Backend | FastAPI (Python 3.11+) | Pydantic v2, Uvicorn |
| Orchestration | LangGraph | Shared `IncidentState` passed between nodes |
| LLM | Llama 3.2 3B (quantized) | Served by Ollama locally |
| Embeddings | `nomic-embed-text` via Ollama (fallback: `all-MiniLM-L6-v2`) | |
| Vector DB | ChromaDB | MITRE ATT&CK techniques |
| Relational DB | PostgreSQL | SQLAlchemy 2 + Alembic |
| Anomaly detection | Rule heuristics + scikit-learn Isolation Forest | 2-tier filter: cheap first, LLM only for relevant alerts |
| Infra | Docker Compose | postgres, chromadb, ollama |
| Testing | pytest, Vitest | |
| Dev OS | Windows + PowerShell, VS Code + Claude Code | |

---

## 4. Repository structure

```
Project-Drishti/
├── CLAUDE.md                     # short project memory for Claude Code (points to this plan)
├── README.md
├── LICENSE
├── .gitignore
├── .env.example
├── docker-compose.yml
├── docs/
│   ├── PROJECT_PLAN.md           # ← this file
│   ├── project-brief.md
│   ├── Project_Drishti_FYP_Presentation.pptx
│   ├── Project_Drishti_Architectural_Diagrams.pdf
│   └── decisions.md              # short log of design decisions
├── frontend/
│   └── src/
│       ├── app/                  # router, providers, root layout
│       ├── pages/                # Landing, Dashboard, Alerts, Investigations, Approvals, Logs, Settings
│       ├── components/
│       │   ├── ui/               # shadcn
│       │   ├── layout/           # Sidebar, Topbar, PageShell
│       │   ├── animation/        # PipelineScene (hero), agent illustrations
│       │   └── agents/           # AgentBadge, AgentCard, StageTimeline
│       ├── features/             # alerts/, incidents/, approvals/, logs/
│       ├── lib/                  # api.ts, ws.ts, utils, constants
│       ├── mocks/                # mock data for UI-first development
│       ├── types/                # shared TS types
│       └── styles/               # tokens.css
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── core/                 # config.py, logging.py
│   │   ├── api/v1/routes/        # logs, alerts, incidents, approvals, actions, stats, ws
│   │   ├── agents/               # watcher.py, detective.py, confidence_gate.py, bouncer.py
│   │   ├── orchestration/        # state.py, graph.py
│   │   ├── rag/                  # ingest_mitre.py, retriever.py
│   │   ├── llm/                  # ollama_client.py, prompts/
│   │   ├── mitigation/           # base.py, simulated.py, windows_firewall.py (disabled), iptables.py (disabled)
│   │   ├── db/                   # models.py, session.py, migrations/
│   │   ├── schemas/              # Pydantic models
│   │   └── services/             # incident_service, audit_service
│   ├── tests/
│   └── requirements.txt
├── data/
│   ├── sample_logs/
│   └── mitre/                    # enterprise-attack.json (downloaded)
├── scripts/
│   ├── simulate_logs.py          # normal + attack traffic generator
│   ├── seed_db.py
│   └── run_demo.py               # replays a scripted demo
└── evaluation/
    ├── datasets/
    ├── run_eval.py
    └── results/
```

---

## 5. Design system (frontend)

### Feel
Minimal, calm and confident, with very little text. It should look like a premium tool, not a hacker movie. Friendly rounded agent characters. Space and motion do the explaining, not paragraphs.

### Color tokens
| Token | Hex | Use |
|---|---|---|
| `--bg` (jet black) | `#0B0C0F` | page background |
| `--surface` | `#12151C` | sidebar, top bar |
| `--card` | `#171B24` | cards, panels |
| `--border` | `#232A36` | hairlines |
| `--primary` (cerulean) | `#1E9BD7` | primary actions, Drishti identity |
| `--primary-deep` | `#007BA7` | pressed/hover, gradients |
| `--primary-glow` | `#4FC3F7` | glows, highlights |
| `--threat` (neon rose) | `#FF3D81` | **only** threats, alerts, blocked items |
| `--success` | `#2ED3A0` | safe/resolved |
| `--warning` | `#F5B544` | needs approval |
| `--text` | `#E8EEF5` | main text |
| `--muted` | `#8A94A6` | secondary text |

Don't use flat black. Add subtle cerulean radial glows, a faint grid or noise texture, and soft 1px borders. Neon rose is rare, so when it appears, it means something.

### Typography
- UI: **Inter** or **Geist**
- Logs / IPs / technique IDs: **JetBrains Mono**

### Agent identities
| Agent | Character | Accent |
|---|---|---|
| Watcher | A glowing eye with a scanning beam | cerulean |
| Detective | A small robot with a magnifier | cerulean-glow |
| Confidence Gate | A circular dial / gauge | cerulean → success / warning |
| Bouncer | A friendly bodyguard robot with a shield | cerulean, rose on impact |

### Rules
- At most 1–2 lines of text per section on the landing page
- Logs, investigations and graphs live in **separate tabs/pages**, not one long dashboard
- Few charts. Show a chart only when it answers a question.
- Every animation respects `prefers-reduced-motion`
- Responsive down to mobile width

---

## 6. Frontend pages

### 6.1 Landing (`/`)
**Hero (split screen):**
- Left: "Drishti", tagline, one short line, buttons **Open Dashboard** / **How it works**
- Right: **PipelineScene** animation (spec below)

**Below the hero:** four scroll sections, one per stage. The illustration alternates left/right, with 1–2 lines of description on the other side, revealed on scroll.
**Footer:** team names, college, year.

#### PipelineScene: "The Watching Railway" (11 s loop, SVG, `components/animation/pipeline/`)
A toy railway seen from above. Log carriages circle a track loop around one large eye on a signal tower.
1. **Watcher:** the eye idly follows carriages, then one carriage blushes **neon rose**. The pupil tightens, the iris fibres turn, and a dotted line of sight locks onto it.
2. **Detective:** a round bird with a loupe flies from its perch, rides the rogue carriage, and a `T1110` tag pops up.
3. **Confidence Gate:** a ring dial fills to **92** (green), and the track switch throws so the rogue rolls onto a spur.
4. **Bouncer:** a stern buffer stop with a spring. The carriage hits it, bounces, shakes and dissolves into rose sparks. The eye blinks.
5. **Every 3rd loop:** the dial stops at **64** (amber). The carriage halts at a platform, the dozing analyst wakes and approves with a check, and only then does it roll on to the Bouncer.
The scene is a pure function of loop time (`timeline.ts`). Reduced motion shows a single still frame. In dev, `?t=6.3&loop=2` freezes any frame.

### 6.2 Dashboard (`/dashboard`)
- 4 stat tiles: Logs processed · Threats detected · Auto-blocked · Awaiting approval
- **Live pipeline strip:** the 4 stages with live counts and a pulse when an incident moves through
- **Live incident feed** (latest 10): severity dot, technique, source IP, stage, time
- One small chart: threats over time (last 24 h)

### 6.3 Alerts (`/alerts`)
Table of Watcher alerts with filters (severity, status, source IP).

### 6.4 Investigations (`/investigations/:id`)
For one incident:
- Timeline of stages (Watcher → Detective → Gate → Bouncer/Human)
- Detective reasoning summary, MITRE matches with similarity scores, related events
- "Context requests" panel showing Detective → Watcher back-and-forth
- Confidence breakdown (which factors contributed)
- Action taken + audit entries

### 6.5 Approvals (`/approvals`)
Queue of < 80% incidents. Each card shows the incident summary, confidence, the suggested action, and **Approve / Reject / Escalate** buttons.

### 6.6 Logs (`/logs`)
Raw log explorer with search and a live-tail toggle.

### 6.7 Settings (`/settings`)
Confidence threshold slider (default 80), mitigation mode (Simulated / Real, with a warning), simulator controls (start/stop, attack scenario).

---

## 7. Backend design

### 7.1 Data model (PostgreSQL)

| Table | Key columns |
|---|---|
| `logs` | id, timestamp, source (ssh/web/firewall/system), src_ip, dst_ip, user, event_type, raw, parsed (JSONB) |
| `alerts` | id, created_at, log_ids[], anomaly_score, rule_hits[], severity, status |
| `incidents` | id, alert_id, state (JSONB snapshot), stage, technique_id, technique_name, confidence, decision (auto/human), status (open/blocked/approved/rejected/escalated), created_at, closed_at |
| `context_requests` | id, incident_id, requested_by, query, result_summary, created_at |
| `actions` | id, incident_id, type (block_ip/rate_limit/disable_user), target, mode (simulated/real), executed_by (bouncer/analyst), success, created_at |
| `approvals` | id, incident_id, analyst, decision, comment, created_at |
| `audit_log` | id, incident_id, actor, event, details (JSONB), created_at |
| `blocklist` | ip, reason, incident_id, created_at, expires_at |

### 7.2 LangGraph state

```python
class IncidentState(TypedDict):
    incident_id: str
    alert: dict                    # from Watcher
    related_events: list[dict]     # historical context
    mitre_matches: list[dict]      # top-k from ChromaDB: id, name, tactic, similarity
    llm_verdict: dict              # technique, is_malicious, reasoning, llm_confidence, needs_more_context, context_query
    context_requests: int          # loop counter (max 2)
    confidence: float              # 0–1 from the gate
    confidence_breakdown: dict
    decision: Literal["auto", "human", "dismiss"]
    action: dict | None
    audit: list[dict]
```

### 7.3 Graph

```
watcher ─► detective ─┬─► confidence_gate ─┬─► bouncer ─► END
            ▲         │                    ├─► human_review (pause) ─► bouncer / END
            └─────────┘                    └─► dismiss ─► END
   (needs_more_context and context_requests < 2 → back to watcher.fetch_context)
```

### 7.4 Agent specs

**Watcher**
- Input: parsed logs (batch or stream)
- Tier 1 rules: e.g. ≥ 5 failed SSH logins from one IP in 60 s; port sweep (≥ 20 ports in 30 s); SQLi/XSS patterns in web paths; login at unusual hour; known-bad IP
- Tier 2: Isolation Forest on per-IP feature windows (request rate, failure ratio, distinct ports, distinct users)
- Deduplicate / correlate alerts from the same source in a time window
- `fetch_context(query)`: returns past events for the IP/user/host from PostgreSQL
- Output: `alert` + initial `related_events`

**Detective**
- Builds a query from the alert, then retrieves the top-3 MITRE techniques from ChromaDB
- Prompts Llama 3.2 with: alert + related events + MITRE matches. It must return **strict JSON** (validated by Pydantic; retry once on bad JSON).
- If `needs_more_context` is true, it sets `context_query` and the graph loops to Watcher (max 2 times)
- Output: `llm_verdict`

**Confidence Gate**
- Initial formula (to be calibrated in Phase 7):
  `confidence = 0.30·anomaly_score + 0.30·top_mitre_similarity + 0.30·llm_confidence + 0.10·history_signal`
- `confidence ≥ threshold (0.80)` and malicious → `auto`
- `0.40 ≤ confidence < threshold` → `human`
- `< 0.40` and not malicious → `dismiss` (still logged)
- Stores `confidence_breakdown` for the UI

**Bouncer**
- Adapter interface: `execute(action) -> result`
- `SimulatedFirewall` (default) writes to the `blocklist` table, and the simulator drops traffic from blocked IPs
- Real adapters exist but stay disabled unless `MITIGATION_MODE=real` **and** the IP is not in an allowlist (never block localhost, the gateway, or the dev machine)
- Every action goes to the `audit_log`

### 7.5 API (v1)

| Method | Path | Purpose |
|---|---|---|
| GET | `/health` | status of db, chroma, ollama |
| POST | `/api/v1/logs/ingest` | ingest one or many logs |
| GET | `/api/v1/logs` | list/search logs |
| GET | `/api/v1/alerts` | list alerts |
| GET | `/api/v1/incidents` | list incidents |
| GET | `/api/v1/incidents/{id}` | full investigation detail |
| GET | `/api/v1/approvals` | pending approvals |
| POST | `/api/v1/approvals/{id}` | approve / reject / escalate |
| GET | `/api/v1/actions` | mitigation history |
| GET | `/api/v1/stats` | dashboard tiles + chart data |
| GET/PUT | `/api/v1/settings` | threshold, mitigation mode |
| POST | `/api/v1/simulator/start` / `stop` | control the log simulator |
| WS | `/api/v1/ws/events` | live events: `log`, `alert`, `stage_change`, `incident_closed`, `approval_needed` |

The frontend `types/` must mirror these schemas exactly.

---

## 8. Attack scenarios (for simulator, demo and evaluation)

| Scenario | Log source | Expected technique | Expected path |
|---|---|---|---|
| SSH brute force | ssh/auth | T1110 Brute Force | Auto-block (high confidence) |
| Port scan | firewall | T1046 Network Service Discovery | Auto-block |
| SQL injection attempts | web | T1190 Exploit Public-Facing Application | Auto-block or human |
| Valid login at 3 AM from new country | auth | T1078 Valid Accounts | **Human review** (ambiguous) |
| Unknown odd behaviour | mixed | none / weak match | **Human review**, escalated |
| Normal traffic | all | none | No alert (false-positive check) |

---

## 9. Build phases

> Rule: finish, run, and commit each phase before starting the next. Frontend first, using mock data, then the backend replaces the mocks.

### Phase 0 — Setup ✅ when the repo skeleton runs
- [x] Monorepo folder structure created (section 4)
- [x] `CLAUDE.md` written (short; points to this plan)
- [x] Frontend scaffolded: Vite + React + TS + Tailwind + shadcn + Router + Framer Motion; `npm run dev` works
- [x] Backend skeleton: FastAPI `/health`, `requirements.txt`, venv instructions
- [x] `.gitignore`, `.env.example`, `docker-compose.yml` (stubs)
- [x] README rewritten

### Phase 1 — Design system + Landing page
- [x] Color tokens + fonts + background glow/grid
- [ ] Layout primitives (PageShell, Sidebar, Topbar)
- [x] **PipelineScene** hero animation (section 6.1 spec)
- [ ] Four agent scroll sections (alternating left/right)
- [ ] Footer
- [ ] Reduced-motion + mobile check

### Phase 2 — Dashboard UI on mock data
- [ ] `types/` for Log, Alert, Incident, Action, Approval, Stats
- [ ] `mocks/` with realistic data for all scenarios in section 8
- [ ] Dashboard page (tiles, live pipeline strip, feed, one chart)
- [ ] Alerts, Investigation detail, Approvals, Logs, Settings pages
- [ ] Fake "live" updates via a mock event emitter

### Phase 3 — Backend foundation
- [ ] Docker Compose: PostgreSQL, ChromaDB, Ollama up and running
- [ ] SQLAlchemy models + Alembic migration (section 7.1)
- [ ] Pydantic schemas
- [ ] Log ingest + list endpoints
- [ ] `scripts/simulate_logs.py` (normal + all attack scenarios)
- [ ] WebSocket `/ws/events` broadcasting new logs

### Phase 4 — Watcher
- [ ] Log parsers for ssh / web / firewall
- [ ] Tier-1 rules
- [ ] Tier-2 Isolation Forest (train on normal simulated traffic)
- [ ] Alert dedup/correlation
- [ ] `fetch_context()`
- [ ] Unit tests for each rule

### Phase 5 — RAG + Detective
- [ ] Download MITRE ATT&CK Enterprise JSON into `data/mitre/`
- [ ] `ingest_mitre.py`: technique id, name, tactic, description into ChromaDB
- [ ] Retriever (top-k with similarity)
- [ ] Ollama client + Detective prompt with strict JSON output
- [ ] Context-request loop (max 2)
- [ ] Tests with fixed sample alerts

### Phase 6 — Orchestration, Gate, Bouncer, Human-in-the-loop
- [ ] `IncidentState` + LangGraph graph (section 7.3)
- [ ] Confidence Gate with breakdown
- [ ] Bouncer with SimulatedFirewall + allowlist guard
- [ ] Human review pause/resume via the Approvals API
- [ ] Audit log on every step
- [ ] WebSocket events for stage changes

### Phase 7 — Connect frontend to backend
- [ ] Replace mocks with API + WebSocket (keep mocks behind a `VITE_USE_MOCKS` flag for offline demos)
- [ ] Live pipeline strip driven by real `stage_change` events
- [ ] Approve/Reject from the UI resumes the graph
- [ ] Settings page changes threshold + mitigation mode

### Phase 8 — Evaluation + calibration
- [ ] Labelled scenario dataset in `evaluation/datasets/`
- [ ] `run_eval.py` computing:
  - Watcher: precision, recall, F1, false-positive rate
  - RAG: top-k hit rate for the expected technique
  - Detective: classification accuracy, consistency across repeated runs
  - System: end-to-end latency, auto-mitigation rate, escalation rate
- [ ] Calibrate the 80% threshold and gate weights; record it in `docs/decisions.md`
- [ ] Results table + charts in `evaluation/results/`

### Phase 9 — Demo, docs, polish
- [ ] `scripts/run_demo.py`: a scripted 3-minute demo (normal → brute force auto-block → ambiguous login to human approval)
- [ ] README with screenshots/GIF, setup steps, architecture image
- [ ] Final UI polish pass
- [ ] Report material: architecture, results, limitations, future work

---

## 10. Suggested timeline (edit to match college deadlines)

| Week | Phase |
|---|---|
| 1 | Phase 0 + Phase 1 |
| 2 | Phase 2 |
| 3 | Phase 3 |
| 4 | Phase 4 |
| 5 | Phase 5 |
| 6 | Phase 6 |
| 7 | Phase 7 |
| 8 | Phase 8 |
| 9+ | Phase 9 + buffer for reviews |

---

## 11. Conventions

**General**
- One feature per branch: `feat/landing-hero`, `feat/watcher-rules`, etc. Small commits.
- Commit format: `feat: …`, `fix: …`, `docs: …`, `refactor: …`, `test: …`
- No secrets in git. Use `.env` (copied from `.env.example`).

**Frontend**
- TypeScript strict, functional components, hooks
- Tailwind only (no separate CSS files except `tokens.css`)
- shadcn/ui for primitives, customised to the tokens
- Components under ~200 lines; split otherwise
- Data access only through `lib/api.ts` / TanStack Query

**Backend**
- Type hints everywhere, Pydantic for all I/O
- Business logic in `agents/` and `services/`, not in routes
- LLM prompts live in `llm/prompts/` as files, not inline strings
- All LLM output parsed and validated. Never trust raw text.
- Every agent decision writes an audit entry

**Safety**
- Mitigation is **simulated by default**
- Never block localhost, private gateway, or allowlisted IPs
- Real firewall mode needs an env flag **and** a UI confirmation

---

## 12. Risks & mitigations

| Risk | Mitigation |
|---|---|
| Llama 3.2 3B gives weak or inconsistent reasoning | Strict JSON schema, low temperature, few-shot examples, RAG grounding, confidence gate sends doubtful cases to a human |
| Slow LLM on a laptop | Watcher filters first; only alerts reach the LLM; cache embeddings; show latency honestly |
| Bad JSON from the LLM | Pydantic validation + one retry + fallback to human review |
| Firewall action locks out the dev machine | Simulated mode default + allowlist |
| Scope creep | Stick to the phases; extras go to the "Future" list |
| Demo fails live | `VITE_USE_MOCKS` offline mode + recorded GIF backup |

---

## 13. Future scope (not now)
Larger local models · more knowledge sources (CVE, threat intel feeds) · advanced anomaly detection · production-scale ingestion · more response actions · continuous learning from analyst feedback.

---

## 14. How to work with Claude Code on this project

1. Start every session with: *"Read docs/PROJECT_PLAN.md and CLAUDE.md. We are on Phase X, task Y."*
2. Use **plan mode** for anything bigger than a small fix; review the plan, then approve.
3. Ask for one task at a time. Run it, check it, commit it.
4. After finishing a task, Claude Code ticks the checkbox above and adds a line to the Progress Log.
5. If a design decision changes, record it in `docs/decisions.md` and update this plan.

---

## Progress Log

| Date | Phase | What was done |
|---|---|---|
| 2026-10-22 | — | Master plan created |
| 2026-10-22 | 0 | Monorepo skeleton: frontend (Vite/Tailwind v4/shadcn/Router), backend (/health), compose, docs, CLAUDE.md |
| 2026-10-22 | 1 | Hero + PipelineScene ("Watching Railway": Iris eye + toy railway), glow token, MotionConfig reduced motion |

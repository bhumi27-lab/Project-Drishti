# Design decisions

Short log. Newest first. Format: date, decision, why.

| Date | Decision | Why |
|---|---|---|
| 2026-10-22 | UI data flows only through `lib/api.ts` + `lib/live.ts`; mocks implement the same contract (store + emitter) | Phase 7 swaps the backend in without touching pages |
| 2026-10-22 | Confidence rings are coloured by the gate's recorded decision, not today's threshold | Raising the threshold must not repaint history |
| 2026-10-22 | API additions: `Log.alert_id`, alert `src_ip/source/incident_id`, `dismissed` status, `GET /logs?alert_id`, `POST /simulator/inject` | Needed by the Logs markers, Alerts filters, Evidence panel and Settings → Run now |
| 2026-10-22 | Hero animation is "The Watching Railway" (Iris eye + toy railway), replacing the original conveyor storyboard | Chosen from three pitched concepts; reads at a glance and shows the auto vs human fork as a physical track split |
| 2026-10-22 | Mitigation is simulated by default; real firewall needs env flag and UI confirmation | A wrong block must never lock out the dev machine |
| 2026-10-22 | ChromaDB is exposed on host port 8001 | Port 8000 belongs to the FastAPI backend |
| 2026-10-22 | Tailwind v4 + shadcn; colour tokens live in `frontend/src/styles/tokens.css` | One source of truth for the palette |

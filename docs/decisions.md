# Design decisions

Short log. Newest first. Format: date, decision, why.

| Date | Decision | Why |
|---|---|---|
| 2026-10-22 | Hero animation is "The Watching Railway" (Iris eye + toy railway), replacing the original conveyor storyboard | Chosen from three pitched concepts; reads at a glance and shows the auto vs human fork as a physical track split |
| 2026-10-22 | Mitigation is simulated by default; real firewall needs env flag and UI confirmation | A wrong block must never lock out the dev machine |
| 2026-10-22 | ChromaDB is exposed on host port 8001 | Port 8000 belongs to the FastAPI backend |
| 2026-10-22 | Tailwind v4 + shadcn; colour tokens live in `frontend/src/styles/tokens.css` | One source of truth for the palette |

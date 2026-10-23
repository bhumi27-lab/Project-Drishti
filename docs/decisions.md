# Design decisions

Short log. Newest first. Format: date, decision, why.

| Date | Decision | Why |
|---|---|---|
| 2026-10-23 | Palette "Acid Moss" replaces "Obsidian Iris" + cerulean/rose: lime #C8FF3D identity and actions, sage #5E7A63 borders, coral #FF5A4E threats only, sage-white #D7E3D2 text and headline accents. Tokens renamed: primary/primary-deep/primary-light/sage (primary-glow, periwinkle, cerulean dropped) | Requested redesign; one accent colour plus neutrals, coral kept rare so it still means "threat" |
| 2026-10-23 | Text colours: cerulean #007BA7 (#1A9BD0 for small text) for headings, labels, titles, links, buttons; rose moves to #FF2D95 and also marks headline accent words + the tagline. Ultramarine stays for light only (fibres, iris, glows, illustrations, charts) | Requested look; keeping the two blues in separate roles avoids a cerulean/ultramarine clash on buttons and logo. #007BA7 is ~4.2:1 on #07060C, so small text uses the lighter tint |
| 2026-10-22 | Palette "Obsidian Iris" (ultramarine #3D5AFE, periwinkle, rose #FF2E6E) replaces cerulean; Unbounded + Instrument Serif + Inter replace Geist | Landing v2 redesign; one palette for landing and dashboard |
| 2026-10-22 | Hero/eye in three.js + react-three-fiber with custom shaders; scroll via CSS sticky + Framer `useScroll` (no GSAP); Lenis on the landing only | One morphing shader keeps strands, tips and beads in sync; lazy chunk (~246 KB gz) loads after first paint |
| 2026-10-22 | UI data flows only through `lib/api.ts` + `lib/live.ts`; mocks implement the same contract (store + emitter) | Phase 7 swaps the backend in without touching pages |
| 2026-10-22 | Confidence rings are coloured by the gate's recorded decision, not today's threshold | Raising the threshold must not repaint history |
| 2026-10-22 | API additions: `Log.alert_id`, alert `src_ip/source/incident_id`, `dismissed` status, `GET /logs?alert_id`, `POST /simulator/inject` | Needed by the Logs markers, Alerts filters, Evidence panel and Settings → Run now |
| 2026-10-22 | Hero animation is "The Watching Railway" (Iris eye + toy railway), replacing the original conveyor storyboard | Chosen from three pitched concepts; reads at a glance and shows the auto vs human fork as a physical track split |
| 2026-10-22 | Mitigation is simulated by default; real firewall needs env flag and UI confirmation | A wrong block must never lock out the dev machine |
| 2026-10-22 | ChromaDB is exposed on host port 8001 | Port 8000 belongs to the FastAPI backend |
| 2026-10-22 | Tailwind v4 + shadcn; colour tokens live in `frontend/src/styles/tokens.css` | One source of truth for the palette |

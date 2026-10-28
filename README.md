# MewLink — independent working copy

Public prototype: https://mewlink-design-copy.vercel.app/#today

Repository: https://github.com/zby336/mewlink-prototype-v3

Figma working copy: https://www.figma.com/design/mjKHxlL2JUoyMlluQcqZls

The Figma file currently contains the earlier editable designs. Synchronization with the approved website is pending: the account's MCP editing quota is exhausted and its existing HTML import plugin fails to start. Do not treat the existing Figma file as the latest website design.

This repository belongs to the independent working version. It does not deploy the earlier, different `mewlink` project or the original Netlify site.

## Approved website release — 2026-10-28

This source and committed `dist/` match all 56 public files in the user-approved Vercel release `dpl_7Ub1ipNbsmFuRNfouwpsciMaJ65g`. GitHub synchronization was explicitly authorized after website acceptance. The existing repository was renamed from `mewlink-design-copy` to `mewlink-prototype-v3` (repository ID 1436038417).

Feature & UX Update 02 adds shared local care records, sourced rule-based Ask Mew retrieval and next-care suggestions, a Community social feed, and final-save-only feeding through the existing CareUpdate flow. The final UI polish aligns Cat profile with Like/Comment, places the caregiver stack on the right below the cat photo, removes visible demo badges and suppresses the duplicate stock observation disclaimer. See docs/approved-release.md for the accepted release and docs/feature-update-02.md for the earlier validation checkpoint.

## Feature Update 01 retained

- Compact caregiver avatar stacks on every available cat profile, using each person's latest valid care record and Singapore calendar dates.
- Four fading bands: 0–7 days 98%, 8–14 days 76%, 15–21 days 54%, 22–30 days 32%. More than 30 days is excluded. Counts are deduplicated; sightings, observations alone and offers to help are excluded.
- Stable per-browser shuffled order, at most five public avatars, and a +N overflow indicator.
- Caregiver details, individual/all-avatar display preferences, and a local demo identity-privacy switch. Private identities are omitted from presentation data and the expanded list while still counted.
- A viewport-bounded feeding sheet with a scrollable body, fixed action footer, bottom safe-area padding, keyboard containment and hidden underlying navigation.
- Profiles for the other existing cats reuse the current visual style and data. Tiger's observations, handover notes, photo diary and care update action remain.

## Data and privacy boundaries

All care records are demo data or locally saved prototype actions. There is no real account system, database, verified camera capture or cross-user privacy enforcement. Initials avatars match the existing circle's style; the four named demo caregivers are Aisha, Ravi, Wei and Mei Ling.

The demo fixture is timestamped once on the first visit and stored in the browser. It ages naturally instead of resetting its dates on every render. Only final confirmation appends a structured care record. Another cat requires an explicit selection; Not sure stores an unmatched record and does not change a cat's feeding state. Saving a note never publishes a feed post; sharing is a separate explicit action.

Hiding one or all avatars changes only this viewer's display settings. The own-identity switch simulates privacy only on this browser. Visible demo badges were removed at the user's request; the data and privacy boundaries remain documented here.

No LLM endpoint, vector database, AI API or backend is configured. Ask Mew and next-care suggestions use deterministic local record retrieval and curated guidance with dated sources. The draft action groups the user's own sentences. None of these are a live generative AI service.

## Work locally

Node.js 22 or newer; no runtime dependencies.

~~~sh
npm ci
npm test
npm run build
npm run dev
~~~

The local preview listens at http://127.0.0.1:4173.

- `src/*.dc.html`: readable original screen logic and templates.
- `public/caregiver-model.js`: recency, filtering, deduplication, stable order and local persistence.
- `public/caregiver-ui.js`: avatar/details components and reusable profiles.
- `public/care-knowledge.js`: shared saved-care store, drafts, identity confirmation, sharing, local retrieval and suggestions.
- `public/knowledge-ui.js`: observation cards/logs, sourced suggestions and Community feed.
- `public/update02.css`: focused Feature Update 02 styles.
- `public/feature-update.css`: feeding-sheet layout.
- `scripts/build.mjs`: builds the portable original runtime and assets into `dist/`.
- `dist/`: committed static deployment output.

The original bundled runtime, fonts, React vendor files and cat photos are preserved. Immutable font/vendor resources remain packed in vendor/ and are rebuilt without network access; UI source stays readable in src/. Photos remain the original Unsplash prototype references.

## Validation

27 automated tests cover caregiver recency/privacy, Singapore dates, drafts, identity selection, unmatched notes, final-save-only feeding, duplicate saves, sharing separation, knowledge retrieval, sources and failure to persist. All passed again when synchronizing this approved release to GitHub.

Browser tests completed the Tiger feeding flow at 360×640, 375×667, 390×844 and 1280×720. A 360×420 case also confirmed inner scrolling with an unobstructed footer. Existing Today, Cats, Community, Ask Mew and care-entry flows are checked separately.

Figma is an editable design reference. Website updates require code changes and a new deployment; editing Figma alone does not update the site.

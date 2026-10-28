# MewLink Feature & UX Update 02 — delivery checkpoint

Historical checkpoint. See [approved-release.md](approved-release.md) for the subsequently accepted UI polish, renamed repository, GitHub authorization and current Figma status.

Date: 2026-10-28, Asia/Singapore. No GitHub writes, push or PR were performed.

## Website

Production: https://mewlink-design-copy.vercel.app/#today

Deployment: dpl_4pentbe3XUR5gY9CH2QJF9QMqtMA (READY), project prj_fS9ASrBNwGmu1zLARZQzYWWerC0u.

1. All six profiles use a compact Latest observation card with a top-right status, primary observation text and a small bottom disclaimer. Existing caregiver stacks remain.
2. Ask Mew performs local structured-record and keyword retrieval, attaching response-time snapshots and dated sources. Feeding responses distinguish confirmed records, absent confirmation and reports requiring reconciliation. Absence is not treated as proof of no feeding.
3. Today no longer contains the circle feed. Community contains the social feed followed by existing group chats. Local likes, comments and explicitly shared posts persist in the browser. Social posts do not create care evidence.
4. Next-care suggestions use the same observation store and source renderer. Two to four rules-based suggestions include recorded handovers, source links and the latest underlying update time. AI badge is accompanied by an explicit local-rule demo label.
5. Today feeding preparation enters the existing CareUpdate component at Your words. The original Review Note, Confirm Cat, Check Before Saving and Success steps remain. Final save is idempotent. Another cat requires a selection; Not sure saves a private unmatched record without affecting a cat profile, count or feeding state. Saving never publishes a feed post. Drafts resume per cat and retain photos, words, time and care metadata.

## Data and AI boundaries

No LLM endpoint, vector database or real RAG service is configured. The assistant and handover suggestions use deterministic local retrieval/rules. The Demo draft only groups the user's sentences; it does not invent observations. Source fixtures are demo records anchored once and aged by Singapore dates. User prototype actions are structured browser-local records. There is no real account/circle authorization, cross-user privacy enforcement, multi-device sync or independently verified feeding/camera record.

General knowledge is a small curated, paraphrased snapshot reviewed on 2026-10-28:

- Cat Welfare Society: https://www.catwelfare.org/responsible-caregiving/
- Cornell Feline Health Center: https://www.vet.cornell.edu/departments-centers-and-institutes/cornell-feline-health-center/health-information/feline-health-topics/anorexia
- AVS: https://www.nparks.gov.sg/-/media/avs/cat-management-framework/avs-handbook-for-cat-caregiving-guidelines.pdf

Voice recording/transcription, photo capture and the legacy memory editor continue as prototype demonstrations. The memory editor now uses the current saved record's photo and cat name.

## Validation

- 27 automated tests passed: 10 previous caregiver tests and 17 new flow/retrieval tests, including Singapore dates, privacy filtering, failure to persist, identity selection, unmatched records, no premature feeding, no automatic sharing and duplicate saves.
- Browser: 360×640 complete Another cat → Ash save; 375×667 Manual → Not sure save; 390×844 Demo draft → Yes Tiger save and updated profile/assistant; 1280×720 desktop rendering and six profile checks.
- Back, Cancel, draft resume, editable review, original-input comparison, identity-required disabled state, Like, Comment, Share Update, group-chat access/send, source expansion and refreshed suggestions were exercised.
- Production 360×640: complete Ash save, rapid double save, success remains visible, cancel sharing, explicit sharing, Community post appearance, Make a memory and Ask Mew retrieving exactly one new feeding record.
- All 56 public deployment files match local build SHA1 hashes. No warnings/errors were captured on the corrected preview or production checks. No physical iPhone test.
- Resolved: a template pseudo-style compilation error blocked Ask Mew; rapid double save could click through to Done. Both have been corrected and production checked.

## Figma — NOT COMPLETE

File: https://www.figma.com/design/mjKHxlL2JUoyMlluQcqZls

The Figma Starter MCP call limit prevented completion. A first in-place observation-card edit stopped on an unsupported alignment enum. That call may have partially changed card 3:1167. Subsequent read/repair calls were refused by the account quota, so its current state could not be verified. The browser editor also reported a saving-connection issue; no blind rollback was attempted.

Before resuming, inspect 3:1167 and its parent in the actual file, repair the partial card, then synchronize the remaining views. Prepared script: work/update02-figma-resume.js in the chat workspace (outside this project). Do not blindly rerun the original source-edit script or create duplicate design boards. Figma and website are not yet fully synchronized.

## Source and later GitHub sync

The current source is in work/mewlink-project. New modules: public/care-knowledge.js, public/knowledge-ui.js, public/update02.css and tests/knowledge-flow.test.cjs. Existing Home, App, CareUpdate, MemoryEditor, template and caregiver source files were edited in place. dist is generated by npm run build.

Local HEAD remains 6688d0aab0f400f811c5292d6b8f1afa302cc2cb. Update 02 changes are uncommitted local files. After explicit user authorization, inspect the diff and current remote head, run npm test and npm run build, then commit and push only this dedicated repository. No GitHub change is needed for the already completed Vercel release.

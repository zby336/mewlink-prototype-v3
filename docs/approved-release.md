# Approved MewLink release — 2026-10-28

The user accepted https://mewlink-design-copy.vercel.app/#today and explicitly authorized GitHub synchronization. This supersedes the earlier prohibition on GitHub writes; the previous delivery checkpoint remains historical.

## Website and source correspondence

- Dedicated public repository: https://github.com/zby336/mewlink-prototype-v3 (ID 1436038417; formerly mewlink-design-copy).
- Vercel project: prj_fS9ASrBNwGmu1zLARZQzYWWerC0u.
- Accepted production deployment: dpl_7Ub1ipNbsmFuRNfouwpsciMaJ65g.
- All 56 production files were fetched and matched against the rebuilt local SHA1 manifest on 2026-10-28.
- `npm test`: 27 passed, 0 failed. `npm run build`: 56 files, 1,026,673 bytes.
- Publishing this repository does not require another deployment of the already accepted website.

## Accepted changes

1. Compact Latest observation card with a top-right status, primary note and one small diagnosis disclaimer. Meaningful uncertainty remains visible.
2. Ask Mew retrieves permitted prototype records and curated guidance, with source links/times and confirmed / no confirmation / conflicting report distinctions.
3. Community contains Social Feed and existing Group Chats. Likes, comments and explicitly shared posts persist locally; social posts are not feeding evidence. Cat profile aligns to the right of Like and Comment on one row.
4. Next-care suggestions use the same records and sources. Two to four deterministic suggestions can refresh after a saved update.
5. I fed [Cat] enters the existing Your words / Review / Confirm Cat / Check / Success flow. Only final save changes records and feeding state. Another cat requires selection; Not sure creates an unmatched note. Drafts retain words/photos/time, repeated save is idempotent, and publishing requires a separate confirmation.
6. Previous fading caregiver avatars and responsive feeding sheets remain. Avatars sit to the right of the cat name/Zone row below the photo. Visible demo badges and a duplicate stock disclaimer were removed at the user's request.

## Validation already completed

- Browser layouts and care flows at 360×640, 375×667, 390×844 and 1280×720.
- Manual and draft entry, Back/Cancel, draft recovery, Another cat, Not sure, duplicate save, private save followed by optional sharing, Make a memory and updated Ask Mew answers.
- Six cat profiles, source expansion, refreshed suggestions, Like/Comment/Share and existing group-chat access/send.
- Final UI alignment checked in the browser after polish. No physical iPhone was used.

## Data and AI boundaries

This remains a front-end prototype: seeded fixture records plus browser-local user actions. There is no real account service, cross-user authorization/privacy, shared database or multi-device synchronization. Ask Mew and suggestions use local rules/retrieval; no LLM or vector RAG service is connected. Draft generation organizes the user's own text. Removing visible demo badges does not change these implementation limits. Trusted-care source URLs and timestamps remain available through Sources.

## Figma status

Working copy: https://www.figma.com/design/mjKHxlL2JUoyMlluQcqZls

Earlier editable designs remain in this file. Synchronization of the approved release has not been verified: the Figma Starter MCP edit quota is exhausted, and the existing html.to.design plugin reports that its environment cannot load, including in a separate new browser tab. The original browser tab was not refreshed because unsaved edits might be lost. An earlier partial edit to card 3:1167 must be inspected before any in-place repair. Do not label the existing Figma file as fully synchronized.

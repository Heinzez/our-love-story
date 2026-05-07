## Scope

Big batch — splitting into **Phase A (this turn, critical)** and **Phase B (follow-up)** so we ship reliably.

---

## Phase A — Ship this turn

### 1. Session persistence + auto-logout + sign out
- Move auth state from in-memory → `localStorage` (`queen-auth`, `queen-admin-token`, `queen-role`).
- On app load, restore session if token still valid (verify admin token against `admin_sessions.expires_at` via edge fn; viewer = trust local flag).
- Idle timer: 2 min of no mouse/key/touch → clear session → back to gate.
- Browser-close logout: keep `localStorage` for normal reload, but clear on `visibilitychange`+`pagehide` if `sessionStorage` flag missing (so a true close kills it, but reload survives). Trade-off: simplest reliable approach is `sessionStorage` for token + `localStorage` for "remember answer for the day" — I'll use `sessionStorage` so reload within tab survives, full close logs out. Reload across pages already works with sessionStorage.
- Sign-out button in the existing "More" navbar dropdown.

### 2. Auto-reply when admin offline
- Add `auto_replies` rotation list (in code, ~10 heartfelt lines).
- In `chat` edge function `send` action: check most recent `me`-sender message timestamp; if no admin reply in last 10 min AND last 3 messages are all from `her`, insert a rotating auto-reply with `is_ai = true` (so it's marked subtly).
- Frontend already renders `is_ai`.

### 3. Admin gallery shows ALL images (fix 37 missing)
- Bug: gallery in admin reads from `pageImages` context which paginates/loads via `refreshPageData`. Verify the query has no implicit 1000-limit issue and is grouped correctly. Add explicit `.limit(2000)` and ensure ordering by `sort_order, created_at`.
- If still missing, query directly in admin editor with no filter.

### 4. "Photos added by you" counter excludes admin uploads
- Add `uploaded_by` column to `page_images` (`'her' | 'admin'`).
- Public upload path → `'her'`; admin upload path → `'admin'`.
- Landing counter filters `uploaded_by = 'her'`.

### 5. Multi-image upload (her + admin)
- Switch file input to `multiple`; loop sequential uploads with per-file progress.

### 6. Upload progress + retry (images/videos/audio)
- Show progress bar per file (use existing `Progress` component).
- On failure, display "Retry" button that re-runs that single upload.
- Enforce 6MB images / 40MB videos / 10MB audio client-side before invoking edge fn.

### 7. Chat rate limiting + Telegram webhook hardening
- Per-IP/session in-memory token bucket in `chat` fn (e.g. 10 sends / 60s) — return 429.
- `telegram-webhook`: dedup on `update_id` already exists; add early-return if `update_id` seen in last 5 min cache. Ignore non-admin chats silently (already done).
- Also fix client refresh loop: stop polling chat on 429 with backoff.

### 8. Chat media (videos up to 40MB + voice notes)
- Add `media_url`, `media_type` columns to `chat_messages`.
- New `send-media` action in `chat` fn → uploads to `premiere-media/chat/` then inserts row.
- Frontend chat input: paperclip menu (image / video / record voice).
- Voice notes: `MediaRecorder` API → webm blob → upload.
- Render `<video controls>` and `<audio controls>` inline.

---

## Phase B — Follow-up turn

- Admin edit/delete history panel with inline diffs for captions + media reorder log (needs new `media_audit_log` table, trigger to capture old/new caption + sort_order changes, and a dedicated admin tab).

Reason for deferral: it's a self-contained feature with its own table, trigger, and UI surface. Bundling it risks a broken turn given Phase A is already ~8 items.

---

## Technical notes

**DB migrations needed (one combined migration):**
- `page_images`: add `uploaded_by text default 'admin'`.
- `chat_messages`: add `media_url text`, `media_path text` (already have `media_type` at table level? — no, that was page_images; add to chat_messages too).
- Backfill existing `page_images.uploaded_by = 'admin'`.

**Edge fn changes:**
- `chat`: add `send-media`, rate limiting, auto-reply logic.
- `admin-mutate`: support `uploaded_by` flag from public vs admin upload action.
- `telegram-webhook`: in-memory dedup cache.

**Frontend:**
- `SiteContext`: persist to `sessionStorage`, restore on mount, idle timer hook.
- `Navigation`: add "Sign out" in More dropdown.
- `LandingPage`: multi-file upload, progress per file, retry, filter counter by `uploaded_by`.
- `AdminPageEditor`: multi-file, progress, retry, ensure full image list query.
- `ChatBox`: media attach menu, voice recorder, render media.

---

## Confirm before I start

Phase A as above (8 items), Phase B (audit history) deferred to next turn. OK to proceed?

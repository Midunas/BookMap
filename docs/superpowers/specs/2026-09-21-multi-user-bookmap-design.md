# BookMap multi-user design

Date: 2026-09-21
Status: draft for review

## Goal

Turn BookMap from a single static site into a product where anyone can sign in
with Google, link their Goodreads account, and get their own BookMap: shelf,
map, timeline, lenses, character sheet and insights, at a public URL.

## Non-goals (this phase)

- No social features: no following, likes, comments or feeds.
- No book search or manual add flow beyond Goodreads import and CSV upload.
  Users curate on Goodreads; BookMap visualises.
- No payments. Free, single tier.
- No mobile app.

## What we learned that shapes the design

- The Goodreads API is dead (closed 2020). There is no OAuth to "link" an
  account.
- Goodreads shelf RSS feeds still work and are public for any profile whose
  shelves are public (the default). Verified 2026-09-21 against
  `goodreads.com/review/list_rss/{userId}?shelf=read&page=N`: 100 items per
  page, paginated, structured fields per item: title, author_name, isbn,
  book_id, num_pages, book_published, average_rating, user_rating,
  user_read_at, user_date_added, user_shelves, user_review, and four cover
  image URLs. The HTML list pages require sign-in; the RSS does not.
- Open Library search is free but flaky (ECONNRESET under load). Goodreads RSS
  already carries cover URLs, so Open Library becomes a fallback only.
- Everything hand-written for the current 73 books (author origin, genre,
  form, themes, stat points, blurbs, and the "Remind me" refreshers in
  `summaries.ts`: a three-sentence gist, key ideas, people to remember) is
  exactly the work an LLM enrichment worker should do once per book, shared
  across all users.
- The site is light-only since 2026-09-20 (dark mode and the toggle were
  removed), so no theme state needs to move to the database.

## Architecture

```
Browser (Nuxt app, SSR on Cloudflare Workers)
   │  supabase-js with anon key, RLS enforced
   ▼
Supabase: Google auth, Postgres, storage (CSV uploads)
   ▲
   │  service-role key, server only
Nuxt server routes on the same Worker
   ├─ POST /api/import/goodreads   → fetch RSS pages, upsert user_books, enqueue enrichment
   ├─ POST /api/import/csv         → parse Goodreads export, same upsert path
   ├─ cron  nightly                → re-sync every linked profile
   └─ cron  every 5 min            → process enrichment jobs (Claude API + Open Library)
```

One codebase, one deploy. No separate worker service and no Cloudflare Queues
(Queues need the paid Workers plan; a jobs table plus cron does the same at
this scale).

### Hosting

Cloudflare Workers via the Nitro `cloudflare_module` preset, configured in
`wrangler.jsonc`. Scheduled work uses Workers cron triggers wired to Nitro
scheduled tasks. Secrets (Supabase service key, Anthropic key) live in Worker
secrets, never in the client bundle. Implementation must verify the exact
Nitro cron wiring against current Nuxt and Cloudflare docs before relying on
it; if Nitro tasks are not supported on the preset, fall back to a small
dedicated cron Worker that calls an authenticated `/api/jobs/run` route.

### Auth

Supabase Auth with the Google provider, through `@nuxtjs/supabase`. On first
sign-in a row is created in `profiles` with a generated handle (from the Google
display name, deduplicated). Users can change the handle once.

### Data model

All tables in Postgres with row-level security on.

`profiles`
- `id` uuid, primary key, references `auth.users`
- `handle` text, unique, lowercase, 3–24 chars
- `display_name` text
- `avatar_url` text
- `goodreads_user_id` text, nullable
- `is_public` boolean, default true
- `created_at`, `updated_at`

`books` (canonical, shared by every user; one row per Goodreads book id)
- `id` bigint, primary key = Goodreads `book_id`
- `title`, `series` (parsed from the "(Series, #n)" suffix), `author`
- `isbn` text, `pages` int, `year` int (first publication, from `book_published`)
- `avg_rating` numeric
- `cover_url` text (Goodreads large image), `openlibrary_cover_id` int nullable
- `description` text
- Enrichment columns, null until the worker fills them:
  `author_country`, `author_place`, `lat`, `lng`, `language`, `genre` (one of
  the eight), `form`, `themes` text[], `stats` jsonb (six keys, 0–3 each),
  `blurb` text (what it teaches, two sentences), `summary` jsonb (the
  refresher: `{gist, ideas[], people[]?}`, same shape as `summaries.ts`),
  `enriched_at`, `enrich_model`
- Readable by everyone; writable only by the service role.

`user_books`
- `user_id` uuid, `book_id` bigint, composite primary key
- `status` enum: read, want, reading, dnf
- `my_rating` smallint nullable, `date_read` date nullable, `date_added` date
- `shelves` text[] (raw Goodreads shelves, kept for later lenses)
- `review` text (from Goodreads), `takeaway` text (written in BookMap)
- RLS: owner can read and write; anyone can read rows whose profile
  `is_public` is true.

`imports`
- `id`, `user_id`, `source` enum: rss, csv
- `status` enum: queued, running, done, failed
- `counts` jsonb (fetched, inserted, updated, enqueued), `error` text
- `started_at`, `finished_at`
- Owner read only.

`jobs`
- `id`, `kind` enum: enrich_book, generate_threads, sync_profile
- `payload` jsonb, `status` enum: queued, running, done, failed
- `attempts` int, `last_error`, `run_after` timestamptz, timestamps
- Service role only.

`threads` (per user, generated)
- `user_id`, `threads` jsonb (array of `{title, book_ids, text}`), `generated_at`
- Owner writes via job; public read when profile is public.

### Import pipeline

1. User pastes a Goodreads profile URL or numeric id on `/me/import`. The
   server extracts the id, stores it on the profile, and creates an `imports`
   row.
2. The server fetches `list_rss/{id}?shelf=read`, `to-read` and
   `currently-reading`, walking `page=` until a page returns fewer than 100
   items. Fetches are sequential with a short delay and a browser-like
   User-Agent. A hard cap of 30 pages per shelf (3,000 books) protects the
   Worker's time budget; larger libraries continue on the next nightly sync.
3. For each item: upsert `books` from the bibliographic fields; upsert
   `user_books` from the user fields. Shelf `read` → status read, `to-read` →
   want, `currently-reading` → reading; a `did-not-finish` or `dnf` user shelf
   → dnf.
4. Any `books` row with `enriched_at` null gets one `enrich_book` job. One
   `generate_threads` job is queued per import.
5. If the RSS returns HTML or zero items, the import fails with a message
   pointing the user at the CSV fallback and the Goodreads privacy setting.
6. CSV path: user uploads the Goodreads export to Supabase storage; the same
   upsert code runs over parsed rows. Goodreads CSV lacks cover URLs and
   `book_published` reliability, so those books lean on Open Library.

Nightly sync repeats steps 2–4 for every profile with a `goodreads_user_id`,
spread across the hour so no burst hits Goodreads.

### Enrichment worker

Runs on the 5-minute cron. Pulls up to 20 queued `enrich_book` jobs, sends
each book (title, author, year, description) to Claude with a strict JSON
schema, validates the response, writes the enrichment columns. Prompt asks
for: author birthplace and country with coordinates, original language, one of
the eight genres, a form from the fixed list, three to five themes, stat points
(six keys, integers 0–3, at most 8 total), a two-sentence "what it teaches"
blurb, and the refresher summary (gist in three sentences, four to six key
ideas, people to remember for fiction and memoir only). One call per book
returns all of it. Model: `claude-sonnet-5` for cost; a config switch allows
`claude-fable-5-1` for a quality pass later. Retries three times with backoff;
after that the book renders with a neutral fallback (genre "Literary Fiction",
no stats) and is flagged for the admin.

`generate_threads` jobs receive a user's read list with blurbs and return five
to eight threads in the current `threads.ts` shape. Regenerated after each
import that added more than five read books.

Enrichment is cached forever per book. A later "re-enrich" admin action can
invalidate.

### Application routes

Public
- `/` landing: what BookMap is, sign in with Google, a demo profile link.
- `/u/[handle]` shelf (current index page), and `/u/[handle]/map`,
  `/timeline`, `/lenses`, `/character`, `/insights`. These are the six
  existing pages, reading from Supabase for that handle instead of
  `books.ts`.

Signed in
- `/me` redirects to `/u/[own handle]` with edit affordances on: change status,
  rating, write a takeaway in the drawer.
- `/me/import` link Goodreads, upload CSV, see import history and progress.
- `/me/settings` handle, display name, public toggle, unlink, delete account.

### What happens to the current code

- The six pages and their components stay. Data access moves behind a
  `useProfileLibrary(handle)` composable that returns the same shape the
  current `useLibrary` does, so page code barely changes.
- `useCharacter` becomes a pure function over a book list, unchanged in logic.
- `books.ts`, `summaries.ts` and `threads.ts` become the seed for the owner's
  own account: a one-off script maps the 73 hand-curated books onto `books`
  by Goodreads id (looked up once via RSS of the owner's profile) and
  preserves the hand-written takeaways, stats and refreshers. Hand-written
  enrichment wins over the worker's for those rows and is marked
  `enrich_model = 'hand'`.
- The "Remind me" section in the drawer reads `books.summary` instead of
  importing `summaries.ts`; it renders only when the summary exists, as now.
- The static generate path is dropped; the app becomes SSR on Workers.

### Error handling

- Import errors are surfaced on `/me/import` with a plain-language cause and a
  retry button. Partial imports keep what succeeded.
- Enrichment failures never block a profile from rendering.
- Goodreads may block or change the feed. The fetcher validates the XML shape
  and fails loudly to the `imports` row; the CSV path is the documented
  fallback and is tested independently.
- RLS is the security boundary. The service role key is only used inside
  server routes and cron handlers.

### Testing

- Unit: RSS parser against saved fixtures (including a truncated page and an
  HTML sign-in response); CSV parser against a real Goodreads export; shelf to
  status mapping; the `useCharacter` levelling and badge functions.
- Integration: server routes against a local Supabase (`supabase start`) with
  a mocked Goodreads fetch and a mocked Claude client.
- End to end: sign in with a test Google account on a preview deploy, import a
  public profile, confirm the six views render and RLS blocks cross-user
  writes.

### Rollout

1. Auth and database: schema, RLS policies, Google sign-in, profile creation.
2. Import: RSS route and CSV route, imports page, nightly sync.
3. Profiles: the six views reading from Supabase at `/u/[handle]`; seed the
   owner's account from the current data files.
4. Enrichment: jobs table, worker cron, Claude prompt and schema validation,
   threads generation.
5. Polish: landing page, settings, delete account, demo profile.

Each step ships behind the previous one being deployable.

## Open risks

- Goodreads could disable RSS at any time. Mitigation: CSV path from day one.
- Goodreads cover URLs are hotlinked from `i.gr-assets.com`. If they break,
  fall back to Open Library by ISBN, which the RSS provides.
- Cloudflare Workers CPU limits (default 30 s per invocation on the free plan)
  bound how much one import call can do. The page cap and nightly continuation
  handle large libraries.
- Enrichment cost scales with unique books, not users. Ten thousand unique
  books at Sonnet prices is on the order of tens of dollars, one time.

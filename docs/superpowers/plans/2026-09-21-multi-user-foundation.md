# Multi-user BookMap: Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Anyone can sign in with Google, import their Goodreads shelves (RSS or CSV), and get their own BookMap at `/u/<handle>`, deployed on Cloudflare Workers with a nightly re-sync.

**Architecture:** Nuxt 4 SSR on Cloudflare Workers (Nitro `cloudflare_module`), Supabase for Google auth and Postgres with row-level security. Server routes on the same Worker do the Goodreads RSS/CSV import and upsert into a shared `books` table plus per-user `user_books`. The six existing views are turned into components that render for any handle from Supabase data; the current hand-written data files become the seed for the owner's account.

**Tech Stack:** Nuxt 4.5, Vue 3.5, `@nuxtjs/supabase`, `@supabase/supabase-js`, `fast-xml-parser`, Supabase CLI (local Postgres), Vitest, Wrangler.

**Spec:** `docs/superpowers/specs/2026-09-21-multi-user-bookmap-design.md`

This plan implements spec rollout stages 1–3 plus the deploy target and nightly sync from stage 2. Stage 4 (LLM enrichment, threads generation) and stage 5 (landing polish, delete account, demo profile) are deliberately out of scope and get their own plans; the schema created here already has their columns and tables so nothing needs migrating later.

## Global Constraints

- Git: never add "Co-Authored-By" or any AI attribution to commits. One logical change per commit, short imperative message. (From `CLAUDE.md`.)
- Node 22, npm. Nuxt `^4.5.2` (already installed). Do not downgrade.
- Supabase env vars use the module's names exactly: `NUXT_PUBLIC_SUPABASE_URL`, `NUXT_PUBLIC_SUPABASE_KEY`, `NUXT_SUPABASE_SECRET_KEY`. The secret key never reaches the client bundle.
- Genre values are exactly the eight in `app/data/books.ts` `GENRES`. Status values are exactly `read | want | reading | dnf`.
- Import must work for public Goodreads profiles via RSS with a hard cap of 30 pages per shelf; CSV upload is the fallback and must produce the same rows.
- Row-level security is the security boundary: clients use the anon key; only server code uses the secret key.
- Light theme only; do not reintroduce dark-mode tokens.
- All fetches to Goodreads send `User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36` and are sequential with a 300 ms delay.

---

## File structure

Created:

```
vitest.config.ts                         test runner config, `~` alias → app/
tests/unit/library.test.ts               pure helpers from useLibrary (century, series)
tests/unit/goodreads-rss.test.ts         RSS parser
tests/unit/goodreads-fetch.test.ts       user-id extraction, shelf walker with mocked fetch
tests/unit/goodreads-csv.test.ts         CSV parser
tests/unit/import-mapping.test.ts        RSS/CSV item → DB rows, shelf → status
tests/unit/profile-mapping.test.ts       DB rows → client Book
tests/db/rls.test.ts                     RLS behaviour against local Supabase (skips without env)
tests/db/import-runner.test.ts           runGoodreadsImport against local Supabase, mocked fetch
tests/fixtures/goodreads-rss-page.xml    3 real items, trimmed
tests/fixtures/goodreads-rss-short.xml   1 item (last page)
tests/fixtures/goodreads-signin.html     HTML sign-in page (private profile / blocked)
tests/fixtures/goodreads-export.csv      4 rows in Goodreads export format
supabase/config.toml                     from `supabase init`
supabase/migrations/0001_schema.sql      enums, tables, indexes
supabase/migrations/0002_rls.sql         policies
supabase/migrations/0003_profile_trigger.sql  auto-create profile with unique handle
supabase/seed.sql                        empty placeholder (CLI expects it)
server/utils/db.ts                       adminClient() with the secret key
server/utils/goodreads/types.ts          GoodreadsItem, GoodreadsShelf
server/utils/goodreads/rss.ts            parseRssPage(xml) → GoodreadsItem[] | throws
server/utils/goodreads/fetch.ts          extractGoodreadsUserId(), walkShelf()
server/utils/goodreads/csv.ts            parseGoodreadsCsv(text) → GoodreadsItem[]
server/utils/import/mapping.ts           parseSeries(), shelfToStatus(), toBookRow(), toUserBookRow()
server/utils/import/runner.ts            runGoodreadsImport(), runCsvImport()
server/api/import/goodreads.post.ts      POST: start RSS import for current user
server/api/import/csv.post.ts            POST multipart: CSV import for current user
server/api/imports.get.ts                GET: current user's import history
server/tasks/sync/profiles.ts            nightly re-sync task
app/types/db.ts                          Row types shared by server and client
app/utils/profile-mapping.ts             rowToBook(), rowsToBooks()
app/composables/useProfileLibrary.ts     loads a handle's library into useLibrary state
app/composables/useSession.ts            current profile of the signed-in user
app/components/views/ShelfView.vue       body of the old pages/index.vue
app/components/views/MapView.vue         body of pages/map.vue
app/components/views/TimelineView.vue    body of pages/timeline.vue
app/components/views/LensesView.vue      body of pages/lenses.vue
app/components/views/CharacterView.vue   body of pages/character.vue
app/components/views/InsightsView.vue    body of pages/insights.vue
app/pages/u/[handle].vue                 loads library, renders sub-nav + NuxtPage
app/pages/u/[handle]/index.vue           <ShelfView/>  (and map, timeline, lenses, character, insights)
app/pages/login.vue                      Google sign-in button
app/pages/confirm.vue                    OAuth callback landler
app/pages/me/index.vue                   redirect to /u/<own handle>
app/pages/me/import.vue                  link Goodreads / upload CSV / history
app/middleware/handle.ts                 404 for unknown or private handles
scripts/seed-owner.mjs                   push books.ts, summaries.ts, threads.ts into Supabase for the owner
scripts/seed-map.json                    manual title → goodreads id overrides (starts empty)
.env.example                             documented env vars
```

Modified:

```
nuxt.config.ts                 modules, supabase options, nitro preset + scheduledTasks, runtimeConfig
package.json                   deps + test scripts
app/composables/useLibrary.ts  books come from state, not the static import; coverUrl reads book.coverUrl
app/data/books.ts              Book gains coverUrl?, enriched?; Status gains 'dnf'
app/components/BookDrawer.vue  owner edit controls; summary from book.summary
app/components/BookCover.vue   coverUrl via helper (already), nothing else
app/app.vue                    nav is handle-aware; sign in / out
app/pages/index.vue            becomes landing (redirects signed-in users to /me)
app/pages/{map,timeline,lenses,character,insights}.vue   deleted (moved under /u/[handle])
README.md                      local dev with Supabase, deploy
```

---

### Task 1: Test harness

**Files:**
- Create: `vitest.config.ts`, `tests/unit/library.test.ts`
- Modify: `package.json`

**Interfaces:**
- Produces: `npm test` runs Vitest; `~` resolves to `app/` in tests.

- [ ] **Step 1: Install Vitest**

```bash
npm install -D vitest
```

- [ ] **Step 2: Add config and script**

`vitest.config.ts`:
```ts
import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  resolve: { alias: { '~': fileURLToPath(new URL('./app', import.meta.url)) } },
  test: { include: ['tests/**/*.test.ts'], environment: 'node' },
})
```

In `package.json` scripts add: `"test": "vitest run"`, `"test:watch": "vitest"`.

- [ ] **Step 3: Write a failing test for an existing pure helper**

`tests/unit/library.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { centuryOf, eraOf, yearLabel } from '~/composables/useLibrary'

describe('year helpers', () => {
  it('labels BC and early AD years', () => {
    expect(yearLabel(-500)).toBe('500 BC')
    expect(yearLabel(180)).toBe('AD 180')
    expect(yearLabel(1949)).toBe('1949')
  })
  it('buckets centuries', () => {
    expect(centuryOf(-375)).toBe('4th c. BC')
    expect(centuryOf(1866)).toBe('19th century')
    expect(centuryOf(2004)).toBe('21st century')
  })
  it('buckets eras', () => {
    expect(eraOf(180)).toBe('Antiquity')
    expect(eraOf(1813)).toBe('19th century')
    expect(eraOf(1967)).toBe('1960s')
  })
})
```

- [ ] **Step 4: Run it, expect a module-resolution failure**

Run: `npm test`
Expected: FAIL. `useLibrary.ts` imports `covers.json` fine, but calls Nuxt auto-imports (`useState`, `computed`) that do not exist in Node. The failure is `ReferenceError` or import error depending on evaluation order.

- [ ] **Step 5: Make pure helpers importable without Nuxt**

Move the pure helpers out of `app/composables/useLibrary.ts` into a new file `app/utils/library.ts` and re-export them from `useLibrary.ts` so existing imports keep working:

`app/utils/library.ts`:
```ts
import { GENRES, type Book, type Genre } from '~/data/books'

export const genreSlot = (g: Genre) => GENRES.indexOf(g) + 1
export const genreVar = (g: Genre) => `var(--g-${genreSlot(g)})`

export const yearLabel = (y: number) => (y < 0 ? `${-y} BC` : y < 1000 ? `AD ${y}` : String(y))

export const eraOf = (y: number) => {
  if (y < 500) return 'Antiquity'
  if (y < 1900) return `${Math.floor(y / 100) + 1}th century`
  return `${Math.floor(y / 10) * 10}s`
}

export const centuryOf = (y: number) => {
  if (y < 0) return `${Math.ceil(-y / 100)}th c. BC`
  const c = Math.floor((y - 1) / 100) + 1
  const suffix = c === 1 ? 'st' : c === 2 ? 'nd' : c === 3 ? 'rd' : 'th'
  return `${c}${suffix} century`
}

export const fmtDate = (iso?: string) =>
  iso ? new Date(iso + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : null

export const openLibraryUrl = (b: Book) =>
  `https://openlibrary.org/search?q=${encodeURIComponent(`${b.title} ${b.author}`)}`

export function groupBy<T>(list: T[], key: (t: T) => string) {
  const m = new Map<string, T[]>()
  for (const item of list) {
    const k = key(item)
    if (!m.has(k)) m.set(k, [])
    m.get(k)!.push(item)
  }
  return [...m.entries()].map(([name, items]) => ({ name, items }))
}

export const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0)
```

In `app/composables/useLibrary.ts` delete those definitions and add at the top:
```ts
export { genreSlot, genreVar, yearLabel, eraOf, centuryOf, fmtDate, openLibraryUrl, groupBy, avg } from '~/utils/library'
import { groupBy, centuryOf } from '~/utils/library'
```
(Keep `coverUrl`, `useLibrary`, `useCharacter` where they are. Nuxt auto-imports `app/utils/*` too, so components keep working.)

Change the test import to `from '~/utils/library'`.

- [ ] **Step 6: Run tests, expect pass; run the app once**

Run: `npm test` → PASS (3 tests).
Run: `npx nuxt build` → completes with no errors.

- [ ] **Step 7: Commit (two commits)**

```bash
git add vitest.config.ts package.json package-lock.json
git commit -m "Add Vitest test harness"
git add app/utils/library.ts app/composables/useLibrary.ts tests/unit/library.test.ts
git commit -m "Move pure library helpers to app/utils for testability"
```

---

### Task 2: Database schema, RLS and profile trigger

**Files:**
- Create: `supabase/config.toml` (generated), `supabase/migrations/0001_schema.sql`, `supabase/migrations/0002_rls.sql`, `supabase/migrations/0003_profile_trigger.sql`, `supabase/seed.sql`, `tests/db/rls.test.ts`, `.env.example`
- Modify: `.gitignore`, `package.json`

**Interfaces:**
- Produces: tables `profiles`, `books`, `user_books`, `imports`, `jobs`, `threads` exactly as below. Later tasks write to them with these column names.

- [ ] **Step 1: Install the Supabase CLI and init**

```bash
npm install -D supabase @supabase/supabase-js
npx supabase init
```
Accept defaults. Add to `.gitignore`: `supabase/.temp`, `.env`, `.env.local`.

- [ ] **Step 2: Write the schema migration**

`supabase/migrations/0001_schema.sql`:
```sql
create type book_status as enum ('read', 'want', 'reading', 'dnf');
create type import_source as enum ('rss', 'csv');
create type job_status as enum ('queued', 'running', 'done', 'failed');
create type job_kind as enum ('enrich_book', 'generate_threads', 'sync_profile');

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  handle text not null unique check (handle ~ '^[a-z0-9][a-z0-9-]{1,22}[a-z0-9]$'),
  display_name text not null default '',
  avatar_url text,
  goodreads_user_id text,
  is_public boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table books (
  id bigint primary key,                 -- Goodreads book_id
  title text not null,
  series text,
  author text not null,
  isbn text,
  pages int,
  year int,
  avg_rating numeric(3,2),
  cover_url text,
  openlibrary_cover_id int,
  description text,
  -- enrichment (filled later)
  author_country text,
  author_place text,
  lat double precision,
  lng double precision,
  language text,
  genre text check (genre in ('Literary Fiction','Fantasy & Sci-Fi','Dystopia & Satire','Historical & War','Philosophy','Mind & Self','Money & Craft','Memoir & Biography')),
  form text,
  themes text[] not null default '{}',
  stats jsonb not null default '{}'::jsonb,
  blurb text,
  summary jsonb,
  enriched_at timestamptz,
  enrich_model text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table user_books (
  user_id uuid not null references profiles(id) on delete cascade,
  book_id bigint not null references books(id) on delete cascade,
  status book_status not null,
  my_rating smallint check (my_rating between 1 and 5),
  date_read date,
  date_added date not null default current_date,
  shelves text[] not null default '{}',
  review text,
  takeaway text,
  updated_at timestamptz not null default now(),
  primary key (user_id, book_id)
);
create index user_books_user_status on user_books(user_id, status);

create table imports (
  id bigint generated always as identity primary key,
  user_id uuid not null references profiles(id) on delete cascade,
  source import_source not null,
  status job_status not null default 'queued',
  counts jsonb not null default '{}'::jsonb,
  error text,
  started_at timestamptz not null default now(),
  finished_at timestamptz
);
create index imports_user on imports(user_id, started_at desc);

create table jobs (
  id bigint generated always as identity primary key,
  kind job_kind not null,
  payload jsonb not null default '{}'::jsonb,
  status job_status not null default 'queued',
  attempts int not null default 0,
  last_error text,
  run_after timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index jobs_queue on jobs(status, run_after) where status = 'queued';

create table threads (
  user_id uuid primary key references profiles(id) on delete cascade,
  threads jsonb not null default '[]'::jsonb,
  generated_at timestamptz not null default now()
);

create or replace function set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
create trigger profiles_updated before update on profiles for each row execute function set_updated_at();
create trigger books_updated before update on books for each row execute function set_updated_at();
create trigger user_books_updated before update on user_books for each row execute function set_updated_at();
create trigger jobs_updated before update on jobs for each row execute function set_updated_at();
```

- [ ] **Step 3: Write the RLS migration**

`supabase/migrations/0002_rls.sql`:
```sql
alter table profiles enable row level security;
alter table books enable row level security;
alter table user_books enable row level security;
alter table imports enable row level security;
alter table jobs enable row level security;
alter table threads enable row level security;

-- profiles: public ones readable by all, own always readable and updatable
create policy profiles_read on profiles for select using (is_public or id = auth.uid());
create policy profiles_update_own on profiles for update using (id = auth.uid()) with check (id = auth.uid());

-- books: canonical, readable by everyone, written only by service role (no client policy)
create policy books_read on books for select using (true);

-- user_books: own rows fully; others readable when their profile is public
create policy user_books_read on user_books for select using (
  user_id = auth.uid()
  or exists (select 1 from profiles p where p.id = user_books.user_id and p.is_public)
);
create policy user_books_write_own on user_books for insert with check (user_id = auth.uid());
create policy user_books_update_own on user_books for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy user_books_delete_own on user_books for delete using (user_id = auth.uid());

-- imports: own read only
create policy imports_read_own on imports for select using (user_id = auth.uid());

-- jobs: service role only (no policies)

-- threads: own or public
create policy threads_read on threads for select using (
  user_id = auth.uid()
  or exists (select 1 from profiles p where p.id = threads.user_id and p.is_public)
);
```

- [ ] **Step 4: Write the profile trigger migration**

`supabase/migrations/0003_profile_trigger.sql`:
```sql
create or replace function slug_handle(src text) returns text language sql immutable as $$
  select left(trim(both '-' from regexp_replace(lower(coalesce(src, 'reader')), '[^a-z0-9]+', '-', 'g')), 20)
$$;

create or replace function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  base text := slug_handle(coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)));
  candidate text;
  n int := 1;
begin
  if length(base) < 3 then base := 'reader'; end if;
  candidate := base;
  while exists (select 1 from profiles where handle = candidate) loop
    n := n + 1;
    candidate := base || '-' || n;
  end loop;
  insert into profiles (id, handle, display_name, avatar_url)
  values (
    new.id,
    candidate,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
```

Create `supabase/seed.sql` containing only `-- intentionally empty`.

- [ ] **Step 5: Start local Supabase and apply**

```bash
npx supabase start
npx supabase db reset
npx supabase status -o env
```
Expected: reset completes listing the three migrations. Copy `API_URL`, `ANON_KEY`, `SERVICE_ROLE_KEY` into `.env` as:
```
NUXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NUXT_PUBLIC_SUPABASE_KEY=<ANON_KEY>
NUXT_SUPABASE_SECRET_KEY=<SERVICE_ROLE_KEY>
```
Write `.env.example` with the same three keys and placeholder values plus a comment on where to get them.

- [ ] **Step 6: Write the RLS integration test (fails until policies are right)**

`tests/db/rls.test.ts`:
```ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = process.env.NUXT_PUBLIC_SUPABASE_URL
const anon = process.env.NUXT_PUBLIC_SUPABASE_KEY
const secret = process.env.NUXT_SUPABASE_SECRET_KEY
const live = Boolean(url && anon && secret)

async function signUp(admin: SupabaseClient, email: string, name: string) {
  const { data, error } = await admin.auth.admin.createUser({ email, password: 'pw-123456', email_confirm: true, user_metadata: { full_name: name } })
  if (error) throw error
  const client = createClient(url!, anon!, { auth: { persistSession: false } })
  const { error: e2 } = await client.auth.signInWithPassword({ email, password: 'pw-123456' })
  if (e2) throw e2
  return { id: data.user.id, client }
}

describe.skipIf(!live)('row level security', () => {
  const admin = createClient(url!, secret!, { auth: { persistSession: false } })
  const stamp = Date.now()
  let a: { id: string; client: SupabaseClient }, b: { id: string; client: SupabaseClient }

  beforeAll(async () => {
    a = await signUp(admin, `a-${stamp}@test.local`, 'Alice Reader')
    b = await signUp(admin, `b-${stamp}@test.local`, 'Bob Reader')
    await admin.from('books').upsert({ id: 1, title: 'Test Book', author: 'Nobody' })
  })
  afterAll(async () => {
    await admin.auth.admin.deleteUser(a.id)
    await admin.auth.admin.deleteUser(b.id)
    await admin.from('books').delete().eq('id', 1)
  })

  it('creates a profile with a slug handle on sign-up', async () => {
    const { data } = await admin.from('profiles').select('handle').eq('id', a.id).single()
    expect(data!.handle).toBe('alice-reader')
  })
  it('deduplicates handles', async () => {
    const c = await signUp(admin, `c-${stamp}@test.local`, 'Alice Reader')
    const { data } = await admin.from('profiles').select('handle').eq('id', c.id).single()
    expect(data!.handle).toBe('alice-reader-2')
    await admin.auth.admin.deleteUser(c.id)
  })
  it('lets a user write only their own user_books', async () => {
    const own = await a.client.from('user_books').insert({ user_id: a.id, book_id: 1, status: 'read' })
    expect(own.error).toBeNull()
    const other = await a.client.from('user_books').insert({ user_id: b.id, book_id: 1, status: 'read' })
    expect(other.error).not.toBeNull()
  })
  it('exposes public profiles to anyone and hides private ones', async () => {
    const anonClient = createClient(url!, anon!, { auth: { persistSession: false } })
    const before = await anonClient.from('user_books').select('book_id').eq('user_id', a.id)
    expect(before.data).toHaveLength(1)
    await a.client.from('profiles').update({ is_public: false }).eq('id', a.id)
    const after = await anonClient.from('user_books').select('book_id').eq('user_id', a.id)
    expect(after.data).toHaveLength(0)
  })
  it('never lets clients write books or read jobs', async () => {
    const w = await a.client.from('books').insert({ id: 2, title: 'x', author: 'y' })
    expect(w.error).not.toBeNull()
    const j = await a.client.from('jobs').select('*')
    expect(j.data).toEqual([])
  })
})
```

Add to `package.json` scripts: `"test:db": "vitest run tests/db"`, and make Vitest load `.env`: in `vitest.config.ts` add at top `import 'dotenv/config'` after `npm i -D dotenv`.

- [ ] **Step 7: Run the DB tests**

Run: `npm run test:db`
Expected: PASS (5 tests). If `handle` assertions fail, fix `slug_handle` and re-run `npx supabase db reset`.

- [ ] **Step 8: Commit (one per migration, then tests)**

```bash
git add supabase/config.toml supabase/seed.sql .gitignore package.json package-lock.json .env.example
git commit -m "Add Supabase CLI project and env example"
git add supabase/migrations/0001_schema.sql
git commit -m "Add profiles, books, user_books, imports, jobs and threads tables"
git add supabase/migrations/0002_rls.sql
git commit -m "Add row level security policies"
git add supabase/migrations/0003_profile_trigger.sql
git commit -m "Create profile with unique handle on sign-up"
git add vitest.config.ts tests/db/rls.test.ts
git commit -m "Add RLS integration tests against local Supabase"
```

---

### Task 3: Google sign-in with the Nuxt Supabase module

**Files:**
- Create: `app/pages/login.vue`, `app/pages/confirm.vue`, `app/pages/me/index.vue`, `app/composables/useSession.ts`, `app/types/db.ts`
- Modify: `nuxt.config.ts`, `app/app.vue`, `package.json`

**Interfaces:**
- Produces: `useSession()` → `{ user, profile, signOut }` where `profile` is `ProfileRow | null`. `ProfileRow`, `BookRow`, `UserBookRow`, `ImportRow` types in `app/types/db.ts` used by every later task.

- [ ] **Step 1: Install and configure the module**

```bash
npm install @nuxtjs/supabase
```

In `nuxt.config.ts` add:
```ts
modules: ['@nuxtjs/supabase'],
supabase: {
  redirectOptions: {
    login: '/login',
    callback: '/confirm',
    include: ['/me(/*)?'],   // only /me routes require auth; everything else is public
    exclude: [],
    saveRedirectToCookie: true,
  },
},
runtimeConfig: {
  public: { siteUrl: 'http://localhost:3000' },   // NUXT_PUBLIC_SITE_URL in prod
},
```

- [ ] **Step 2: Define DB row types**

`app/types/db.ts`:
```ts
export type BookStatus = 'read' | 'want' | 'reading' | 'dnf'

export interface ProfileRow {
  id: string; handle: string; display_name: string; avatar_url: string | null
  goodreads_user_id: string | null; is_public: boolean; created_at: string; updated_at: string
}
export interface BookRow {
  id: number; title: string; series: string | null; author: string; isbn: string | null
  pages: number | null; year: number | null; avg_rating: number | null; cover_url: string | null
  openlibrary_cover_id: number | null; description: string | null
  author_country: string | null; author_place: string | null; lat: number | null; lng: number | null
  language: string | null; genre: string | null; form: string | null; themes: string[]
  stats: Record<string, number>; blurb: string | null
  summary: { gist: string; ideas: string[]; people?: string[] } | null
  enriched_at: string | null; enrich_model: string | null
}
export interface UserBookRow {
  user_id: string; book_id: number; status: BookStatus; my_rating: number | null
  date_read: string | null; date_added: string; shelves: string[]; review: string | null; takeaway: string | null
}
export interface ImportRow {
  id: number; user_id: string; source: 'rss' | 'csv'; status: 'queued' | 'running' | 'done' | 'failed'
  counts: { fetched?: number; inserted?: number; updated?: number; enqueued?: number }
  error: string | null; started_at: string; finished_at: string | null
}
```

- [ ] **Step 3: Session composable**

`app/composables/useSession.ts`:
```ts
import type { ProfileRow } from '~/types/db'

export function useSession() {
  const user = useSupabaseUser()
  const client = useSupabaseClient()
  const profile = useState<ProfileRow | null>('bm-profile', () => null)

  const load = async () => {
    if (!user.value) { profile.value = null; return }
    const { data } = await client.from('profiles').select('*').eq('id', user.value.sub).maybeSingle()
    profile.value = (data as ProfileRow | null) ?? null
  }
  watch(user, load, { immediate: true })

  const signOut = async () => { await client.auth.signOut(); profile.value = null; await navigateTo('/') }
  return { user, profile, signOut, reload: load }
}
```

- [ ] **Step 4: Login, confirm, and /me pages**

`app/pages/login.vue`:
```vue
<script setup lang="ts">
const client = useSupabaseClient()
const config = useRuntimeConfig()
const busy = ref(false)
const signIn = async () => {
  busy.value = true
  await client.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${config.public.siteUrl}/confirm` } })
}
useHead({ title: 'BookMap · Sign in' })
</script>
<template>
  <div class="page wrap login">
    <p class="eyebrow">Sign in</p>
    <h1>Your shelf, mapped.</h1>
    <p class="lede">Sign in with Google, paste your Goodreads profile, and BookMap builds the rest.</p>
    <button class="chip on big" :disabled="busy" @click="signIn">Continue with Google</button>
  </div>
</template>
<style scoped>
.login { max-width: 560px; }
.big { font-size: 15px; padding: 12px 22px; margin-top: 22px; }
</style>
```

`app/pages/confirm.vue`:
```vue
<script setup lang="ts">
const user = useSupabaseUser()
const redirectInfo = useSupabaseCookieRedirect()
watch(user, () => { if (user.value) navigateTo(redirectInfo.pluck() || '/me') }, { immediate: true })
</script>
<template><div class="page wrap"><p class="muted">Signing you in…</p></div></template>
```

`app/pages/me/index.vue`:
```vue
<script setup lang="ts">
const { profile } = useSession()
watch(profile, p => { if (p) navigateTo(`/u/${p.handle}`, { replace: true }) }, { immediate: true })
</script>
<template><div class="page wrap"><p class="muted">Loading your shelf…</p></div></template>
```

- [ ] **Step 5: Header sign in / out**

In `app/app.vue` script add `const { user, profile, signOut } = useSession()` and in the header row after the nav:
```vue
<NuxtLink v-if="!user" to="/login" class="nl">Sign in</NuxtLink>
<template v-else>
  <NuxtLink v-if="profile" :to="`/me/import`" class="nl">Import</NuxtLink>
  <button class="nl" @click="signOut">Sign out</button>
</template>
```

- [ ] **Step 6: Configure Google in Supabase**

Local: in `supabase/config.toml` set
```toml
[auth.external.google]
enabled = true
client_id = "env(GOOGLE_CLIENT_ID)"
secret = "env(GOOGLE_CLIENT_SECRET)"
redirect_uri = "http://127.0.0.1:54321/auth/v1/callback"
```
and put both values in `.env` (create a Google OAuth client in Google Cloud Console, Web application, authorised redirect URI `http://127.0.0.1:54321/auth/v1/callback`). Add `site_url = "http://localhost:3000"` and `additional_redirect_urls = ["http://localhost:3000/confirm"]` under `[auth]`. Restart: `npx supabase stop && npx supabase start`.

- [ ] **Step 7: Manual verification**

Run: `npx nuxt dev`. Visit `/login`, click Continue with Google, complete consent, land on `/me` which redirects to `/u/<handle>` (404 for now, expected). Check `profiles` has your row: `npx supabase db query "select handle, display_name from profiles"` (or use Studio at http://127.0.0.1:54323). Sign out from the header works.

- [ ] **Step 8: Commit**

```bash
git add package.json package-lock.json nuxt.config.ts
git commit -m "Add Nuxt Supabase module with Google auth config"
git add app/types/db.ts
git commit -m "Add database row types"
git add app/composables/useSession.ts app/pages/login.vue app/pages/confirm.vue app/pages/me/index.vue app/app.vue
git commit -m "Add sign in, confirm and /me pages with header controls"
git add supabase/config.toml .env.example
git commit -m "Enable Google provider in local Supabase config"
```

---

### Task 4: Goodreads RSS parser

**Files:**
- Create: `server/utils/goodreads/types.ts`, `server/utils/goodreads/rss.ts`, `tests/unit/goodreads-rss.test.ts`, `tests/fixtures/goodreads-rss-page.xml`, `tests/fixtures/goodreads-rss-short.xml`, `tests/fixtures/goodreads-signin.html`

**Interfaces:**
- Produces:
  ```ts
  type GoodreadsShelf = 'read' | 'to-read' | 'currently-reading'
  interface GoodreadsItem { bookId: number; title: string; author: string; isbn: string | null; pages: number | null; published: number | null; avgRating: number | null; coverUrl: string | null; description: string | null; userRating: number | null; readAt: string | null; addedAt: string | null; shelves: string[]; review: string | null }
  parseRssPage(xml: string): GoodreadsItem[]          // throws GoodreadsFeedError('not-rss') for HTML
  class GoodreadsFeedError extends Error { code: 'not-rss' | 'empty' }
  ```

- [ ] **Step 1: Capture fixtures**

```bash
mkdir -p tests/fixtures
curl -sL -A "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36" \
  "https://www.goodreads.com/review/list_rss/1?shelf=read&page=2" > /tmp/full.xml
```
Open `/tmp/full.xml`, keep the `<channel>` header and only the first 3 `<item>…</item>` blocks, save as `tests/fixtures/goodreads-rss-page.xml`. Make `tests/fixtures/goodreads-rss-short.xml` the same with only 1 item. Save the HTML from `curl -sL https://www.goodreads.com/review/list/1?shelf=read` (the sign-in page) as `tests/fixtures/goodreads-signin.html`. Confirm the 3-item fixture includes an item with a non-empty `<user_read_at>` and one with an empty one; if not, edit one item's `<user_read_at>` to be empty.

- [ ] **Step 2: Write the failing tests**

`tests/unit/goodreads-rss.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { parseRssPage, GoodreadsFeedError } from '../../server/utils/goodreads/rss'

const page = readFileSync('tests/fixtures/goodreads-rss-page.xml', 'utf8')
const short = readFileSync('tests/fixtures/goodreads-rss-short.xml', 'utf8')
const html = readFileSync('tests/fixtures/goodreads-signin.html', 'utf8')

describe('parseRssPage', () => {
  it('parses every item with typed fields', () => {
    const items = parseRssPage(page)
    expect(items).toHaveLength(3)
    const first = items[0]
    expect(first.bookId).toBeTypeOf('number')
    expect(first.title.length).toBeGreaterThan(0)
    expect(first.author.length).toBeGreaterThan(0)
    expect(first.shelves).toBeInstanceOf(Array)
    expect(first.coverUrl).toMatch(/^https:\/\//)
  })
  it('turns RSS dates into ISO dates and empty dates into null', () => {
    const items = parseRssPage(page)
    const withDate = items.find(i => i.readAt)
    expect(withDate!.readAt).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    const without = items.find(i => !i.readAt)
    expect(without!.readAt).toBeNull()
  })
  it('maps rating 0 to null', () => {
    const items = parseRssPage(page.replace(/<user_rating>\d<\/user_rating>/, '<user_rating>0</user_rating>'))
    expect(items[0].userRating).toBeNull()
  })
  it('handles a last page with one item', () => {
    expect(parseRssPage(short)).toHaveLength(1)
  })
  it('throws not-rss for an HTML sign-in page', () => {
    expect(() => parseRssPage(html)).toThrowError(GoodreadsFeedError)
    try { parseRssPage(html) } catch (e) { expect((e as GoodreadsFeedError).code).toBe('not-rss') }
  })
})
```

- [ ] **Step 3: Run, expect failure**

Run: `npm test -- goodreads-rss`
Expected: FAIL, cannot find module `server/utils/goodreads/rss`.

- [ ] **Step 4: Implement**

```bash
npm install fast-xml-parser
```

`server/utils/goodreads/types.ts`:
```ts
export type GoodreadsShelf = 'read' | 'to-read' | 'currently-reading'
export const GOODREADS_SHELVES: GoodreadsShelf[] = ['read', 'to-read', 'currently-reading']

export interface GoodreadsItem {
  bookId: number
  title: string
  author: string
  isbn: string | null
  pages: number | null
  published: number | null
  avgRating: number | null
  coverUrl: string | null
  description: string | null
  userRating: number | null
  readAt: string | null   // YYYY-MM-DD
  addedAt: string | null  // YYYY-MM-DD
  shelves: string[]
  review: string | null
}

export const GOODREADS_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36'
```

`server/utils/goodreads/rss.ts`:
```ts
import { XMLParser } from 'fast-xml-parser'
import type { GoodreadsItem } from './types'

export class GoodreadsFeedError extends Error {
  constructor(public code: 'not-rss' | 'empty', message: string) { super(message) }
}

const parser = new XMLParser({ ignoreAttributes: false, cdataPropName: '__cdata', trimValues: true })

const text = (v: unknown): string => {
  if (v == null) return ''
  if (typeof v === 'object') return text((v as any).__cdata ?? (v as any)['#text'] ?? '')
  return String(v)
}
const num = (v: unknown): number | null => { const n = Number(text(v)); return text(v) === '' || Number.isNaN(n) ? null : n }
const isoDate = (v: unknown): string | null => {
  const s = text(v); if (!s) return null
  const d = new Date(s); return Number.isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10)
}
const largest = (item: any) => text(item.book_large_image_url) || text(item.book_medium_image_url) || text(item.book_image_url) || null

export function parseRssPage(xml: string): GoodreadsItem[] {
  if (!/^\s*<\?xml|<rss[\s>]/.test(xml)) throw new GoodreadsFeedError('not-rss', 'Response was not an RSS feed (profile may be private or blocked)')
  const doc = parser.parse(xml)
  const raw = doc?.rss?.channel?.item
  if (!raw) return []
  const items: any[] = Array.isArray(raw) ? raw : [raw]
  return items.map(it => {
    const rating = num(it.user_rating)
    return {
      bookId: Number(text(it.book_id)),
      title: text(it.title),
      author: text(it.author_name),
      isbn: text(it.isbn) || null,
      pages: num(it.book?.num_pages),
      published: num(it.book_published),
      avgRating: num(it.average_rating),
      coverUrl: largest(it),
      description: text(it.book_description) || null,
      userRating: rating && rating > 0 ? rating : null,
      readAt: isoDate(it.user_read_at),
      addedAt: isoDate(it.user_date_added),
      shelves: text(it.user_shelves).split(',').map(s => s.trim()).filter(Boolean),
      review: text(it.user_review) || null,
    }
  }).filter(i => Number.isFinite(i.bookId) && i.title)
}
```

- [ ] **Step 5: Run, expect pass**

Run: `npm test -- goodreads-rss` → PASS (5 tests).

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json server/utils/goodreads/types.ts server/utils/goodreads/rss.ts tests/unit/goodreads-rss.test.ts tests/fixtures/goodreads-rss-page.xml tests/fixtures/goodreads-rss-short.xml tests/fixtures/goodreads-signin.html
git commit -m "Parse Goodreads shelf RSS into typed items"
```

---

### Task 5: Goodreads user-id extraction and shelf walker

**Files:**
- Create: `server/utils/goodreads/fetch.ts`, `tests/unit/goodreads-fetch.test.ts`

**Interfaces:**
- Consumes: `parseRssPage`, `GoodreadsFeedError`, `GOODREADS_UA`, `GoodreadsShelf`, `GoodreadsItem`.
- Produces:
  ```ts
  extractGoodreadsUserId(input: string): string | null
  walkShelf(userId: string, shelf: GoodreadsShelf, opts?: { fetchImpl?: typeof fetch; maxPages?: number; delayMs?: number }): Promise<{ items: GoodreadsItem[]; pages: number; truncated: boolean }>
  ```

- [ ] **Step 1: Write the failing tests**

`tests/unit/goodreads-fetch.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { extractGoodreadsUserId, walkShelf } from '../../server/utils/goodreads/fetch'

const page = readFileSync('tests/fixtures/goodreads-rss-page.xml', 'utf8')
const short = readFileSync('tests/fixtures/goodreads-rss-short.xml', 'utf8')
const html = readFileSync('tests/fixtures/goodreads-signin.html', 'utf8')

describe('extractGoodreadsUserId', () => {
  it('accepts profile URLs, list URLs and bare ids', () => {
    expect(extractGoodreadsUserId('https://www.goodreads.com/user/show/12345-mykolas')).toBe('12345')
    expect(extractGoodreadsUserId('goodreads.com/review/list/98765?shelf=read')).toBe('98765')
    expect(extractGoodreadsUserId('https://www.goodreads.com/review/list_rss/1?shelf=read')).toBe('1')
    expect(extractGoodreadsUserId('  4242 ')).toBe('4242')
  })
  it('rejects anything else', () => {
    expect(extractGoodreadsUserId('https://example.com/user/show/1')).toBeNull()
    expect(extractGoodreadsUserId('mykolas')).toBeNull()
  })
})

const fakeFetch = (pages: Record<string, string>) => {
  const calls: string[] = []
  const f = (async (url: string) => {
    calls.push(url)
    const body = pages[new URL(url).searchParams.get('page') ?? '1'] ?? short.replace(/<item>[\s\S]*<\/item>/, '')
    return new Response(body, { status: 200, headers: { 'content-type': 'application/xml' } })
  }) as unknown as typeof fetch
  return { f, calls }
}

describe('walkShelf', () => {
  it('walks pages until a short page', async () => {
    // page 1 has 3 items but we pretend full pages are 3 for the test via pageSize
    const { f, calls } = fakeFetch({ '1': page, '2': short })
    const r = await walkShelf('1', 'read', { fetchImpl: f, delayMs: 0, pageSize: 3 })
    expect(r.items).toHaveLength(4)
    expect(r.pages).toBe(2)
    expect(r.truncated).toBe(false)
    expect(calls[0]).toContain('/review/list_rss/1?shelf=read&page=1')
  })
  it('stops at maxPages and reports truncation', async () => {
    const { f } = fakeFetch({ '1': page, '2': page, '3': page })
    const r = await walkShelf('1', 'to-read', { fetchImpl: f, delayMs: 0, pageSize: 3, maxPages: 2 })
    expect(r.pages).toBe(2)
    expect(r.truncated).toBe(true)
  })
  it('propagates not-rss errors', async () => {
    const { f } = fakeFetch({ '1': html })
    await expect(walkShelf('1', 'read', { fetchImpl: f, delayMs: 0 })).rejects.toMatchObject({ code: 'not-rss' })
  })
})
```

- [ ] **Step 2: Run, expect failure**

Run: `npm test -- goodreads-fetch` → FAIL, module not found.

- [ ] **Step 3: Implement**

`server/utils/goodreads/fetch.ts`:
```ts
import { parseRssPage } from './rss'
import { GOODREADS_UA, type GoodreadsItem, type GoodreadsShelf } from './types'

export function extractGoodreadsUserId(input: string): string | null {
  const s = input.trim()
  if (/^\d{1,12}$/.test(s)) return s
  const m = s.match(/goodreads\.com\/(?:user\/show|review\/list(?:_rss)?)\/(\d{1,12})/i)
  return m ? m[1] : null
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

export async function walkShelf(
  userId: string,
  shelf: GoodreadsShelf,
  opts: { fetchImpl?: typeof fetch; maxPages?: number; delayMs?: number; pageSize?: number } = {},
): Promise<{ items: GoodreadsItem[]; pages: number; truncated: boolean }> {
  const fetchImpl = opts.fetchImpl ?? fetch
  const maxPages = opts.maxPages ?? 30
  const delayMs = opts.delayMs ?? 300
  const pageSize = opts.pageSize ?? 100
  const items: GoodreadsItem[] = []
  let page = 1
  while (page <= maxPages) {
    const url = `https://www.goodreads.com/review/list_rss/${userId}?shelf=${shelf}&page=${page}`
    const res = await fetchImpl(url, { headers: { 'User-Agent': GOODREADS_UA, Accept: 'application/rss+xml, application/xml, text/xml' } })
    const body = await res.text()
    const batch = parseRssPage(body)   // throws GoodreadsFeedError on HTML
    items.push(...batch)
    if (batch.length < pageSize) return { items, pages: page, truncated: false }
    page++
    if (page <= maxPages && delayMs) await sleep(delayMs)
  }
  return { items, pages: maxPages, truncated: true }
}
```

- [ ] **Step 4: Run, expect pass**

Run: `npm test -- goodreads-fetch` → PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add server/utils/goodreads/fetch.ts tests/unit/goodreads-fetch.test.ts
git commit -m "Walk Goodreads shelf RSS pages and extract user ids from URLs"
```

---

### Task 6: Map Goodreads items to database rows

**Files:**
- Create: `server/utils/import/mapping.ts`, `tests/unit/import-mapping.test.ts`

**Interfaces:**
- Consumes: `GoodreadsItem`, `GoodreadsShelf`, `BookRow`, `UserBookRow`, `BookStatus` from `~/types/db`.
- Produces:
  ```ts
  parseSeries(rawTitle: string): { title: string; series: string | null }
  shelfToStatus(shelf: GoodreadsShelf, userShelves: string[]): BookStatus
  toBookRow(item: GoodreadsItem): Pick<BookRow, 'id'|'title'|'series'|'author'|'isbn'|'pages'|'year'|'avg_rating'|'cover_url'|'description'>
  toUserBookRow(userId: string, item: GoodreadsItem, shelf: GoodreadsShelf): Omit<UserBookRow, 'takeaway'>
  ```

- [ ] **Step 1: Failing tests**

`tests/unit/import-mapping.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { parseSeries, shelfToStatus, toBookRow, toUserBookRow } from '../../server/utils/import/mapping'
import type { GoodreadsItem } from '../../server/utils/goodreads/types'

const item: GoodreadsItem = {
  bookId: 186074, title: 'The Name of the Wind (The Kingkiller Chronicle, #1)', author: 'Patrick Rothfuss',
  isbn: '075640407X', pages: 662, published: 2007, avgRating: 4.52, coverUrl: 'https://i.gr-assets.com/x.jpg',
  description: 'desc', userRating: 5, readAt: '2026-05-02', addedAt: '2026-04-13', shelves: ['fantasy', 'favorites'], review: 'loved it',
}

describe('parseSeries', () => {
  it('splits the series suffix', () => {
    expect(parseSeries('The Name of the Wind (The Kingkiller Chronicle, #1)')).toEqual({ title: 'The Name of the Wind', series: 'The Kingkiller Chronicle #1' })
    expect(parseSeries('Shōgun (Asian Saga, #1)')).toEqual({ title: 'Shōgun', series: 'Asian Saga #1' })
  })
  it('leaves plain titles and non-series parentheses alone', () => {
    expect(parseSeries('Stoner')).toEqual({ title: 'Stoner', series: null })
    expect(parseSeries('Night (Penguin Classics)')).toEqual({ title: 'Night (Penguin Classics)', series: null })
  })
})

describe('shelfToStatus', () => {
  it('maps exclusive shelves', () => {
    expect(shelfToStatus('read', [])).toBe('read')
    expect(shelfToStatus('to-read', [])).toBe('want')
    expect(shelfToStatus('currently-reading', [])).toBe('reading')
  })
  it('detects did-not-finish user shelves', () => {
    expect(shelfToStatus('read', ['dnf'])).toBe('dnf')
    expect(shelfToStatus('to-read', ['did-not-finish'])).toBe('dnf')
  })
})

describe('row mapping', () => {
  it('builds a books row', () => {
    expect(toBookRow(item)).toEqual({
      id: 186074, title: 'The Name of the Wind', series: 'The Kingkiller Chronicle #1', author: 'Patrick Rothfuss',
      isbn: '075640407X', pages: 662, year: 2007, avg_rating: 4.52, cover_url: 'https://i.gr-assets.com/x.jpg', description: 'desc',
    })
  })
  it('builds a user_books row', () => {
    expect(toUserBookRow('u1', item, 'read')).toEqual({
      user_id: 'u1', book_id: 186074, status: 'read', my_rating: 5, date_read: '2026-05-02', date_added: '2026-04-13',
      shelves: ['fantasy', 'favorites'], review: 'loved it',
    })
  })
  it('falls back to today when date_added is missing', () => {
    const row = toUserBookRow('u1', { ...item, addedAt: null }, 'to-read')
    expect(row.date_added).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})
```

- [ ] **Step 2: Run, expect failure**

Run: `npm test -- import-mapping` → FAIL, module not found.

- [ ] **Step 3: Implement**

`server/utils/import/mapping.ts`:
```ts
import type { GoodreadsItem, GoodreadsShelf } from '../goodreads/types'
import type { BookRow, BookStatus, UserBookRow } from '~/types/db'

const SERIES_RE = /^(.*?)\s*\(([^()]*?),\s*#(\d+(?:\.\d+)?)\)\s*$/

export function parseSeries(rawTitle: string): { title: string; series: string | null } {
  const m = rawTitle.match(SERIES_RE)
  if (!m) return { title: rawTitle.trim(), series: null }
  return { title: m[1].trim(), series: `${m[2].trim()} #${m[3]}` }
}

const DNF = new Set(['dnf', 'did-not-finish', 'didnt-finish', 'abandoned', 'unfinished'])

export function shelfToStatus(shelf: GoodreadsShelf, userShelves: string[]): BookStatus {
  if (userShelves.some(s => DNF.has(s.toLowerCase()))) return 'dnf'
  if (shelf === 'read') return 'read'
  if (shelf === 'currently-reading') return 'reading'
  return 'want'
}

export type BookInsert = Pick<BookRow, 'id' | 'title' | 'series' | 'author' | 'isbn' | 'pages' | 'year' | 'avg_rating' | 'cover_url' | 'description'>

export function toBookRow(item: GoodreadsItem): BookInsert {
  const { title, series } = parseSeries(item.title)
  return {
    id: item.bookId, title, series, author: item.author, isbn: item.isbn, pages: item.pages,
    year: item.published, avg_rating: item.avgRating, cover_url: item.coverUrl, description: item.description,
  }
}

export function toUserBookRow(userId: string, item: GoodreadsItem, shelf: GoodreadsShelf): Omit<UserBookRow, 'takeaway'> {
  return {
    user_id: userId, book_id: item.bookId, status: shelfToStatus(shelf, item.shelves),
    my_rating: item.userRating, date_read: item.readAt,
    date_added: item.addedAt ?? new Date().toISOString().slice(0, 10),
    shelves: item.shelves, review: item.review,
  }
}
```

- [ ] **Step 4: Run, expect pass**

Run: `npm test -- import-mapping` → PASS (7 tests).

- [ ] **Step 5: Commit**

```bash
git add server/utils/import/mapping.ts tests/unit/import-mapping.test.ts
git commit -m "Map Goodreads items to books and user_books rows"
```

---

### Task 7: Import runner and API routes

**Files:**
- Create: `server/utils/db.ts`, `server/utils/import/runner.ts`, `server/api/import/goodreads.post.ts`, `server/api/imports.get.ts`, `tests/db/import-runner.test.ts`

**Interfaces:**
- Consumes: `walkShelf`, `extractGoodreadsUserId`, `toBookRow`, `toUserBookRow`, `GOODREADS_SHELVES`, `GoodreadsFeedError`, row types.
- Produces:
  ```ts
  adminClient(): SupabaseClient                       // service role, server only
  runGoodreadsImport(args: { userId: string; goodreadsUserId: string; fetchImpl?: typeof fetch; delayMs?: number; client?: SupabaseClient }): Promise<ImportRow>
  upsertItems(client, userId, items: { item: GoodreadsItem; shelf: GoodreadsShelf }[]): Promise<{ inserted: number; updated: number; enqueued: number }>
  POST /api/import/goodreads  body { profile: string }  → ImportRow
  GET  /api/imports → ImportRow[]
  ```

- [ ] **Step 1: Admin client**

`server/utils/db.ts`:
```ts
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let cached: SupabaseClient | null = null
export function adminClient(): SupabaseClient {
  if (cached) return cached
  const cfg = useRuntimeConfig()
  const url = cfg.public.supabase.url as string
  const key = (cfg.supabase as any).secretKey as string
  if (!url || !key) throw new Error('Supabase admin config missing (NUXT_PUBLIC_SUPABASE_URL / NUXT_SUPABASE_SECRET_KEY)')
  cached = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
  return cached
}
```

- [ ] **Step 2: Failing integration test for the runner**

`tests/db/import-runner.test.ts`:
```ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'
import { runGoodreadsImport } from '../../server/utils/import/runner'

const url = process.env.NUXT_PUBLIC_SUPABASE_URL, secret = process.env.NUXT_SUPABASE_SECRET_KEY
const live = Boolean(url && secret)
const page = readFileSync('tests/fixtures/goodreads-rss-page.xml', 'utf8')
const empty = page.replace(/<item>[\s\S]*<\/item>/, '')

describe.skipIf(!live)('runGoodreadsImport', () => {
  const admin = createClient(url!, secret!, { auth: { persistSession: false } })
  let userId: string
  beforeAll(async () => {
    const { data, error } = await admin.auth.admin.createUser({ email: `imp-${Date.now()}@test.local`, password: 'pw-123456', email_confirm: true, user_metadata: { full_name: 'Import Tester' } })
    if (error) throw error
    userId = data.user.id
  })
  afterAll(async () => { await admin.auth.admin.deleteUser(userId) })

  const fetchImpl = (async (u: string) => {
    const shelf = new URL(u).searchParams.get('shelf')
    return new Response(shelf === 'read' ? page : empty, { status: 200 })
  }) as unknown as typeof fetch

  it('imports the read shelf, records counts, and is idempotent', async () => {
    const first = await runGoodreadsImport({ userId, goodreadsUserId: '1', fetchImpl, delayMs: 0, client: admin })
    expect(first.status).toBe('done')
    expect(first.counts.fetched).toBe(3)
    expect(first.counts.inserted).toBe(3)
    const ub = await admin.from('user_books').select('status').eq('user_id', userId)
    expect(ub.data).toHaveLength(3)
    expect(ub.data!.every(r => r.status === 'read')).toBe(true)
    const jobs = await admin.from('jobs').select('kind').eq('kind', 'enrich_book')
    expect(jobs.data!.length).toBeGreaterThanOrEqual(3)

    const second = await runGoodreadsImport({ userId, goodreadsUserId: '1', fetchImpl, delayMs: 0, client: admin })
    expect(second.counts.inserted).toBe(0)
    expect(second.counts.updated).toBe(3)
  })

  it('stores the goodreads id on the profile', async () => {
    const { data } = await admin.from('profiles').select('goodreads_user_id').eq('id', userId).single()
    expect(data!.goodreads_user_id).toBe('1')
  })

  it('fails cleanly on an HTML response', async () => {
    const htmlFetch = (async () => new Response('<html><title>Sign in</title></html>', { status: 200 })) as unknown as typeof fetch
    const r = await runGoodreadsImport({ userId, goodreadsUserId: '1', fetchImpl: htmlFetch, delayMs: 0, client: admin })
    expect(r.status).toBe('failed')
    expect(r.error).toMatch(/private|RSS/i)
  })
})
```

- [ ] **Step 3: Run, expect failure**

Run: `npm run test:db -- import-runner` → FAIL, module not found.

- [ ] **Step 4: Implement the runner**

`server/utils/import/runner.ts`:
```ts
import type { SupabaseClient } from '@supabase/supabase-js'
import { walkShelf } from '../goodreads/fetch'
import { GoodreadsFeedError } from '../goodreads/rss'
import { GOODREADS_SHELVES, type GoodreadsItem, type GoodreadsShelf } from '../goodreads/types'
import { toBookRow, toUserBookRow } from './mapping'
import { adminClient } from '../db'
import type { ImportRow } from '~/types/db'

export async function upsertItems(
  client: SupabaseClient, userId: string, entries: { item: GoodreadsItem; shelf: GoodreadsShelf }[],
): Promise<{ inserted: number; updated: number; enqueued: number }> {
  if (!entries.length) return { inserted: 0, updated: 0, enqueued: 0 }
  const bookRows = entries.map(e => toBookRow(e.item))
  const ids = bookRows.map(b => b.id)

  const { data: existingBooks, error: e1 } = await client.from('books').select('id, enriched_at').in('id', ids)
  if (e1) throw e1
  const known = new Map((existingBooks ?? []).map(b => [b.id as number, b.enriched_at as string | null]))

  // Never overwrite enrichment; only bibliographic fields are upserted.
  const { error: e2 } = await client.from('books').upsert(bookRows, { onConflict: 'id' })
  if (e2) throw e2

  const { data: existingUb, error: e3 } = await client.from('user_books').select('book_id').eq('user_id', userId).in('book_id', ids)
  if (e3) throw e3
  const had = new Set((existingUb ?? []).map(r => r.book_id as number))

  // Preserve takeaway (not in the upsert payload, so onConflict leaves it untouched).
  const ubRows = entries.map(e => toUserBookRow(userId, e.item, e.shelf))
  const { error: e4 } = await client.from('user_books').upsert(ubRows, { onConflict: 'user_id,book_id' })
  if (e4) throw e4

  const toEnrich = ids.filter(id => !known.has(id) || known.get(id) === null)
  let enqueued = 0
  if (toEnrich.length) {
    const { data: queued } = await client.from('jobs').select('payload').eq('kind', 'enrich_book').in('status', ['queued', 'running'])
    const already = new Set((queued ?? []).map(j => (j.payload as any).book_id as number))
    const jobs = toEnrich.filter(id => !already.has(id)).map(id => ({ kind: 'enrich_book', payload: { book_id: id } }))
    if (jobs.length) { const { error } = await client.from('jobs').insert(jobs); if (error) throw error; enqueued = jobs.length }
  }
  return { inserted: ids.filter(id => !had.has(id)).length, updated: ids.filter(id => had.has(id)).length, enqueued }
}

export async function runGoodreadsImport(args: {
  userId: string; goodreadsUserId: string; fetchImpl?: typeof fetch; delayMs?: number; client?: SupabaseClient
}): Promise<ImportRow> {
  const client = args.client ?? adminClient()
  const { data: imp, error } = await client.from('imports').insert({ user_id: args.userId, source: 'rss', status: 'running' }).select().single()
  if (error) throw error
  const finish = async (patch: Partial<ImportRow>) => {
    const { data } = await client.from('imports').update({ ...patch, finished_at: new Date().toISOString() }).eq('id', imp.id).select().single()
    return data as ImportRow
  }
  try {
    await client.from('profiles').update({ goodreads_user_id: args.goodreadsUserId }).eq('id', args.userId)
    const entries: { item: GoodreadsItem; shelf: GoodreadsShelf }[] = []
    let truncated = false
    for (const shelf of GOODREADS_SHELVES) {
      const r = await walkShelf(args.goodreadsUserId, shelf, { fetchImpl: args.fetchImpl, delayMs: args.delayMs })
      truncated ||= r.truncated
      for (const item of r.items) entries.push({ item, shelf })
    }
    if (!entries.length) return finish({ status: 'failed', error: 'No books found. Check that your Goodreads shelves are public, or upload a CSV export instead.' })
    const counts = await upsertItems(client, args.userId, entries)
    await client.from('jobs').insert({ kind: 'generate_threads', payload: { user_id: args.userId } })
    return finish({ status: 'done', counts: { fetched: entries.length, ...counts, truncated } as any })
  } catch (e: any) {
    const msg = e instanceof GoodreadsFeedError
      ? 'Goodreads did not return an RSS feed. Your profile is probably private: make your shelves public, or upload a CSV export instead.'
      : `Import failed: ${e?.message ?? 'unknown error'}`
    return finish({ status: 'failed', error: msg })
  }
}
```

- [ ] **Step 5: Run the DB test, expect pass**

Run: `npm run test:db -- import-runner` → PASS (3 tests).

- [ ] **Step 6: API routes**

`server/api/import/goodreads.post.ts`:
```ts
import { serverSupabaseUser } from '#supabase/server'
import { extractGoodreadsUserId } from '../../utils/goodreads/fetch'
import { runGoodreadsImport } from '../../utils/import/runner'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Sign in first' })
  const body = await readBody<{ profile?: string }>(event)
  const goodreadsUserId = extractGoodreadsUserId(body?.profile ?? '')
  if (!goodreadsUserId) throw createError({ statusCode: 400, statusMessage: 'Paste a Goodreads profile URL like https://www.goodreads.com/user/show/12345-name' })
  return runGoodreadsImport({ userId: user.sub, goodreadsUserId })
})
```

`server/api/imports.get.ts`:
```ts
import { serverSupabaseUser } from '#supabase/server'
import { adminClient } from '../utils/db'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) throw createError({ statusCode: 401 })
  const { data, error } = await adminClient().from('imports').select('*').eq('user_id', user.sub).order('started_at', { ascending: false }).limit(20)
  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  return data
})
```

- [ ] **Step 7: Manual check**

Run `npx nuxt dev`, sign in, then in the browser console:
```js
await $fetch('/api/import/goodreads', { method: 'POST', body: { profile: 'https://www.goodreads.com/user/show/1' } })
```
Expected: an import row with `status: 'done'` and `counts.fetched` in the hundreds (user 1 is the Goodreads founder; this is a real fetch and takes a minute). `await $fetch('/api/imports')` lists it. Then run the same with your own profile URL.

- [ ] **Step 8: Commit**

```bash
git add server/utils/db.ts
git commit -m "Add service-role Supabase client for server code"
git add server/utils/import/runner.ts tests/db/import-runner.test.ts
git commit -m "Run Goodreads RSS import: upsert books, user_books and enrichment jobs"
git add server/api/import/goodreads.post.ts server/api/imports.get.ts
git commit -m "Add import API routes"
```

---

### Task 8: CSV fallback

**Files:**
- Create: `server/utils/goodreads/csv.ts`, `server/api/import/csv.post.ts`, `tests/unit/goodreads-csv.test.ts`, `tests/fixtures/goodreads-export.csv`
- Modify: `server/utils/import/runner.ts` (add `runCsvImport`)

**Interfaces:**
- Produces: `parseGoodreadsCsv(text: string): { item: GoodreadsItem; shelf: GoodreadsShelf }[]`, `runCsvImport({ userId, csv, client? }): Promise<ImportRow>`, `POST /api/import/csv` (multipart field `file`).

- [ ] **Step 1: Fixture in the real Goodreads export format**

`tests/fixtures/goodreads-export.csv` (header is exactly what Goodreads emits; four rows):
```csv
Book Id,Title,Author,Author l-f,Additional Authors,ISBN,ISBN13,My Rating,Average Rating,Publisher,Binding,Number of Pages,Year Published,Original Publication Year,Date Read,Date Added,Bookshelves,Bookshelves with positions,Exclusive Shelf,My Review,Spoiler,Private Notes,Read Count,Owned Copies
186074,"The Name of the Wind (The Kingkiller Chronicle, #1)",Patrick Rothfuss,"Rothfuss, Patrick",,"=""075640407X""","=""9780756404079""",5,4.52,DAW Books,Hardcover,662,2007,2007,2026/05/02,2026/04/13,fantasy,fantasy (#1),read,Loved it,,,1,0
5107,The Catcher in the Rye,J.D. Salinger,"Salinger, J.D.",,"=""""","=""""",0,3.80,Little Brown,Paperback,277,2001,1951,,2026/06/11,,,to-read,,,,0,0
4671,The Great Gatsby,F. Scott Fitzgerald,"Fitzgerald, F. Scott",,"=""0743273567""","=""9780743273565""",0,3.93,Scribner,Paperback,180,2004,1925,,2023/12/10,,,read,,,,1,0
2767052,"The Hunger Games (The Hunger Games, #1)",Suzanne Collins,"Collins, Suzanne",,"=""0439023483""","=""9780439023481""",0,4.34,Scholastic,Hardcover,374,2008,2008,,2026/06/11,dnf,dnf (#1),read,,,,1,0
```

- [ ] **Step 2: Failing tests**

`tests/unit/goodreads-csv.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { parseGoodreadsCsv } from '../../server/utils/goodreads/csv'

const csv = readFileSync('tests/fixtures/goodreads-export.csv', 'utf8')

describe('parseGoodreadsCsv', () => {
  it('parses rows into items with shelves', () => {
    const rows = parseGoodreadsCsv(csv)
    expect(rows).toHaveLength(4)
    const wind = rows.find(r => r.item.bookId === 186074)!
    expect(wind.shelf).toBe('read')
    expect(wind.item.isbn).toBe('075640407X')
    expect(wind.item.userRating).toBe(5)
    expect(wind.item.readAt).toBe('2026-05-02')
    expect(wind.item.addedAt).toBe('2026-04-13')
    expect(wind.item.published).toBe(2007)
    expect(wind.item.shelves).toEqual(['fantasy'])
    expect(wind.item.review).toBe('Loved it')
  })
  it('maps exclusive shelf and empty values', () => {
    const rows = parseGoodreadsCsv(csv)
    const catcher = rows.find(r => r.item.bookId === 5107)!
    expect(catcher.shelf).toBe('to-read')
    expect(catcher.item.isbn).toBeNull()
    expect(catcher.item.userRating).toBeNull()
    expect(catcher.item.readAt).toBeNull()
    expect(catcher.item.published).toBe(1951)
  })
  it('keeps dnf shelves so status mapping can see them', () => {
    const hg = parseGoodreadsCsv(csv).find(r => r.item.bookId === 2767052)!
    expect(hg.item.shelves).toContain('dnf')
  })
  it('throws on a file without the Goodreads header', () => {
    expect(() => parseGoodreadsCsv('a,b,c\n1,2,3')).toThrow(/Goodreads export/)
  })
})
```

- [ ] **Step 3: Run, expect failure**

Run: `npm test -- goodreads-csv` → FAIL, module not found.

- [ ] **Step 4: Implement the parser (RFC 4180 by hand, no dependency)**

`server/utils/goodreads/csv.ts`:
```ts
import type { GoodreadsItem, GoodreadsShelf } from './types'

function parseCsv(text: string): string[][] {
  const rows: string[][] = []; let row: string[] = []; let field = ''; let q = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (q) {
      if (c === '"') { if (text[i + 1] === '"') { field += '"'; i++ } else q = false }
      else field += c
    } else if (c === '"') q = true
    else if (c === ',') { row.push(field); field = '' }
    else if (c === '\n' || c === '\r') { if (c === '\r' && text[i + 1] === '\n') i++; row.push(field); rows.push(row); row = []; field = '' }
    else field += c
  }
  if (field.length || row.length) { row.push(field); rows.push(row) }
  return rows.filter(r => r.some(f => f !== ''))
}

const clean = (s: string | undefined) => (s ?? '').replace(/^="?|"?$/g, '').trim()   // Goodreads wraps ISBNs as ="0123"
const num = (s: string | undefined) => { const c = clean(s); const n = Number(c); return c === '' || Number.isNaN(n) ? null : n }
const date = (s: string | undefined) => { const c = clean(s); return /^\d{4}\/\d{2}\/\d{2}$/.test(c) ? c.replace(/\//g, '-') : null }

export function parseGoodreadsCsv(text: string): { item: GoodreadsItem; shelf: GoodreadsShelf }[] {
  const rows = parseCsv(text.replace(/^﻿/, ''))
  const header = rows[0] ?? []
  const col = (name: string) => header.indexOf(name)
  if (col('Book Id') < 0 || col('Exclusive Shelf') < 0) throw new Error('This does not look like a Goodreads export (missing "Book Id" / "Exclusive Shelf" columns)')
  const get = (r: string[], name: string) => r[col(name)]
  return rows.slice(1).flatMap(r => {
    const bookId = num(get(r, 'Book Id'))
    if (!bookId) return []
    const exclusive = clean(get(r, 'Exclusive Shelf'))
    const shelf: GoodreadsShelf = exclusive === 'read' ? 'read' : exclusive === 'currently-reading' ? 'currently-reading' : 'to-read'
    const rating = num(get(r, 'My Rating'))
    const item: GoodreadsItem = {
      bookId, title: clean(get(r, 'Title')), author: clean(get(r, 'Author')),
      isbn: clean(get(r, 'ISBN')) || clean(get(r, 'ISBN13')) || null,
      pages: num(get(r, 'Number of Pages')),
      published: num(get(r, 'Original Publication Year')) ?? num(get(r, 'Year Published')),
      avgRating: num(get(r, 'Average Rating')), coverUrl: null, description: null,
      userRating: rating && rating > 0 ? rating : null,
      readAt: date(get(r, 'Date Read')), addedAt: date(get(r, 'Date Added')),
      shelves: clean(get(r, 'Bookshelves')).split(',').map(s => s.trim()).filter(Boolean),
      review: clean(get(r, 'My Review')) || null,
    }
    return [{ item, shelf }]
  })
}
```

- [ ] **Step 5: Run, expect pass**

Run: `npm test -- goodreads-csv` → PASS (4 tests).

- [ ] **Step 6: Add the CSV runner and route**

Append to `server/utils/import/runner.ts`:
```ts
import { parseGoodreadsCsv } from '../goodreads/csv'

export async function runCsvImport(args: { userId: string; csv: string; client?: SupabaseClient }): Promise<ImportRow> {
  const client = args.client ?? adminClient()
  const { data: imp, error } = await client.from('imports').insert({ user_id: args.userId, source: 'csv', status: 'running' }).select().single()
  if (error) throw error
  const finish = async (patch: Partial<ImportRow>) => {
    const { data } = await client.from('imports').update({ ...patch, finished_at: new Date().toISOString() }).eq('id', imp.id).select().single()
    return data as ImportRow
  }
  try {
    const entries = parseGoodreadsCsv(args.csv)
    if (!entries.length) return finish({ status: 'failed', error: 'The CSV had no books in it.' })
    const counts = await upsertItems(client, args.userId, entries)
    await client.from('jobs').insert({ kind: 'generate_threads', payload: { user_id: args.userId } })
    return finish({ status: 'done', counts: { fetched: entries.length, ...counts } })
  } catch (e: any) {
    return finish({ status: 'failed', error: e?.message ?? 'CSV import failed' })
  }
}
```
(Move the `import` line to the top of the file with the others.)

`server/api/import/csv.post.ts`:
```ts
import { serverSupabaseUser } from '#supabase/server'
import { runCsvImport } from '../../utils/import/runner'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Sign in first' })
  const parts = await readMultipartFormData(event)
  const file = parts?.find(p => p.name === 'file')
  if (!file?.data?.length) throw createError({ statusCode: 400, statusMessage: 'Attach your Goodreads export as "file"' })
  if (file.data.length > 10 * 1024 * 1024) throw createError({ statusCode: 413, statusMessage: 'CSV larger than 10 MB' })
  return runCsvImport({ userId: user.sub, csv: new TextDecoder('utf-8').decode(file.data) })
})
```

- [ ] **Step 7: Manual check**

Export your own library from Goodreads (My Books → Import and export → Export Library), then in the browser console while signed in:
```js
const fd = new FormData(); fd.append('file', await (await fetch('/path-you-serve-or-drag')).blob()) // or use the page in Task 9
```
Simplest: wait for Task 9's upload form. Unit tests already cover the parser; the route is exercised in Task 9 Step 5.

- [ ] **Step 8: Commit**

```bash
git add server/utils/goodreads/csv.ts tests/unit/goodreads-csv.test.ts tests/fixtures/goodreads-export.csv
git commit -m "Parse Goodreads CSV exports into the same item shape"
git add server/utils/import/runner.ts server/api/import/csv.post.ts
git commit -m "Add CSV import runner and upload route"
```

---

### Task 9: Import page

**Files:**
- Create: `app/pages/me/import.vue`

**Interfaces:**
- Consumes: `POST /api/import/goodreads`, `POST /api/import/csv`, `GET /api/imports`, `useSession()`.

- [ ] **Step 1: Build the page**

`app/pages/me/import.vue`:
```vue
<script setup lang="ts">
import type { ImportRow } from '~/types/db'
import { fmtDate } from '~/utils/library'

const { profile, reload } = useSession()
const profileUrl = ref(profile.value?.goodreads_user_id ? `https://www.goodreads.com/user/show/${profile.value.goodreads_user_id}` : '')
const busy = ref<'rss' | 'csv' | null>(null)
const message = ref<string | null>(null)
const file = ref<File | null>(null)
const { data: history, refresh } = await useFetch<ImportRow[]>('/api/imports')

const linkGoodreads = async () => {
  busy.value = 'rss'; message.value = null
  try {
    const r = await $fetch<ImportRow>('/api/import/goodreads', { method: 'POST', body: { profile: profileUrl.value } })
    message.value = r.status === 'done' ? `Imported ${r.counts.fetched} books.` : r.error
    await Promise.all([refresh(), reload()])
  } catch (e: any) { message.value = e?.data?.statusMessage ?? e.message }
  finally { busy.value = null }
}
const uploadCsv = async () => {
  if (!file.value) return
  busy.value = 'csv'; message.value = null
  try {
    const fd = new FormData(); fd.append('file', file.value)
    const r = await $fetch<ImportRow>('/api/import/csv', { method: 'POST', body: fd })
    message.value = r.status === 'done' ? `Imported ${r.counts.fetched} books from CSV.` : r.error
    await refresh()
  } catch (e: any) { message.value = e?.data?.statusMessage ?? e.message }
  finally { busy.value = null }
}
useHead({ title: 'BookMap · Import' })
</script>

<template>
  <div class="page wrap imp">
    <p class="eyebrow">Import</p>
    <h1>Bring your shelves</h1>
    <p class="lede">Paste your Goodreads profile link. BookMap reads your public shelves and keeps them in sync nightly. If your profile is private, upload the CSV export instead.</p>

    <section class="card box">
      <h3>Link Goodreads</h3>
      <p class="small muted">Find your profile link under your avatar on Goodreads: it looks like <code>goodreads.com/user/show/12345-name</code>.</p>
      <form class="row" @submit.prevent="linkGoodreads">
        <input v-model="profileUrl" class="search grow" type="url" placeholder="https://www.goodreads.com/user/show/12345-name" required />
        <button class="chip on" :disabled="busy !== null">{{ busy === 'rss' ? 'Importing…' : 'Import' }}</button>
      </form>
    </section>

    <section class="card box">
      <h3>Or upload a CSV export</h3>
      <p class="small muted">On Goodreads: My Books → Import and export → Export Library. Attach the downloaded file.</p>
      <form class="row" @submit.prevent="uploadCsv">
        <input class="grow" type="file" accept=".csv,text/csv" @change="file = ($event.target as HTMLInputElement).files?.[0] ?? null" />
        <button class="chip on" :disabled="busy !== null || !file">{{ busy === 'csv' ? 'Importing…' : 'Upload' }}</button>
      </form>
    </section>

    <p v-if="message" class="msg" role="status">{{ message }}</p>
    <p v-if="profile" class="small muted">Your shelf lives at <NuxtLink :to="`/u/${profile.handle}`">/u/{{ profile.handle }}</NuxtLink>.</p>

    <section class="section">
      <h2>History</h2>
      <div v-if="!history?.length" class="muted small">No imports yet.</div>
      <div v-else class="card tbl">
        <table>
          <thead><tr><th>When</th><th>Source</th><th>Status</th><th>Books</th><th>Note</th></tr></thead>
          <tbody>
            <tr v-for="h in history" :key="h.id">
              <td>{{ fmtDate(h.started_at.slice(0, 10)) }}</td>
              <td>{{ h.source.toUpperCase() }}</td>
              <td>{{ h.status }}</td>
              <td class="num">{{ h.counts.fetched ?? '' }}</td>
              <td class="small muted">{{ h.error ?? (h.counts.truncated ? 'Large library: the rest arrives with the nightly sync.' : '') }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<style scoped>
.imp { max-width: 760px; }
.box { padding: 18px 20px; margin-top: 18px; }
.box h3 { margin-bottom: 6px; }
.row { display: flex; gap: 10px; margin-top: 12px; flex-wrap: wrap; }
.grow { flex: 1; min-width: 240px; }
.msg { margin-top: 16px; font-weight: 600; }
.tbl { padding: 6px 18px; margin-top: 14px; overflow-x: auto; }
table { width: 100%; border-collapse: collapse; font-size: 14px; }
th { text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: .08em; color: var(--ink-3); padding: 10px 8px 8px; border-bottom: 1px solid var(--line); }
td { padding: 9px 8px; border-bottom: 1px solid var(--line); vertical-align: top; }
.num { text-align: right; font-variant-numeric: tabular-nums; }
code { font-size: 12px; background: var(--bg-2); padding: 1px 5px; border-radius: 4px; }
</style>
```

- [ ] **Step 2: Manual verification**

Run `npx nuxt dev`, sign in, open `/me/import`. Paste your Goodreads profile URL, click Import: message shows a count, history lists a `done` row. Upload your CSV export: second row appears. In Studio, `user_books` has rows for your user with the right statuses.

- [ ] **Step 3: Commit**

```bash
git add app/pages/me/import.vue
git commit -m "Add import page with Goodreads link, CSV upload and history"
```

---

### Task 10: Public profiles: views render any handle from Supabase

**Files:**
- Create: `app/utils/profile-mapping.ts`, `tests/unit/profile-mapping.test.ts`, `app/composables/useProfileLibrary.ts`, `app/middleware/handle.ts`, `app/pages/u/[handle].vue`, `app/pages/u/[handle]/{index,map,timeline,lenses,character,insights}.vue`, `app/components/views/{Shelf,Map,Timeline,Lenses,Character,Insights}View.vue`
- Modify: `app/data/books.ts`, `app/composables/useLibrary.ts`, `app/app.vue`, `app/pages/index.vue`, `app/components/BookDrawer.vue`
- Delete: `app/pages/{map,timeline,lenses,character,insights}.vue`

**Interfaces:**
- Consumes: `BookRow`, `UserBookRow`, `ProfileRow`.
- Produces:
  ```ts
  rowToBook(book: BookRow, ub: UserBookRow): Book
  useProfileLibrary(handle: string): Promise<{ profile: ProfileRow; books: Book[] }>   // throws 404 via createError
  useLibrary(): unchanged return shape; `books` is now reactive state
  useCharacter(list: Book[]): unchanged return shape
  ```

- [ ] **Step 1: Extend the Book type**

In `app/data/books.ts`:
```ts
export type Status = 'read' | 'want' | 'reading' | 'dnf'
```
and add to `interface Book` after `why?: string`:
```ts
  coverUrl?: string        // direct image URL (Goodreads); falls back to Open Library id
  enriched?: boolean       // false for imported books the worker has not processed yet
  summary?: { gist: string; ideas: string[]; people?: string[] }
```

- [ ] **Step 2: Failing mapping test**

`tests/unit/profile-mapping.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { rowToBook } from '~/utils/profile-mapping'
import type { BookRow, UserBookRow } from '~/types/db'

const book: BookRow = {
  id: 186074, title: 'The Name of the Wind', series: 'The Kingkiller Chronicle #1', author: 'Patrick Rothfuss', isbn: null,
  pages: 662, year: 2007, avg_rating: 4.52, cover_url: 'https://i.gr-assets.com/x.jpg', openlibrary_cover_id: null, description: null,
  author_country: 'United States', author_place: 'Madison, Wisconsin', lat: 43.07, lng: -89.4, language: 'English',
  genre: 'Fantasy & Sci-Fi', form: 'Novel', themes: ['music', 'magic'], stats: { imagination: 3 }, blurb: 'A story about stories.',
  summary: null, enriched_at: '2026-09-21T00:00:00Z', enrich_model: 'claude-sonnet-5',
}
const ub: UserBookRow = { user_id: 'u', book_id: 186074, status: 'read', my_rating: 5, date_read: '2026-05-02', date_added: '2026-04-13', shelves: [], review: null, takeaway: 'Prose you can hear.' }

describe('rowToBook', () => {
  it('maps an enriched book', () => {
    const b = rowToBook(book, ub)
    expect(b.id).toBe('186074')
    expect(b.authorId).toBe('patrick-rothfuss')
    expect(b.country).toBe('United States')
    expect(b.genre).toBe('Fantasy & Sci-Fi')
    expect(b.stats).toEqual({ imagination: 3 })
    expect(b.takeaway).toBe('Prose you can hear.')
    expect(b.why).toBe('A story about stories.')
    expect(b.coverUrl).toBe('https://i.gr-assets.com/x.jpg')
    expect(b.enriched).toBe(true)
    expect(b.myRating).toBe(5)
  })
  it('gives safe defaults for an unenriched book', () => {
    const b = rowToBook({ ...book, author_country: null, lat: null, lng: null, genre: null, form: null, themes: [], stats: {}, enriched_at: null, year: null, pages: null }, { ...ub, my_rating: null, takeaway: null })
    expect(b.enriched).toBe(false)
    expect(b.country).toBe('Unknown')
    expect(b.genre).toBe('Literary Fiction')
    expect(b.form).toBe('Novel')
    expect(b.year).toBe(0)
    expect(b.pages).toBe(0)
    expect(b.lat).toBeNaN()
    expect(b.myRating).toBeUndefined()
  })
})
```

- [ ] **Step 3: Run, expect failure**

Run: `npm test -- profile-mapping` → FAIL, module not found.

- [ ] **Step 4: Implement the mapper**

`app/utils/profile-mapping.ts`:
```ts
import type { Book, Genre, Form } from '~/data/books'
import type { BookRow, UserBookRow } from '~/types/db'

export const slugify = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

export function rowToBook(b: BookRow, u: UserBookRow): Book {
  const enriched = b.enriched_at !== null
  return {
    id: String(b.id),
    title: b.title,
    series: b.series ?? undefined,
    author: b.author,
    authorId: slugify(b.author),
    country: b.author_country ?? 'Unknown',
    place: b.author_place ?? '',
    lat: b.lat ?? NaN,
    lng: b.lng ?? NaN,
    language: b.language ?? 'Unknown',
    year: b.year ?? 0,
    genre: (b.genre as Genre) ?? 'Literary Fiction',
    form: (b.form as Form) ?? 'Novel',
    themes: b.themes ?? [],
    status: u.status,
    myRating: u.my_rating ?? undefined,
    avgRating: b.avg_rating ?? 0,
    dateRead: u.date_read ?? undefined,
    dateAdded: u.date_added,
    pages: b.pages ?? 0,
    stats: (b.stats as Book['stats']) ?? {},
    takeaway: u.takeaway ?? undefined,
    why: b.blurb ?? undefined,
    coverUrl: b.cover_url ?? undefined,
    enriched,
    summary: b.summary ?? undefined,
  }
}

export function rowsToBooks(userBooks: (UserBookRow & { books: BookRow })[]): Book[] {
  return userBooks.map(r => rowToBook(r.books, r))
}
```

- [ ] **Step 5: Run, expect pass**

Run: `npm test -- profile-mapping` → PASS (2 tests).

- [ ] **Step 6: Make useLibrary read from state**

In `app/composables/useLibrary.ts`:
- Replace `import { books, ... } from '~/data/books'` with `import { STATS, type Book, type StatKey } from '~/data/books'` (no static `books`).
- `coverUrl` becomes:
  ```ts
  export const coverUrl = (b: Book, size: 'S' | 'M' | 'L' = 'M') => {
    if (b.coverUrl) return b.coverUrl
    const id = coverIds[b.id]
    return id ? `https://covers.openlibrary.org/b/id/${id}-${size}.jpg` : null
  }
  ```
- Inside `useLibrary()` add `const books = useState<Book[]>('bm-books', () => [])` as the first line and use `books.value` everywhere `books` was used (`read`, `want`, `reading`, `must`, `filtered`). Return `books` (the ref) in place of the array.
- `useCharacter` takes `list: Book[]` as its parameter and uses `list` instead of the imported `books`:
  ```ts
  export function useCharacter(list: Book[]) {
    const read = list.filter(b => b.status === 'read')
    const want = list.filter(b => b.status !== 'read')
    ...
  ```
  (The rest of the function body is unchanged.)

Every consumer of `books` from `useLibrary()` now gets a ref: grep and add `.value` where it is used in script blocks (`index.vue` uses `books.map`, `map.vue` uses `useLibrary().books.map`, `insights.vue` uses `books.find` and `books.filter`). Templates unwrap refs automatically.

- [ ] **Step 7: Profile loader and middleware**

`app/composables/useProfileLibrary.ts`:
```ts
import type { Book } from '~/data/books'
import type { ProfileRow, BookRow, UserBookRow } from '~/types/db'
import { rowsToBooks } from '~/utils/profile-mapping'

export async function useProfileLibrary(handle: string) {
  const client = useSupabaseClient()
  const books = useState<Book[]>('bm-books', () => [])
  const profile = useState<ProfileRow | null>('bm-viewed-profile', () => null)

  const { data, error } = await useAsyncData(`profile-${handle}`, async () => {
    const { data: p } = await client.from('profiles').select('*').eq('handle', handle).maybeSingle()
    if (!p) return null
    const { data: rows, error } = await client
      .from('user_books')
      .select('*, books(*)')
      .eq('user_id', (p as ProfileRow).id)
    if (error) throw error
    return { profile: p as ProfileRow, books: rowsToBooks((rows ?? []) as (UserBookRow & { books: BookRow })[]) }
  })
  if (error.value) throw createError({ statusCode: 500, statusMessage: error.value.message })
  if (!data.value) throw createError({ statusCode: 404, statusMessage: 'No such shelf' })
  profile.value = data.value.profile
  books.value = data.value.books
  return { profile: data.value.profile, books: data.value.books }
}
```

`app/middleware/handle.ts` (validates the shape early so bad handles 404 without a query):
```ts
export default defineNuxtRouteMiddleware((to) => {
  const h = to.params.handle
  if (typeof h === 'string' && !/^[a-z0-9][a-z0-9-]{1,22}[a-z0-9]$/.test(h)) {
    return abortNavigation(createError({ statusCode: 404, statusMessage: 'No such shelf' }))
  }
})
```

- [ ] **Step 8: Move page bodies into view components**

For each of the six pages, create `app/components/views/<Name>View.vue` with the exact current `<script setup>`, `<template>` and `<style scoped>` of the page, with these edits:
- Remove `useHead({ title: ... })` lines (the parent sets titles).
- `CharacterView.vue`: `const c = useCharacter(useLibrary().books.value)` becomes reactive: `const { books } = useLibrary(); const c = computed(() => useCharacter(books.value))` and every `c.` in the template becomes `c.`… Vue unwraps the computed in templates, so template code stays `c.stats`, `c.badges` etc. In the script, `weakest`/`quests`/`xpPct` reference `c.value.stats`, `c.value.readerLevel`, `c.value.pages`, `c.value.nextPages`.
- `InsightsView.vue`: `import { threads } from '~/data/threads'` is replaced by `const threads = useState<{ id: string; title: string; books: string[]; text: string }[]>('bm-threads', () => [])` and the Threads section gets `v-if="threads.length"`. `byId` must tolerate missing ids: `const byId = (id: string) => books.value.find(b => b.id === id)` and the cover loop uses `<BookCover v-for="b in t.books.map(byId).filter(Boolean)" :key="b!.id" :book="b!" …>`. The hard-coded `women` author-id list is removed along with its tile (it cannot generalise to other users).
- `MapView.vue` and `TimelineView.vue`: filter out unplaced books before drawing: in `WorldMap` usage pass `:books="filtered.filter(b => Number.isFinite(b.lat))"`; in the timeline strip and eras use `filtered.filter(b => b.year !== 0)`.
- `LensesView.vue`: theme lens `fn: b => b.themes[0] ?? 'untagged'`.
- `ShelfView.vue`: hero copy loses the first-person framing: eyebrow becomes `{{ profile?.display_name }}'s reading map` using `const profile = useState<ProfileRow | null>('bm-viewed-profile')`; the "Most recently finished" line stays.

Then create the route files. `app/pages/u/[handle].vue`:
```vue
<script setup lang="ts">
definePageMeta({ middleware: 'handle' })
const route = useRoute()
const handle = computed(() => String(route.params.handle))
const { profile } = await useProfileLibrary(handle.value)
useHead({ title: () => `${profile.display_name} · BookMap` })
const tabs = [
  { to: '', label: 'Shelf' }, { to: '/map', label: 'Map' }, { to: '/timeline', label: 'Timeline' },
  { to: '/lenses', label: 'Lenses' }, { to: '/character', label: 'Character' }, { to: '/insights', label: 'Insights' },
]
</script>
<template>
  <div>
    <nav class="wrap tabs" aria-label="Views">
      <NuxtLink v-for="t in tabs" :key="t.to" :to="`/u/${handle}${t.to}`" class="chip">{{ t.label }}</NuxtLink>
    </nav>
    <NuxtPage />
  </div>
</template>
<style scoped>
.tabs { display: flex; gap: 6px; flex-wrap: wrap; padding-top: 18px; }
.chip.router-link-exact-active { background: var(--accent); color: var(--accent-ink); border-color: var(--accent); font-weight: 600; }
</style>
```

Six child pages, each one line of template, for example `app/pages/u/[handle]/map.vue`:
```vue
<template><MapView /></template>
```
and `index.vue` → `<ShelfView />`, `timeline.vue` → `<TimelineView />`, `lenses.vue` → `<LensesView />`, `character.vue` → `<CharacterView />`, `insights.vue` → `<InsightsView />`.

Delete `app/pages/map.vue`, `timeline.vue`, `lenses.vue`, `character.vue`, `insights.vue`.

- [ ] **Step 9: Landing page and header**

Replace `app/pages/index.vue` with:
```vue
<script setup lang="ts">
const { user, profile } = useSession()
watch([user, profile], () => { if (user.value && profile.value) navigateTo(`/u/${profile.value.handle}`, { replace: true }) }, { immediate: true })
useHead({ title: 'BookMap' })
</script>
<template>
  <div class="page wrap landing">
    <p class="eyebrow">A reading map for anyone</p>
    <h1>Every book, placed.</h1>
    <p class="lede">Sign in with Google, paste your Goodreads profile, and get your shelf as a world map, a timeline, a character sheet and the threads between books.</p>
    <div class="cta">
      <NuxtLink to="/login" class="chip on big">Continue with Google</NuxtLink>
      <NuxtLink :to="`/u/${$config.public.demoHandle}`" class="chip big">See an example shelf</NuxtLink>
    </div>
  </div>
</template>
<style scoped>
.landing { max-width: 680px; padding-top: 60px; }
.cta { display: flex; gap: 10px; margin-top: 24px; flex-wrap: wrap; }
.big { font-size: 15px; padding: 12px 22px; text-decoration: none; }
</style>
```
Add `demoHandle: 'mykolas'` to `runtimeConfig.public` in `nuxt.config.ts` (override with `NUXT_PUBLIC_DEMO_HANDLE`; set it to the owner's real handle after Task 12).

In `app/app.vue` remove the six fixed `links` and the `<nav>` that renders them (the handle page has its own tabs). Keep brand, Import, Sign in/out.

- [ ] **Step 10: Drawer reads the summary from the book**

In `app/components/BookDrawer.vue` replace `import { summaries } from '~/data/summaries'` and `const refresher = computed(() => (selected.value ? summaries[selected.value.id] : undefined))` with `const refresher = computed(() => selected.value?.summary)`. Nothing else changes.

- [ ] **Step 11: Verify**

Run `npm test` → all unit tests pass. Run `npx nuxt dev`: `/` shows the landing; signed in you land on `/u/<handle>`; all six tabs render with your imported books (covers from Goodreads, unenriched books show default genre and are absent from the map). `/u/does-not-exist` returns 404. `npx nuxt build` succeeds.

- [ ] **Step 12: Commit (one per logical change)**

```bash
git add app/data/books.ts && git commit -m "Extend Book type with coverUrl, enriched and summary"
git add app/utils/profile-mapping.ts tests/unit/profile-mapping.test.ts && git commit -m "Map database rows to client books"
git add app/composables/useLibrary.ts && git commit -m "Read library from shared state instead of the static file"
git add app/composables/useProfileLibrary.ts app/middleware/handle.ts && git commit -m "Load a profile's library by handle"
git add app/components/views && git commit -m "Move the six page bodies into view components"
git add app/pages/u && git rm -q app/pages/map.vue app/pages/timeline.vue app/pages/lenses.vue app/pages/character.vue app/pages/insights.vue && git commit -m "Serve views under /u/[handle]"
git add app/pages/index.vue app/app.vue nuxt.config.ts && git commit -m "Add landing page and handle-aware header"
git add app/components/BookDrawer.vue && git commit -m "Read refresher summary from the book record"
```

---

### Task 11: Owner edits in the drawer

**Files:**
- Modify: `app/components/BookDrawer.vue`, `app/composables/useLibrary.ts`

**Interfaces:**
- Produces: `updateUserBook(bookId: string, patch: { status?: Status; my_rating?: number | null; takeaway?: string | null }): Promise<void>` on `useLibrary()`; updates Supabase under RLS and the local state.

- [ ] **Step 1: Add the update method**

In `useLibrary()`:
```ts
const updateUserBook = async (bookId: string, patch: { status?: Status; my_rating?: number | null; takeaway?: string | null }) => {
  const client = useSupabaseClient()
  const user = useSupabaseUser()
  if (!user.value) return
  const { error } = await client.from('user_books').update(patch).eq('user_id', user.value.sub).eq('book_id', Number(bookId))
  if (error) throw error
  const b = books.value.find(x => x.id === bookId)
  if (b) {
    if (patch.status) b.status = patch.status
    if ('my_rating' in patch) b.myRating = patch.my_rating ?? undefined
    if ('takeaway' in patch) b.takeaway = patch.takeaway ?? undefined
  }
}
```
Return it. Import `Status` type from `~/data/books`.

- [ ] **Step 2: Drawer controls, visible only to the owner**

In `BookDrawer.vue` script:
```ts
const { selected, select, updateUserBook } = useLibrary()
const { profile } = useSession()
const viewed = useState<ProfileRow | null>('bm-viewed-profile')
const isOwner = computed(() => !!profile.value && !!viewed.value && profile.value.id === viewed.value.id)
const draft = ref('')
watch(selected, s => { draft.value = s?.takeaway ?? '' })
const saving = ref(false)
const save = async (patch: Parameters<typeof updateUserBook>[1]) => {
  if (!selected.value) return
  saving.value = true
  try { await updateUserBook(selected.value.id, patch) } finally { saving.value = false }
}
```
In the template, under the ratings block:
```vue
<section v-if="isOwner" class="edit">
  <h3>Edit</h3>
  <div class="chips">
    <button v-for="s in (['read','reading','want','dnf'] as const)" :key="s" class="chip" :class="{ on: selected.status === s }" @click="save({ status: s })">{{ { read: 'Read', reading: 'Reading', want: 'Want to read', dnf: 'Did not finish' }[s] }}</button>
  </div>
  <div class="stars-edit">
    <button v-for="n in 5" :key="n" class="star" :class="{ on: (selected.myRating ?? 0) >= n }" :aria-label="`${n} stars`" @click="save({ my_rating: selected.myRating === n ? null : n })">★</button>
  </div>
  <textarea v-model="draft" class="ta" rows="4" placeholder="What did you take from it?" />
  <button class="chip on" :disabled="saving || draft === (selected.takeaway ?? '')" @click="save({ takeaway: draft || null })">{{ saving ? 'Saving…' : 'Save takeaway' }}</button>
</section>
```
Styles:
```css
.edit { margin-top: 22px; padding-top: 16px; border-top: 1px solid var(--line); }
.stars-edit { margin: 12px 0; display: flex; gap: 2px; }
.star { font-size: 22px; color: var(--line-strong); opacity: .35; padding: 0 2px; }
.star.on { opacity: 1; }
.ta { width: 100%; font: inherit; padding: 10px 12px; border: 1px solid var(--line); border-radius: var(--r-sm); background: var(--card); color: var(--ink); margin-bottom: 10px; resize: vertical; }
```

- [ ] **Step 3: Verify**

Signed in on your own shelf: change a status, rate a book, write and save a takeaway, reload, the change persists. Sign out, view the same shelf: no Edit section. Open another user's shelf while signed in: no Edit section. In Studio, `user_books.takeaway` updated.

- [ ] **Step 4: Commit**

```bash
git add app/composables/useLibrary.ts && git commit -m "Update own user_books from the client under RLS"
git add app/components/BookDrawer.vue && git commit -m "Let the owner edit status, rating and takeaway in the drawer"
```

---

### Task 12: Seed the owner's account from the data files

**Files:**
- Create: `scripts/seed-owner.mjs`, `scripts/seed-map.json`
- Modify: `README.md`

**Interfaces:**
- Consumes: `app/data/books.ts`, `summaries.ts`, `threads.ts` (read via `tsx`), the owner's `user_books` after a real RSS import (Task 9).
- Produces: `books` rows enriched by hand (`enrich_model = 'hand'`), `user_books.takeaway` filled, `threads` row for the owner.

- [ ] **Step 1: Install tsx for reading the TS data files**

```bash
npm install -D tsx
```

- [ ] **Step 2: Write the seed script**

`scripts/seed-owner.mjs`:
```js
// Push hand-curated data from app/data/*.ts into Supabase for one user.
// Usage: NUXT_PUBLIC_SUPABASE_URL=... NUXT_SUPABASE_SECRET_KEY=... node --import tsx scripts/seed-owner.mjs <handle>
// Run AFTER that user has imported their Goodreads shelves (so user_books exists to match against).
import { createClient } from '@supabase/supabase-js'
import { readFileSync, writeFileSync } from 'node:fs'
import 'dotenv/config'
import { books } from '../app/data/books.ts'
import { summaries } from '../app/data/summaries.ts'
import { threads } from '../app/data/threads.ts'

const handle = process.argv[2]
if (!handle) { console.error('usage: seed-owner.mjs <handle>'); process.exit(1) }
const client = createClient(process.env.NUXT_PUBLIC_SUPABASE_URL, process.env.NUXT_SUPABASE_SECRET_KEY, { auth: { persistSession: false } })
const manual = JSON.parse(readFileSync(new URL('./seed-map.json', import.meta.url), 'utf8'))   // { "<books.ts id>": <goodreads book id> }

const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\(.*?\)/g, '').split(':')[0].replace(/[^a-z0-9]+/g, ' ').trim()
const last = a => a.split(' ').pop().toLowerCase()

const { data: profile } = await client.from('profiles').select('id').eq('handle', handle).single()
if (!profile) { console.error('no profile for', handle); process.exit(1) }
const { data: rows } = await client.from('user_books').select('book_id, books(id, title, author)').eq('user_id', profile.id)
const byKey = new Map(rows.map(r => [`${norm(r.books.title)}|${last(r.books.author)}`, r.books.id]))

const idMap = {}; const unmatched = []
for (const b of books) {
  const gid = manual[b.id] ?? byKey.get(`${norm(b.title)}|${last(b.author)}`)
  if (gid) idMap[b.id] = gid; else unmatched.push(`${b.id}  (${b.title} — ${b.author})`)
}
if (unmatched.length) {
  console.log(`Unmatched ${unmatched.length}: add them to scripts/seed-map.json as "<id>": <goodreads book id>\n` + unmatched.join('\n'))
}

let books_updated = 0, ub_updated = 0
for (const b of books) {
  const gid = idMap[b.id]; if (!gid) continue
  const { error: e1 } = await client.from('books').update({
    author_country: b.country, author_place: b.place, lat: b.lat, lng: b.lng, language: b.language,
    year: b.year, pages: b.pages, genre: b.genre, form: b.form, themes: b.themes, stats: b.stats,
    blurb: b.why ?? null, summary: summaries[b.id] ?? null, enriched_at: new Date().toISOString(), enrich_model: 'hand',
  }).eq('id', gid)
  if (e1) throw e1; books_updated++
  const { error: e2 } = await client.from('user_books').update({ takeaway: b.takeaway ?? null, status: b.status, my_rating: b.myRating ?? null, date_read: b.dateRead ?? null })
    .eq('user_id', profile.id).eq('book_id', gid)
  if (e2) throw e2; ub_updated++
}
const mapped = threads.map(t => ({ title: t.title, book_ids: t.books.map(id => String(idMap[id])).filter(x => x !== 'undefined'), text: t.text }))
await client.from('threads').upsert({ user_id: profile.id, threads: mapped, generated_at: new Date().toISOString() })
// delete any enrichment jobs for hand-enriched books
await client.from('jobs').delete().eq('kind', 'enrich_book').in('payload->>book_id', Object.values(idMap).map(String))
console.log({ books_updated, ub_updated, threads: mapped.length, unmatched: unmatched.length })
```
`scripts/seed-map.json` starts as `{}`.

- [ ] **Step 3: Load threads on the profile page**

In `app/composables/useProfileLibrary.ts`, inside the `useAsyncData` handler after fetching rows:
```ts
const { data: th } = await client.from('threads').select('threads').eq('user_id', (p as ProfileRow).id).maybeSingle()
```
return `threads: (th?.threads ?? []) as { title: string; book_ids: string[]; text: string }[]` and after the 404 check set `useState('bm-threads').value = data.value.threads.map((t, i) => ({ id: String(i), title: t.title, books: t.book_ids, text: t.text }))`.

- [ ] **Step 4: Run the seed against local**

```bash
node --import tsx scripts/seed-owner.mjs <your-handle>
```
Expected: prints counts; for unmatched titles (subtitles and translations often differ), find the Goodreads book id in the `books` table via Studio and add to `seed-map.json`, re-run until `unmatched: 0`. Your `/u/<handle>` now shows genres, the map, stats, takeaways, refreshers and threads exactly as the static site did.

- [ ] **Step 5: Update the README**

Replace the "Edit the library" section with: local dev (`npx supabase start`, `.env` from `supabase status -o env`, Google OAuth client), `npm run dev`, `npm test`, `npm run test:db`, import via `/me/import`, seeding the owner with the command above, and a note that `app/data/*.ts` are now the owner's seed, not the live data.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json scripts/seed-owner.mjs scripts/seed-map.json && git commit -m "Seed a user's account from the hand-curated data files"
git add app/composables/useProfileLibrary.ts && git commit -m "Load generated threads with a profile"
git add README.md && git commit -m "Document local Supabase setup, import and seeding"
```

---

### Task 13: Cloudflare Workers deploy and nightly sync

**Files:**
- Create: `server/tasks/sync/profiles.ts`
- Modify: `nuxt.config.ts`, `package.json`, `.gitignore`, `README.md`

**Interfaces:**
- Consumes: `runGoodreadsImport`, `adminClient`.
- Produces: `nuxt build` emits a Worker; cron `0 3 * * *` runs task `sync:profiles`.

- [ ] **Step 1: Nitro preset and scheduled task config**

In `nuxt.config.ts` replace the `nitro` block:
```ts
nitro: {
  preset: 'cloudflare_module',
  experimental: { tasks: true },
  scheduledTasks: { '0 3 * * *': ['sync:profiles'] },
  cloudflare: {
    wrangler: {
      name: 'bookmap',
      compatibility_date: '2025-09-01',
      compatibility_flags: ['nodejs_compat'],
    },
  },
},
```
Remove the old `prerender` routes. Install Wrangler: `npm install -D wrangler`. Add scripts: `"deploy": "nuxt build && wrangler deploy"`, `"preview:cf": "nuxt build && wrangler dev"`. Add `.wrangler` to `.gitignore`.

- [ ] **Step 2: Nightly sync task**

`server/tasks/sync/profiles.ts`:
```ts
import { adminClient } from '../../utils/db'
import { runGoodreadsImport } from '../../utils/import/runner'

export default defineTask({
  meta: { name: 'sync:profiles', description: 'Re-import Goodreads shelves for every linked profile' },
  async run() {
    const client = adminClient()
    const { data: profiles, error } = await client.from('profiles').select('id, goodreads_user_id').not('goodreads_user_id', 'is', null)
    if (error) throw error
    const results: Record<string, string> = {}
    for (const p of profiles ?? []) {
      const r = await runGoodreadsImport({ userId: p.id, goodreadsUserId: p.goodreads_user_id! })
      results[p.id] = r.status
    }
    return { result: results }
  },
})
```

- [ ] **Step 3: Verify locally**

Run `npx nuxt dev`; tasks are exposed in dev at `/_nitro/tasks/sync:profiles`:
```bash
curl -s http://localhost:3000/_nitro/tasks/sync:profiles
```
Expected: JSON with `result` mapping your profile id to `done` and a new `imports` row.

- [ ] **Step 4: Build for Workers and check the generated cron**

```bash
npx nuxt build
cat .output/server/wrangler.json
```
Expected: `triggers.crons` contains `"0 3 * * *"`, `main` points at the server entry, `assets` binding present. If the file is named differently or crons are missing, check the Nitro Cloudflare provider docs for the current output path before continuing.

- [ ] **Step 5: Create the production Supabase project and secrets**

In the Supabase dashboard create a project, run `npx supabase link --project-ref <ref>` then `npx supabase db push` to apply the three migrations. Enable Google under Authentication → Providers with the same Google client (add `https://<ref>.supabase.co/auth/v1/callback` to its authorised redirect URIs) and add `https://<your-worker-domain>/confirm` to Redirect URLs, site URL to the Worker domain.

```bash
npx wrangler login
npx wrangler secret put NUXT_SUPABASE_SECRET_KEY
npx wrangler secret put NUXT_PUBLIC_SUPABASE_URL
npx wrangler secret put NUXT_PUBLIC_SUPABASE_KEY
npx wrangler secret put NUXT_PUBLIC_SITE_URL      # https://<your-worker-domain>
npx wrangler secret put NUXT_PUBLIC_DEMO_HANDLE   # your handle
```

- [ ] **Step 6: Deploy and smoke test**

```bash
npm run deploy
```
On the deployed URL: landing renders, Google sign-in completes, `/me/import` imports your shelf, `/u/<handle>/map` renders. Run the seed script against production with the production env vars. Trigger the cron manually from the Cloudflare dashboard (Worker → Triggers → Cron → Run) and confirm a new `imports` row.

- [ ] **Step 7: Commit**

```bash
git add nuxt.config.ts package.json package-lock.json .gitignore && git commit -m "Target Cloudflare Workers with a nightly sync cron"
git add server/tasks/sync/profiles.ts && git commit -m "Add nightly Goodreads re-sync task"
git add README.md && git commit -m "Document Cloudflare deployment"
```

---

## Self-review

**Spec coverage.** Auth + profiles with unique handles: Tasks 2–3. Data model with all six tables including the enrichment columns and `summary`: Task 2. RSS import with the 30-page cap, sequential fetches, UA, private-profile failure message, shelf→status mapping including dnf: Tasks 4–7. CSV fallback: Task 8 (deviation: the file is parsed in the request rather than stored in Supabase Storage; nothing needs the stored file, so this is a simplification, not a gap). Import UI and history: Task 9. Public `/u/handle` views, `useProfileLibrary`, landing, 404 for unknown handles: Task 10. Owner edit affordances: Task 11. Seeding the owner from `books.ts`, `summaries.ts`, `threads.ts` with hand enrichment winning (`enrich_model='hand'`): Task 12. Cloudflare Workers, secrets, cron nightly sync: Task 13. Enrichment worker, threads generation, settings/delete account, demo profile polish: out of scope by design, but `jobs` rows are already enqueued so the next plan starts with a populated queue.

**Placeholder scan.** No TBD/TODO. Every code step has code. Task 7 Step 7 and Task 8 Step 7 are manual checks with concrete commands or a pointer to the UI that exercises them.

**Type consistency.** `GoodreadsItem` fields (`bookId`, `readAt`, `addedAt`, `userRating`, `shelves`) are used identically in rss.ts, csv.ts, mapping.ts and the tests. `runGoodreadsImport` signature `{ userId, goodreadsUserId, fetchImpl?, delayMs?, client? }` matches its test and both callers (route, task). `useLibrary().books` is a ref everywhere after Task 10; `useCharacter(list)` takes the array. `useState` keys are `bm-books`, `bm-viewed-profile`, `bm-threads`, `bm-profile`, `bm-status`, `bm-query`, `bm-selected`, used consistently. `Status` includes `dnf` in `books.ts` and `BookStatus` in `types/db.ts` matches the Postgres enum.

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

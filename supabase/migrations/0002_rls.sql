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

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

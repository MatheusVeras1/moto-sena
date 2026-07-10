drop policy if exists "admins read own profile" on public.admin_profiles;

create policy "admins read own profile"
on public.admin_profiles
for select
to authenticated
using (user_id = (select auth.uid()));

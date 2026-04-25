-- Enable RLS
alter table firms enable row level security;
alter table firm_members enable row level security;
alter table firm_invites enable row level security;

-- Firms access: only members can read
create policy "firm members can read firm"
on firms for select
using (
  exists (
    select 1 from firm_members
    where firm_members.firm_id = firms.id
    and firm_members.user_id = auth.uid()
  )
);

-- Firm members: users see their firm teammates
create policy "members can view team"
on firm_members for select
using (
  exists (
    select 1 from firm_members fm
    where fm.firm_id = firm_members.firm_id
    and fm.user_id = auth.uid()
  )
);

-- Admins manage members
create policy "admins manage members"
on firm_members for all
using (
  exists (
    select 1 from firm_members
    where firm_members.firm_id = firm_members.firm_id
    and firm_members.user_id = auth.uid()
    and firm_members.role = 'admin'
  )
);

-- Invites visible to admins
create policy "admins view invites"
on firm_invites for select
using (
  exists (
    select 1 from firm_members
    where firm_members.firm_id = firm_invites.firm_id
    and firm_members.user_id = auth.uid()
    and firm_members.role = 'admin'
  )
);

-- Admins create invites
create policy "admins create invites"
on firm_invites for insert
with check (
  exists (
    select 1 from firm_members
    where firm_members.firm_id = firm_invites.firm_id
    and firm_members.user_id = auth.uid()
    and firm_members.role = 'admin'
  )
);


alter table organizations
  add column if not exists region_code varchar(8);

alter table organizations
  add constraint organizations_region_code_fkey
  foreign key (region_code) references regions(code);

create index if not exists idx_organizations_region_code on organizations(region_code);

create table if not exists user_region_preferences (
  id bigserial primary key,
  user_id bigint not null references users(id) on delete cascade,
  region_code varchar(8) not null references regions(code),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);

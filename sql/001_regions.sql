create table if not exists regions (
  id bigserial primary key,
  code varchar(8) not null unique,
  slug varchar(32) not null unique,
  name varchar(128) not null,
  app_base_url varchar(255) not null,
  signin_url varchar(255) not null,
  signup_url varchar(255) not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into regions (code, slug, name, app_base_url, signin_url, signup_url)
values
  ('IN', 'india', 'India', 'https://in.klaro.services', 'https://in.klaro.services/signin', 'https://in.klaro.services/signup'),
  ('AE', 'uae', 'UAE', 'https://ae.klaro.services', 'https://ae.klaro.services/signin', 'https://ae.klaro.services/signup'),
  ('US', 'us', 'United States', 'https://us.klaro.services', 'https://us.klaro.services/signin', 'https://us.klaro.services/signup'),
  ('EU', 'eu', 'European Union', 'https://eu.klaro.services', 'https://eu.klaro.services/signin', 'https://eu.klaro.services/signup')
on conflict (code) do update
set
  slug = excluded.slug,
  name = excluded.name,
  app_base_url = excluded.app_base_url,
  signin_url = excluded.signin_url,
  signup_url = excluded.signup_url,
  updated_at = now();

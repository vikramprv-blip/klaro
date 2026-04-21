CREATE TABLE regions (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  currency_code TEXT NOT NULL,
  timezone_name TEXT NOT NULL,
  data_residency_mode TEXT NOT NULL,
  default_legal_entity_code TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE legal_entities (
  code TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  region_code TEXT NOT NULL REFERENCES regions(code),
  tax_mode TEXT NOT NULL,
  contracting_country TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE products (
  id BIGSERIAL PRIMARY KEY,
  product_key TEXT NOT NULL UNIQUE,
  product_name TEXT NOT NULL,
  product_surface TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE region_products (
  id BIGSERIAL PRIMARY KEY,
  product_id BIGINT NOT NULL REFERENCES products(id),
  region_code TEXT NOT NULL REFERENCES regions(code),
  legal_entity_code TEXT NOT NULL REFERENCES legal_entities(code),
  sku_prefix TEXT NOT NULL,
  price_book_key TEXT NOT NULL,
  terms_version TEXT NOT NULL,
  privacy_version TEXT NOT NULL,
  support_plan_key TEXT NOT NULL,
  policy_pack_key TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (product_id, region_code)
);

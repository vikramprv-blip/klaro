CREATE TABLE orgs (
  id UUID PRIMARY KEY,
  region_code TEXT NOT NULL REFERENCES regions(code),
  legal_entity_code TEXT NOT NULL REFERENCES legal_entities(code),
  product_id BIGINT NOT NULL REFERENCES products(id),
  external_key TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (region_code, product_id, external_key)
);

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES orgs(id),
  region_code TEXT NOT NULL REFERENCES regions(code),
  legal_entity_code TEXT NOT NULL REFERENCES legal_entities(code),
  product_id BIGINT NOT NULL REFERENCES products(id),
  plan_key TEXT NOT NULL,
  status TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE entitlements (
  id UUID PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES orgs(id),
  region_code TEXT NOT NULL REFERENCES regions(code),
  product_id BIGINT NOT NULL REFERENCES products(id),
  feature_key TEXT NOT NULL REFERENCES feature_flags(key),
  source_type TEXT NOT NULL,
  source_id TEXT NOT NULL,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE user_consents (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  region_code TEXT NOT NULL REFERENCES regions(code),
  legal_entity_code TEXT NOT NULL REFERENCES legal_entities(code),
  product_id BIGINT NOT NULL REFERENCES products(id),
  consent_type TEXT NOT NULL,
  document_version TEXT NOT NULL,
  granted BOOLEAN NOT NULL,
  granted_at TIMESTAMPTZ NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

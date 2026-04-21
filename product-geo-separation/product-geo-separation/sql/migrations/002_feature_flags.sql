CREATE TABLE feature_flags (
  key TEXT PRIMARY KEY,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE product_feature_defaults (
  product_id BIGINT NOT NULL REFERENCES products(id),
  feature_key TEXT NOT NULL REFERENCES feature_flags(key),
  enabled BOOLEAN NOT NULL,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (product_id, feature_key)
);

CREATE TABLE region_feature_overrides (
  product_id BIGINT NOT NULL REFERENCES products(id),
  region_code TEXT NOT NULL REFERENCES regions(code),
  feature_key TEXT NOT NULL REFERENCES feature_flags(key),
  enabled BOOLEAN NOT NULL,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (product_id, region_code, feature_key)
);

CREATE TABLE org_feature_overrides (
  org_id UUID NOT NULL,
  product_id BIGINT NOT NULL REFERENCES products(id),
  region_code TEXT NOT NULL REFERENCES regions(code),
  feature_key TEXT NOT NULL REFERENCES feature_flags(key),
  enabled BOOLEAN NOT NULL,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (org_id, product_id, region_code, feature_key)
);

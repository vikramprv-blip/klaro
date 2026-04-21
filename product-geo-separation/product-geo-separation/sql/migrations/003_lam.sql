CREATE TABLE lam_policies (
  key TEXT PRIMARY KEY,
  region_code TEXT NOT NULL REFERENCES regions(code),
  version TEXT NOT NULL,
  description TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (region_code, version)
);

CREATE TABLE lam_policy_rules (
  id BIGSERIAL PRIMARY KEY,
  policy_key TEXT NOT NULL REFERENCES lam_policies(key),
  rule_namespace TEXT NOT NULL,
  rule_key TEXT NOT NULL,
  rule_value JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (policy_key, rule_namespace, rule_key)
);

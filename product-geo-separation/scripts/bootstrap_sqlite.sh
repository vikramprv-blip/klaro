#!/usr/bin/env bash
set -euo pipefail

mkdir -p data

sqlite3 data/product_geo.db <<'SQL'
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS regions (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  currency_code TEXT NOT NULL,
  timezone_name TEXT NOT NULL,
  data_residency_mode TEXT NOT NULL,
  default_legal_entity_code TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS legal_entities (
  code TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  region_code TEXT NOT NULL REFERENCES regions(code),
  tax_mode TEXT NOT NULL,
  contracting_country TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_key TEXT NOT NULL UNIQUE,
  product_name TEXT NOT NULL,
  product_surface TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS region_products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL REFERENCES products(id),
  region_code TEXT NOT NULL REFERENCES regions(code),
  legal_entity_code TEXT NOT NULL REFERENCES legal_entities(code),
  sku_prefix TEXT NOT NULL,
  price_book_key TEXT NOT NULL,
  terms_version TEXT NOT NULL,
  privacy_version TEXT NOT NULL,
  support_plan_key TEXT NOT NULL,
  policy_pack_key TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (product_id, region_code)
);

CREATE TABLE IF NOT EXISTS feature_flags (
  key TEXT PRIMARY KEY,
  description TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS product_feature_defaults (
  product_id INTEGER NOT NULL REFERENCES products(id),
  feature_key TEXT NOT NULL REFERENCES feature_flags(key),
  enabled INTEGER NOT NULL,
  config_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (product_id, feature_key)
);

CREATE TABLE IF NOT EXISTS region_feature_overrides (
  product_id INTEGER NOT NULL REFERENCES products(id),
  region_code TEXT NOT NULL REFERENCES regions(code),
  feature_key TEXT NOT NULL REFERENCES feature_flags(key),
  enabled INTEGER NOT NULL,
  config_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (product_id, region_code, feature_key)
);

CREATE TABLE IF NOT EXISTS org_feature_overrides (
  org_id TEXT NOT NULL,
  product_id INTEGER NOT NULL REFERENCES products(id),
  region_code TEXT NOT NULL REFERENCES regions(code),
  feature_key TEXT NOT NULL REFERENCES feature_flags(key),
  enabled INTEGER NOT NULL,
  config_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (org_id, product_id, region_code, feature_key)
);

CREATE TABLE IF NOT EXISTS lam_policies (
  key TEXT PRIMARY KEY,
  region_code TEXT NOT NULL REFERENCES regions(code),
  version TEXT NOT NULL,
  description TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (region_code, version)
);

CREATE TABLE IF NOT EXISTS lam_policy_rules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  policy_key TEXT NOT NULL REFERENCES lam_policies(key),
  rule_namespace TEXT NOT NULL,
  rule_key TEXT NOT NULL,
  rule_value_json TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (policy_key, rule_namespace, rule_key)
);

CREATE TABLE IF NOT EXISTS orgs (
  id TEXT PRIMARY KEY,
  region_code TEXT NOT NULL REFERENCES regions(code),
  legal_entity_code TEXT NOT NULL REFERENCES legal_entities(code),
  product_id INTEGER NOT NULL REFERENCES products(id),
  external_key TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (region_code, product_id, external_key)
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL REFERENCES orgs(id),
  region_code TEXT NOT NULL REFERENCES regions(code),
  legal_entity_code TEXT NOT NULL REFERENCES legal_entities(code),
  product_id INTEGER NOT NULL REFERENCES products(id),
  plan_key TEXT NOT NULL,
  status TEXT NOT NULL,
  started_at TEXT NOT NULL,
  ended_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS entitlements (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL REFERENCES orgs(id),
  region_code TEXT NOT NULL REFERENCES regions(code),
  product_id INTEGER NOT NULL REFERENCES products(id),
  feature_key TEXT NOT NULL REFERENCES feature_flags(key),
  source_type TEXT NOT NULL,
  source_id TEXT NOT NULL,
  config_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_consents (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  region_code TEXT NOT NULL REFERENCES regions(code),
  legal_entity_code TEXT NOT NULL REFERENCES legal_entities(code),
  product_id INTEGER NOT NULL REFERENCES products(id),
  consent_type TEXT NOT NULL,
  document_version TEXT NOT NULL,
  granted INTEGER NOT NULL,
  granted_at TEXT NOT NULL,
  metadata_json TEXT NOT NULL DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_region_products_region ON region_products(region_code, product_id);
CREATE INDEX IF NOT EXISTS idx_region_feature_overrides_lookup ON region_feature_overrides(product_id, region_code, feature_key);
CREATE INDEX IF NOT EXISTS idx_org_feature_overrides_lookup ON org_feature_overrides(org_id, product_id, region_code, feature_key);
CREATE INDEX IF NOT EXISTS idx_orgs_region_product ON orgs(region_code, product_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_region_product ON subscriptions(region_code, product_id);
CREATE INDEX IF NOT EXISTS idx_entitlements_org_feature ON entitlements(org_id, feature_key);
CREATE INDEX IF NOT EXISTS idx_user_consents_user_region_product ON user_consents(user_id, region_code, product_id);

INSERT OR IGNORE INTO regions (code, name, currency_code, timezone_name, data_residency_mode, default_legal_entity_code) VALUES
('IN', 'India', 'INR', 'Asia/Kolkata', 'in-country', 'openai-india'),
('AE', 'UAE', 'AED', 'Asia/Dubai', 'regional', 'openai-uae'),
('US', 'United States', 'USD', 'America/Los_Angeles', 'us', 'openai-us'),
('EU', 'European Union', 'EUR', 'Europe/Dublin', 'eu', 'openai-eu');

INSERT OR IGNORE INTO legal_entities (code, display_name, region_code, tax_mode, contracting_country) VALUES
('openai-india', 'OpenAI India', 'IN', 'gst', 'IN'),
('openai-uae', 'OpenAI UAE', 'AE', 'vat_ae', 'AE'),
('openai-us', 'OpenAI US', 'US', 'sales_tax', 'US'),
('openai-eu', 'OpenAI EU', 'EU', 'vat_eu', 'IE');

INSERT OR IGNORE INTO products (id, product_key, product_name, product_surface) VALUES
(1, 'chatgpt-consumer', 'ChatGPT Consumer', 'consumer'),
(2, 'chatgpt-business', 'ChatGPT Business', 'business'),
(3, 'chatgpt-enterprise', 'ChatGPT Enterprise', 'enterprise'),
(4, 'api-platform', 'API Platform', 'api');

INSERT OR IGNORE INTO feature_flags (key, description) VALUES
('consumer.chat', 'Core chat UX'),
('consumer.voice', 'Voice'),
('consumer.image_gen', 'Image generation'),
('consumer.memory', 'Memory'),
('business.sso', 'SSO'),
('business.scim', 'SCIM'),
('business.audit_logs', 'Audit logs'),
('enterprise.data_residency', 'Data residency'),
('enterprise.zero_data_retention', 'Zero data retention'),
('payments.card', 'Card payments'),
('payments.invoice', 'Invoice billing'),
('compliance.export_archive', 'Export archive'),
('compliance.custom_retention', 'Custom retention');

INSERT OR IGNORE INTO region_products
(product_id, region_code, legal_entity_code, sku_prefix, price_book_key, terms_version, privacy_version, support_plan_key, policy_pack_key, status)
VALUES
(1, 'IN', 'openai-india', 'IN-CONS', 'pb_in_consumer', 'in_tos_v1', 'in_privacy_v1', 'support_standard', 'lam.in', 'active'),
(1, 'AE', 'openai-uae', 'AE-CONS', 'pb_ae_consumer', 'ae_tos_v1', 'ae_privacy_v1', 'support_standard', 'lam.ae', 'active'),
(1, 'US', 'openai-us', 'US-CONS', 'pb_us_consumer', 'us_tos_v1', 'us_privacy_v1', 'support_standard', 'lam.us', 'active'),
(1, 'EU', 'openai-eu', 'EU-CONS', 'pb_eu_consumer', 'eu_tos_v1', 'eu_privacy_v1', 'support_standard', 'lam.eu', 'active'),
(2, 'IN', 'openai-india', 'IN-BIZ', 'pb_in_business', 'in_tos_v1', 'in_privacy_v1', 'support_business', 'lam.in', 'active'),
(2, 'AE', 'openai-uae', 'AE-BIZ', 'pb_ae_business', 'ae_tos_v1', 'ae_privacy_v1', 'support_business', 'lam.ae', 'active'),
(2, 'US', 'openai-us', 'US-BIZ', 'pb_us_business', 'us_tos_v1', 'us_privacy_v1', 'support_business', 'lam.us', 'active'),
(2, 'EU', 'openai-eu', 'EU-BIZ', 'pb_eu_business', 'eu_tos_v1', 'eu_privacy_v1', 'support_business', 'lam.eu', 'active'),
(3, 'IN', 'openai-india', 'IN-ENT', 'pb_in_enterprise', 'in_tos_v1', 'in_privacy_v1', 'support_enterprise', 'lam.in', 'active'),
(3, 'AE', 'openai-uae', 'AE-ENT', 'pb_ae_enterprise', 'ae_tos_v1', 'ae_privacy_v1', 'support_enterprise', 'lam.ae', 'active'),
(3, 'US', 'openai-us', 'US-ENT', 'pb_us_enterprise', 'us_tos_v1', 'us_privacy_v1', 'support_enterprise', 'lam.us', 'active'),
(3, 'EU', 'openai-eu', 'EU-ENT', 'pb_eu_enterprise', 'eu_tos_v1', 'eu_privacy_v1', 'support_enterprise', 'lam.eu', 'active'),
(4, 'IN', 'openai-india', 'IN-API', 'pb_in_api', 'in_tos_v1', 'in_privacy_v1', 'support_api', 'lam.in', 'active'),
(4, 'AE', 'openai-uae', 'AE-API', 'pb_ae_api', 'ae_tos_v1', 'ae_privacy_v1', 'support_api', 'lam.ae', 'active'),
(4, 'US', 'openai-us', 'US-API', 'pb_us_api', 'us_tos_v1', 'us_privacy_v1', 'support_api', 'lam.us', 'active'),
(4, 'EU', 'openai-eu', 'EU-API', 'pb_eu_api', 'eu_tos_v1', 'eu_privacy_v1', 'support_api', 'lam.eu', 'active');

INSERT OR IGNORE INTO product_feature_defaults (product_id, feature_key, enabled, config_json) VALUES
(1, 'consumer.chat', 1, '{}'),
(1, 'consumer.voice', 1, '{}'),
(1, 'consumer.image_gen', 1, '{}'),
(1, 'payments.card', 1, '{}'),
(2, 'consumer.chat', 1, '{}'),
(2, 'business.sso', 1, '{}'),
(2, 'business.audit_logs', 1, '{}'),
(2, 'payments.card', 1, '{}'),
(2, 'payments.invoice', 1, '{}'),
(3, 'consumer.chat', 1, '{}'),
(3, 'business.sso', 1, '{}'),
(3, 'business.scim', 1, '{}'),
(3, 'business.audit_logs', 1, '{}'),
(3, 'enterprise.data_residency', 1, '{}'),
(3, 'enterprise.zero_data_retention', 1, '{}'),
(3, 'payments.invoice', 1, '{}'),
(3, 'compliance.custom_retention', 1, '{}'),
(4, 'payments.card', 1, '{}'),
(4, 'payments.invoice', 1, '{}'),
(4, 'compliance.export_archive', 1, '{}');

INSERT OR IGNORE INTO region_feature_overrides (product_id, region_code, feature_key, enabled, config_json) VALUES
(3, 'IN', 'enterprise.data_residency', 1, '{"mode":"in-country"}'),
(3, 'AE', 'enterprise.data_residency', 1, '{"mode":"regional"}'),
(3, 'EU', 'enterprise.data_residency', 1, '{"mode":"eu"}'),
(1, 'EU', 'consumer.memory', 1, '{"notes":"example regional override"}');

INSERT OR IGNORE INTO lam_policies (key, region_code, version, description, active) VALUES
('lam.in.v1', 'IN', 'v1', 'India regional product policy pack', 1),
('lam.ae.v1', 'AE', 'v1', 'UAE regional product policy pack', 1),
('lam.us.v1', 'US', 'v1', 'US regional product policy pack', 1),
('lam.eu.v1', 'EU', 'v1', 'EU regional product policy pack', 1);

INSERT OR IGNORE INTO lam_policy_rules (policy_key, rule_namespace, rule_key, rule_value_json) VALUES
('lam.in.v1', 'billing', 'tax_mode', '"gst"'),
('lam.in.v1', 'privacy', 'data_residency_required', 'true'),
('lam.in.v1', 'privacy', 'cross_border_transfer_requires_basis', 'true'),
('lam.ae.v1', 'billing', 'tax_mode', '"vat_ae"'),
('lam.ae.v1', 'privacy', 'data_residency_required', 'false'),
('lam.ae.v1', 'privacy', 'cross_border_transfer_requires_basis', 'true'),
('lam.us.v1', 'billing', 'tax_mode', '"sales_tax"'),
('lam.us.v1', 'privacy', 'data_residency_required', 'false'),
('lam.us.v1', 'privacy', 'cross_border_transfer_requires_basis', 'false'),
('lam.eu.v1', 'billing', 'tax_mode', '"vat_eu"'),
('lam.eu.v1', 'privacy', 'data_residency_required', 'true'),
('lam.eu.v1', 'privacy', 'cross_border_transfer_requires_basis', 'true');
SQL

echo "SQLite DB ready: data/product_geo.db"

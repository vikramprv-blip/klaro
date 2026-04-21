INSERT OR IGNORE INTO products (product_key, product_name, product_surface) VALUES
('ca-suite', 'CA Suite', 'professional'),
('lawyer-suite', 'Lawyer Suite', 'professional');

INSERT OR IGNORE INTO feature_flags (key, description) VALUES
('suite.workspace', 'Professional workspace'),
('suite.documents', 'Document workspace'),
('suite.case_management', 'Case or matter management'),
('suite.compliance_center', 'Compliance center'),
('suite.billing_reports', 'Billing and reporting'),
('suite.client_portal', 'Client portal'),
('suite.team_members', 'Team members'),
('suite.templates.ca', 'CA templates'),
('suite.templates.lawyer', 'Lawyer templates'),
('suite.filings.tax', 'Tax and statutory filings'),
('suite.filings.legal', 'Legal drafting and filing flows'),
('suite.region_rules', 'Region-specific rule packs');

INSERT OR IGNORE INTO region_products
(product_id, region_code, legal_entity_code, sku_prefix, price_book_key, terms_version, privacy_version, support_plan_key, policy_pack_key, status)
SELECT p.id, 'IN', 'openai-india', 'IN-CA', 'pb_in_ca_suite', 'in_ca_tos_v1', 'in_ca_privacy_v1', 'support_professional', 'lam.in', 'active'
FROM products p WHERE p.product_key = 'ca-suite';

INSERT OR IGNORE INTO region_products
(product_id, region_code, legal_entity_code, sku_prefix, price_book_key, terms_version, privacy_version, support_plan_key, policy_pack_key, status)
SELECT p.id, 'AE', 'openai-uae', 'AE-CA', 'pb_ae_ca_suite', 'ae_ca_tos_v1', 'ae_ca_privacy_v1', 'support_professional', 'lam.ae', 'active'
FROM products p WHERE p.product_key = 'ca-suite';

INSERT OR IGNORE INTO region_products
(product_id, region_code, legal_entity_code, sku_prefix, price_book_key, terms_version, privacy_version, support_plan_key, policy_pack_key, status)
SELECT p.id, 'US', 'openai-us', 'US-CA', 'pb_us_ca_suite', 'us_ca_tos_v1', 'us_ca_privacy_v1', 'support_professional', 'lam.us', 'active'
FROM products p WHERE p.product_key = 'ca-suite';

INSERT OR IGNORE INTO region_products
(product_id, region_code, legal_entity_code, sku_prefix, price_book_key, terms_version, privacy_version, support_plan_key, policy_pack_key, status)
SELECT p.id, 'EU', 'openai-eu', 'EU-CA', 'pb_eu_ca_suite', 'eu_ca_tos_v1', 'eu_ca_privacy_v1', 'support_professional', 'lam.eu', 'active'
FROM products p WHERE p.product_key = 'ca-suite';

INSERT OR IGNORE INTO region_products
(product_id, region_code, legal_entity_code, sku_prefix, price_book_key, terms_version, privacy_version, support_plan_key, policy_pack_key, status)
SELECT p.id, 'IN', 'openai-india', 'IN-LAW', 'pb_in_lawyer_suite', 'in_lawyer_tos_v1', 'in_lawyer_privacy_v1', 'support_professional', 'lam.in', 'active'
FROM products p WHERE p.product_key = 'lawyer-suite';

INSERT OR IGNORE INTO region_products
(product_id, region_code, legal_entity_code, sku_prefix, price_book_key, terms_version, privacy_version, support_plan_key, policy_pack_key, status)
SELECT p.id, 'AE', 'openai-uae', 'AE-LAW', 'pb_ae_lawyer_suite', 'ae_lawyer_tos_v1', 'ae_lawyer_privacy_v1', 'support_professional', 'lam.ae', 'active'
FROM products p WHERE p.product_key = 'lawyer-suite';

INSERT OR IGNORE INTO region_products
(product_id, region_code, legal_entity_code, sku_prefix, price_book_key, terms_version, privacy_version, support_plan_key, policy_pack_key, status)
SELECT p.id, 'US', 'openai-us', 'US-LAW', 'pb_us_lawyer_suite', 'us_lawyer_tos_v1', 'us_lawyer_privacy_v1', 'support_professional', 'lam.us', 'active'
FROM products p WHERE p.product_key = 'lawyer-suite';

INSERT OR IGNORE INTO region_products
(product_id, region_code, legal_entity_code, sku_prefix, price_book_key, terms_version, privacy_version, support_plan_key, policy_pack_key, status)
SELECT p.id, 'EU', 'openai-eu', 'EU-LAW', 'pb_eu_lawyer_suite', 'eu_lawyer_tos_v1', 'eu_lawyer_privacy_v1', 'support_professional', 'lam.eu', 'active'
FROM products p WHERE p.product_key = 'lawyer-suite';

INSERT OR IGNORE INTO product_feature_defaults (product_id, feature_key, enabled, config_json)
SELECT p.id, 'suite.workspace', 1, '{}' FROM products p WHERE p.product_key = 'ca-suite';
INSERT OR IGNORE INTO product_feature_defaults (product_id, feature_key, enabled, config_json)
SELECT p.id, 'suite.documents', 1, '{}' FROM products p WHERE p.product_key = 'ca-suite';
INSERT OR IGNORE INTO product_feature_defaults (product_id, feature_key, enabled, config_json)
SELECT p.id, 'suite.compliance_center', 1, '{}' FROM products p WHERE p.product_key = 'ca-suite';
INSERT OR IGNORE INTO product_feature_defaults (product_id, feature_key, enabled, config_json)
SELECT p.id, 'suite.billing_reports', 1, '{}' FROM products p WHERE p.product_key = 'ca-suite';
INSERT OR IGNORE INTO product_feature_defaults (product_id, feature_key, enabled, config_json)
SELECT p.id, 'suite.client_portal', 1, '{}' FROM products p WHERE p.product_key = 'ca-suite';
INSERT OR IGNORE INTO product_feature_defaults (product_id, feature_key, enabled, config_json)
SELECT p.id, 'suite.team_members', 1, '{"max_default":5}' FROM products p WHERE p.product_key = 'ca-suite';
INSERT OR IGNORE INTO product_feature_defaults (product_id, feature_key, enabled, config_json)
SELECT p.id, 'suite.templates.ca', 1, '{}' FROM products p WHERE p.product_key = 'ca-suite';
INSERT OR IGNORE INTO product_feature_defaults (product_id, feature_key, enabled, config_json)
SELECT p.id, 'suite.filings.tax', 1, '{}' FROM products p WHERE p.product_key = 'ca-suite';
INSERT OR IGNORE INTO product_feature_defaults (product_id, feature_key, enabled, config_json)
SELECT p.id, 'suite.region_rules', 1, '{}' FROM products p WHERE p.product_key = 'ca-suite';

INSERT OR IGNORE INTO product_feature_defaults (product_id, feature_key, enabled, config_json)
SELECT p.id, 'suite.workspace', 1, '{}' FROM products p WHERE p.product_key = 'lawyer-suite';
INSERT OR IGNORE INTO product_feature_defaults (product_id, feature_key, enabled, config_json)
SELECT p.id, 'suite.documents', 1, '{}' FROM products p WHERE p.product_key = 'lawyer-suite';
INSERT OR IGNORE INTO product_feature_defaults (product_id, feature_key, enabled, config_json)
SELECT p.id, 'suite.case_management', 1, '{}' FROM products p WHERE p.product_key = 'lawyer-suite';
INSERT OR IGNORE INTO product_feature_defaults (product_id, feature_key, enabled, config_json)
SELECT p.id, 'suite.billing_reports', 1, '{}' FROM products p WHERE p.product_key = 'lawyer-suite';
INSERT OR IGNORE INTO product_feature_defaults (product_id, feature_key, enabled, config_json)
SELECT p.id, 'suite.client_portal', 1, '{}' FROM products p WHERE p.product_key = 'lawyer-suite';
INSERT OR IGNORE INTO product_feature_defaults (product_id, feature_key, enabled, config_json)
SELECT p.id, 'suite.team_members', 1, '{"max_default":5}' FROM products p WHERE p.product_key = 'lawyer-suite';
INSERT OR IGNORE INTO product_feature_defaults (product_id, feature_key, enabled, config_json)
SELECT p.id, 'suite.templates.lawyer', 1, '{}' FROM products p WHERE p.product_key = 'lawyer-suite';
INSERT OR IGNORE INTO product_feature_defaults (product_id, feature_key, enabled, config_json)
SELECT p.id, 'suite.filings.legal', 1, '{}' FROM products p WHERE p.product_key = 'lawyer-suite';
INSERT OR IGNORE INTO product_feature_defaults (product_id, feature_key, enabled, config_json)
SELECT p.id, 'suite.region_rules', 1, '{}' FROM products p WHERE p.product_key = 'lawyer-suite';

INSERT OR IGNORE INTO region_feature_overrides (product_id, region_code, feature_key, enabled, config_json)
SELECT p.id, 'IN', 'suite.region_rules', 1, '{"jurisdiction":"india","profession":"ca"}'
FROM products p WHERE p.product_key = 'ca-suite';
INSERT OR IGNORE INTO region_feature_overrides (product_id, region_code, feature_key, enabled, config_json)
SELECT p.id, 'AE', 'suite.region_rules', 1, '{"jurisdiction":"uae","profession":"ca"}'
FROM products p WHERE p.product_key = 'ca-suite';
INSERT OR IGNORE INTO region_feature_overrides (product_id, region_code, feature_key, enabled, config_json)
SELECT p.id, 'US', 'suite.region_rules', 1, '{"jurisdiction":"us","profession":"ca"}'
FROM products p WHERE p.product_key = 'ca-suite';
INSERT OR IGNORE INTO region_feature_overrides (product_id, region_code, feature_key, enabled, config_json)
SELECT p.id, 'EU', 'suite.region_rules', 1, '{"jurisdiction":"eu","profession":"ca"}'
FROM products p WHERE p.product_key = 'ca-suite';

INSERT OR IGNORE INTO region_feature_overrides (product_id, region_code, feature_key, enabled, config_json)
SELECT p.id, 'IN', 'suite.region_rules', 1, '{"jurisdiction":"india","profession":"lawyer"}'
FROM products p WHERE p.product_key = 'lawyer-suite';
INSERT OR IGNORE INTO region_feature_overrides (product_id, region_code, feature_key, enabled, config_json)
SELECT p.id, 'AE', 'suite.region_rules', 1, '{"jurisdiction":"uae","profession":"lawyer"}'
FROM products p WHERE p.product_key = 'lawyer-suite';
INSERT OR IGNORE INTO region_feature_overrides (product_id, region_code, feature_key, enabled, config_json)
SELECT p.id, 'US', 'suite.region_rules', 1, '{"jurisdiction":"us","profession":"lawyer"}'
FROM products p WHERE p.product_key = 'lawyer-suite';
INSERT OR IGNORE INTO region_feature_overrides (product_id, region_code, feature_key, enabled, config_json)
SELECT p.id, 'EU', 'suite.region_rules', 1, '{"jurisdiction":"eu","profession":"lawyer"}'
FROM products p WHERE p.product_key = 'lawyer-suite';

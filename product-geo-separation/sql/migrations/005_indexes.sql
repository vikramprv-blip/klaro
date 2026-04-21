CREATE INDEX idx_region_products_region ON region_products(region_code, product_id);
CREATE INDEX idx_region_feature_overrides_lookup ON region_feature_overrides(product_id, region_code, feature_key);
CREATE INDEX idx_org_feature_overrides_lookup ON org_feature_overrides(org_id, product_id, region_code, feature_key);
CREATE INDEX idx_orgs_region_product ON orgs(region_code, product_id);
CREATE INDEX idx_subscriptions_region_product ON subscriptions(region_code, product_id);
CREATE INDEX idx_entitlements_org_feature ON entitlements(org_id, feature_key);
CREATE INDEX idx_user_consents_user_region_product ON user_consents(user_id, region_code, product_id);

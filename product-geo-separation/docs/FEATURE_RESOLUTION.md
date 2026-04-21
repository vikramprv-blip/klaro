# Resolution order

1. product_feature_defaults
2. region_feature_overrides
3. org_feature_overrides
4. runtime entitlement grants

Effective key:
(product_id, region_code, org_id, feature_key)

Do not derive features from router geography alone.
Always resolve against explicit product-region mapping.

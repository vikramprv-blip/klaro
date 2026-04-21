# LAM structure

LAM = policy decision layer for a specific product-region pair.

Decision input:
- region_code
- legal_entity_code
- product_id
- user_type
- org_type
- data_class
- billing_mode
- support_tier

Decision output:
- allowed
- blocked
- requires_consent
- requires_contract
- requires_residency
- requires_review
- metadata

Recommended namespaces:
- onboarding
- privacy
- billing
- tax
- residency
- retention
- moderation
- support

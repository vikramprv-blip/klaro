# Region model

## Regions
- IN = India
- AE = UAE
- US = United States
- EU = European Union

## Principle
Separate at PRODUCT level, not only request routing.

## Tenancy model
Use 3 dimensions on every product object:
- region_code: IN | AE | US | EU
- legal_entity_code: per billing / contracting entity
- product_surface: consumer | business | enterprise | api

## Data model
Global tables:
- regions
- legal_entities
- products
- region_products
- feature_flags
- region_feature_flags
- lam_policies
- lam_policy_rules

Regionalized business tables:
- accounts
- orgs
- subscriptions
- orders
- invoices
- payments
- entitlements
- user_consents
- data_residency_artifacts

Every regionalized row must include:
- region_code
- legal_entity_code
- product_id

## Features
Use inheritance:
1. global default
2. product default
3. region override
4. customer/org override

## LAM
Model LAM as policy packs per region:
- identity
- age / KYC / KYB
- consent
- tax
- billing
- privacy
- retention
- export controls
- moderation / safety
- data residency
- support / SLO

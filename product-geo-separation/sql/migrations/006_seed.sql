INSERT INTO regions (code, name, currency_code, timezone_name, data_residency_mode, default_legal_entity_code) VALUES
('IN', 'India', 'INR', 'Asia/Kolkata', 'in-country', 'openai-india'),
('AE', 'UAE', 'AED', 'Asia/Dubai', 'regional', 'openai-uae'),
('US', 'United States', 'USD', 'America/Los_Angeles', 'us', 'openai-us'),
('EU', 'European Union', 'EUR', 'Europe/Dublin', 'eu', 'openai-eu');

INSERT INTO legal_entities (code, display_name, region_code, tax_mode, contracting_country) VALUES
('openai-india', 'OpenAI India', 'IN', 'gst', 'IN'),
('openai-uae', 'OpenAI UAE', 'AE', 'vat_ae', 'AE'),
('openai-us', 'OpenAI US', 'US', 'sales_tax', 'US'),
('openai-eu', 'OpenAI EU', 'EU', 'vat_eu', 'IE');

INSERT INTO products (product_key, product_name, product_surface) VALUES
('chatgpt-consumer', 'ChatGPT Consumer', 'consumer'),
('chatgpt-business', 'ChatGPT Business', 'business'),
('chatgpt-enterprise', 'ChatGPT Enterprise', 'enterprise'),
('api-platform', 'API Platform', 'api');

INSERT INTO feature_flags (key, description) VALUES
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

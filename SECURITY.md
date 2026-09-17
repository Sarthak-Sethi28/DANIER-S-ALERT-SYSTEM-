# Security Policy

This repository is a sanitized public showcase of an internal inventory-alerting system. It should not contain production credentials, live customer data, or private infrastructure configuration.

## Reporting a security issue

If you find a secret, credential, private endpoint, or other sensitive information in the public repository, please do not open a public issue containing the sensitive value. Contact the repository owner directly through the profile links instead.

## Secret handling

- Keep real credentials in local environment variables or a secret manager.
- Commit only `.env.example` files with placeholder values.
- Treat any credential committed to Git history as compromised and rotate it immediately.
- Do not place production data or customer-specific configuration in this public showcase.

## Scope

The public repository exists to demonstrate the product workflow, architecture, and engineering approach. Production-specific configuration is intentionally excluded.

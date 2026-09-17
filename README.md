<div align="center">

# Danier Inventory Alert System

**A retail operations tool for turning inventory data into actionable stock alerts and operational visibility.**

Built around a real internal retail workflow. This repository is a **sanitized public showcase** of the system and engineering approach — production credentials, internal data, and proprietary configuration are intentionally excluded.

</div>

---

## Why it exists

Inventory teams should not have to repeatedly inspect spreadsheets and dashboards just to discover that an important item is running low.

This system was built to make that workflow more proactive: ingest inventory data, normalize it, surface the items that need attention, and send alerts to the people responsible for acting on them.

## What it does

```text
Inventory files / operational data
             │
             ▼
      validation + parsing
             │
             ▼
      normalized inventory
             │
      ┌──────┴─────────┐
      ▼                ▼
 analytics / UI   alert evaluation
                       │
                       ▼
                email notifications
```

Core capabilities include:

- **Inventory monitoring** — tracks stock levels and operational inventory data
- **Automated alerts** — identifies low-stock / attention-required items and sends notifications
- **Analytics dashboard** — gives operators a quicker view of inventory state and trends
- **File ingestion** — supports spreadsheet-driven operational workflows
- **Operational reliability** — health checks, database retry handling, and defensive error paths

## Architecture

The application is split into a React frontend and API/backend services responsible for ingestion, inventory processing, persistence, analytics, and alert delivery.

| Layer | Technology / responsibility |
| --- | --- |
| Frontend | React + TypeScript — dashboard and operator workflows |
| API / services | Backend services for ingestion, inventory logic, analytics, and alerts |
| Data | Relational persistence for inventory and operational state |
| Notifications | SMTP-based alert delivery |
| Deployment | Container / cloud deployment configuration and health monitoring |

## Engineering focus

The interesting part of this project was not just displaying inventory. It was making a small internal tool behave reliably enough for an operational workflow.

### Reliable ingestion

Uploaded data is validated and processed before it reaches the application state, so malformed files or partial inputs do not silently corrupt the workflow.

### Alerting without blocking the core workflow

Notification delivery is treated as an operational side effect rather than the entire application flow. Failures can be surfaced and retried without making the main inventory experience unusable.

### Health and recovery

The backend includes health endpoints and defensive database connection handling so deployment failures are easier to detect and transient connection problems do not immediately take the service down.

### Separation of configuration

Runtime configuration belongs in environment variables. The public repository contains only example values; credentials and production-specific settings are intentionally excluded.

## Local setup

```bash
# clone
git clone https://github.com/Sarthak-Sethi28/DANIER-S-ALERT-SYSTEM-.git
cd DANIER-S-ALERT-SYSTEM-

# configure local environment
cp .env.example .env
# edit .env with your own local values
```

Install and run the frontend/backend from their respective application directories using the package scripts included in the repository.

> **Security note:** never commit `.env` files or real credentials. Use `.env.example` only as a configuration template.

## Public showcase note

This repo is intentionally **not a copy of a production environment**. It demonstrates the product workflow, architecture, and engineering decisions from a system built for a real retail use case while keeping internal data, live credentials, and business-specific configuration out of the public version.

That distinction is deliberate: the goal here is to show how the system was designed and built without exposing the private environment it supported.

## Project status

The original system was built as an internal operational tool. This public repository is maintained as a portfolio / engineering showcase and may differ from the private production configuration.

---

Built by [Sarthak Sethi](https://sethisarthak.com) · more demos and projects at **[sethisarthak.com](https://sethisarthak.com)**

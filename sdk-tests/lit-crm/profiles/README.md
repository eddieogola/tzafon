# Profile catalog

Each file here is an **app template** — a declarative profile the lit-crm server loads
at runtime (`APP=<name> uv run lit-crm`). One profile = one connected SaaS app; each
capability becomes one MCP tool. Adding an app is authoring one of these files plus a
one-time login — no code. See [`_TEMPLATE.yaml`](./_TEMPLATE.yaml) for the fully
documented schema and the repo [`README.md`](../README.md) for the authoring walkthrough.

## Conventions every profile follows

- **`app` matches the filename** (`stripe.yaml` → `app: stripe`); boot with `APP=stripe`.
- **Read-only capabilities** set `guardrails.require_confirmation: false`, usually
  `forbidden_actions: ["navigate"]` to stay on the list page, and return structured data
  via an `extract` (JSON) block.
- **State-mutating capabilities** (send / update / approve / assign / close / create /
  delete / fulfill) **must** set `guardrails.require_confirmation: true` *and* declare a
  required boolean `confirm` param. Without `confirm=true` the tool is a no-op that
  returns `needs_confirmation` and never touches the browser.
- **`allowed_domains`** is scoped to the app's host so the agent can't be steered off-site.
- **`login.success_check`** tokens are best-effort post-auth markers — verify/tune them on
  first `lit-crm-login`. Apps with org-specific domains (Salesforce, Zendesk, ServiceNow,
  NetSuite, Workday) note the placeholder in a comment at `base_url`.

## Apps (10 · 24 capabilities)

🔒 = mutating (requires `confirm=true`)  ·  📄 = read-only (returns JSON)

| App | `APP=` | Capabilities |
|-----|--------|--------------|
| **Stripe** | `stripe` | 📄 `find_overdue_invoices` · 🔒 `email_overdue_customers` |
| **Salesforce** | `salesforce` | 📄 `find_stale_opportunities` · 🔒 `update_opportunity_stage` · 🔒 `log_call` |
| **HubSpot** | `hubspot` | 📄 `find_unassigned_leads` · 🔒 `assign_lead_to_owner` · 🔒 `create_deal` |
| **Zendesk** | `zendesk` | 📄 `find_overdue_tickets` · 🔒 `reassign_ticket` · 🔒 `close_resolved_tickets` |
| **ServiceNow** | `servicenow` | 📄 `find_open_incidents` · 🔒 `escalate_incident` |
| **QuickBooks** | `quickbooks` | 📄 `find_overdue_invoices` · 🔒 `send_payment_reminders` · 🔒 `categorize_uncategorized_expenses` |
| **NetSuite** | `netsuite` | 📄 `find_pending_purchase_orders` · 🔒 `approve_purchase_order` |
| **Shopify** | `shopify` | 📄 `find_low_stock_products` · 🔒 `fulfill_pending_orders` |
| **Greenhouse** | `greenhouse` | 📄 `find_stalled_candidates` · 🔒 `advance_candidate_stage` |
| **Workday** | `workday` | 📄 `find_pending_time_off_requests` · 🔒 `approve_time_off` |

## Using one

```bash
APP=zendesk uv run lit-crm-login   # log in once; saves the persistent session
APP=zendesk uv run lit-crm         # serve Zendesk's capabilities as MCP tools
```

## Still on the pitch list

`sap` · `greenhouse` ✓ · `workday` ✓ — the remaining enterprise suites (SAP, Oracle,
Marketo, NetSuite variants, etc.) are pure authoring: copy `_TEMPLATE.yaml`, fill in the
URLs, login check, and a couple of capabilities. No Python unless a capability needs a
genuinely new action or success-check primitive.

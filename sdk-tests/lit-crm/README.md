# lit-crm

**Every MCP can read. Lightcone MCP can act.**

One configurable [Model Context Protocol](https://modelcontextprotocol.io) server that
*acts* on SaaS web UIs through the Tzafon Lightcone browser-automation SDK — no per-app
API required. Boot it with `APP=<name>`, it loads `profiles/<name>.yaml`, and exposes one
MCP tool per declared capability (e.g. `find_overdue_invoices`). Shipping a new app is a
single YAML profile + a one-time login — no code.

See `profiles/_TEMPLATE.yaml` for the fully-documented authoring template and
`profiles/stripe.yaml` for a worked example.

## Quick start

```bash
uv sync                          # install deps
uv run pytest                    # run the unit suite (network-free)
APP=stripe uv run lit-crm-login  # one-time interactive login (saves a session)
APP=stripe uv run lit-crm        # run the MCP server (stdio)
```

## How it works

- **One configurable server.** There is a single MCP server. You don't fork it
  per app — you boot it with `APP=<name>` and it loads `profiles/<name>.yaml`.
- **Profiles are templates.** A profile is declarative YAML: the app's URLs,
  the login success check, and a list of capabilities. Each capability becomes
  exactly one MCP tool, with typed parameters and its own guardrails.
- **A controlled Responses loop.** Capabilities don't hand the browser to an
  open-ended agent. The engine drives Tzafon Northstar through a *bounded*,
  guard-railed loop (`max_steps`, `allowed_domains`, `forbidden_actions`),
  verifies the result against the capability's `success_check`, and optionally
  runs a tools-off extraction turn to return structured `extracted` data.
- **Persistent sessions.** You log in by hand exactly once. We never type or
  store credentials — a human completes login + 2FA in the live browser, we
  verify the authenticated page, and persist only the opaque Lightcone
  `environment_id`. Later runs resume that session instead of logging in again.

## Authoring a new app in ~10 minutes

No Python required. To add an app called `acme`:

1. **Copy the template:** `cp profiles/_TEMPLATE.yaml profiles/acme.yaml`.
2. **Fill the essentials:** set `app`, `display_name`, and `base_url`; set
   `login.success_check` to a token that only appears once authenticated
   (usually `html_contains`).
3. **Add 1-2 capabilities:** name, `instruction_template`, `guardrails`, and a
   `success_check`. Start read-only. For anything that mutates state, set
   `guardrails.require_confirmation: true` and add a required `confirm` param.
4. **Log in once:** `APP=acme uv run lit-crm-login`. A live browser opens; finish
   login + 2FA, press ENTER. The session is verified and saved.
5. **Serve it:** `APP=acme uv run lit-crm`. Your capabilities are now MCP tools.

See `profiles/_TEMPLATE.yaml` for every field and all `success_check` variants.

## Commands

```bash
uv sync                          # install/resolve deps
uv run pytest                    # network-free unit suite (integration auto-deselected)
uv run pytest -m integration     # real-API end-to-end tests (need TZAFON_API_KEY + a saved session)
APP=<app> uv run lit-crm-login   # one-time interactive login; saves a persistent session
APP=<app> uv run lit-crm         # run the MCP server (stdio transport)
```

## The path to 50 apps

Scaling to many apps is **pure profile authoring** — copy the template, fill in
URLs + checks + capabilities, log in once. You only touch Python when a profile
needs a genuinely new primitive: a new *action* type (a browser interaction the
engine can't yet express) or a new *success-check* variant. Everything else —
new apps, new capabilities, new guardrails — is YAML.


"""lit-crm: one configurable Lightcone MCP server that ACTS on SaaS web UIs.

Every MCP can read. Lightcone MCP can act.

A single FastMCP server boots with ``APP=<name>``, loads ``profiles/<name>.yaml``,
and dynamically registers one MCP tool per declared capability. Each tool resumes a
persistent authenticated browser session and drives a controlled Responses-API loop
(``engine.ActEngine``) with app-specific guardrails.
"""

__version__ = "0.1.0"

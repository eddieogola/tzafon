#!/usr/bin/env bash
#
# lib.sh — shared helpers for the persistent-VM resume benchmark curl scripts.
# Sourced by 1-create-and-mark.sh, 2-resume-and-benchmark.sh, 3-summary.sh.
#
# Targets the Lightcone STAGING API by default. Override with: BASE_URL=... ./script.sh
#
set -euo pipefail

# --- locate ourselves so scripts work regardless of cwd ----------------------
LIB_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# --- config ------------------------------------------------------------------
BASE_URL="${BASE_URL:-https://api-staging.tzafon.ai}"
STATE_DIR="${STATE_DIR:-$LIB_DIR/state}"
ENV_FILE="$LIB_DIR/../.env"                 # sdks/18-05/.env (holds TZAFON_API_KEY)
ENVIRONMENTS_TSV="$STATE_DIR/environments.tsv"
BENCHMARK_CSV="$STATE_DIR/benchmark.csv"
SHOTS_DIR="$STATE_DIR/screenshots"

# VM kind + safety knobs (see plan: desktop = full-disk persistence + shell marker)
VM_KIND="${VM_KIND:-desktop}"
MAX_LIFETIME_SECONDS="${MAX_LIFETIME_SECONDS:-900}"   # hard cap so nothing is orphaned
READY_TIMEOUT_SECONDS="${READY_TIMEOUT_SECONDS:-90}"  # how long to poll for "ready" on resume
MARKER_PATH="${MARKER_PATH:-/root/MARKER.txt}"        # programmatic identity proof
DESKTOP_MARKER="${DESKTOP_MARKER:-/root/Desktop/WHO_AM_I.txt}" # visual proof on screenshot

# Browser visual marker: open a browser on the desktop and search for the VM label.
BROWSER_SEARCH="${BROWSER_SEARCH:-1}"                  # 1 = enable, 0 = skip (pure timing)
BROWSER_BIN="${BROWSER_BIN:-firefox}"                  # confirmed installed on staging desktop
SEARCH_URL_TEMPLATE="${SEARCH_URL_TEMPLATE:-https://www.google.com/search?q=%s}"
BROWSER_RENDER_SECONDS="${BROWSER_RENDER_SECONDS:-9}"  # cold-start firefox needs a few seconds

# --- pretty colors -----------------------------------------------------------
if [ -t 1 ]; then
  C_RESET=$'\033[0m'; C_RED=$'\033[1;31m'; C_GREEN=$'\033[1;32m'
  C_YEL=$'\033[1;33m'; C_BLUE=$'\033[1;34m'; C_DIM=$'\033[2m'
else
  C_RESET=''; C_RED=''; C_GREEN=''; C_YEL=''; C_BLUE=''; C_DIM=''
fi
info()  { printf '%s%s%s\n' "$C_BLUE" "$*" "$C_RESET"; }
ok()    { printf '%s%s%s\n' "$C_GREEN" "$*" "$C_RESET"; }
warn()  { printf '%s%s%s\n' "$C_YEL" "$*" "$C_RESET"; }
err()   { printf '%s%s%s\n' "$C_RED" "$*" "$C_RESET" >&2; }
die()   { err "$*"; exit 1; }

# --- prerequisites -----------------------------------------------------------
require_tools() {
  command -v curl >/dev/null 2>&1 || die "curl not found on PATH"
  command -v jq   >/dev/null 2>&1 || die "jq not found on PATH (brew install jq)"
}

load_api_key() {
  if [ -z "${TZAFON_API_KEY:-}" ] && [ -f "$ENV_FILE" ]; then
    # shellcheck disable=SC1090
    set -a; . "$ENV_FILE"; set +a
  fi
  [ -n "${TZAFON_API_KEY:-}" ] || die "TZAFON_API_KEY is not set (put it in $ENV_FILE)"
}

ensure_state() { mkdir -p "$STATE_DIR" "$SHOTS_DIR"; }

now_iso()  { date -u +%Y-%m-%dT%H:%M:%SZ; }
now_secs() { date +%s; }

# --- HTTP wrappers -----------------------------------------------------------
# api METHOD PATH [JSON_BODY]
#   Performs the request and prints the JSON response body to stdout.
#   Exits non-zero (and prints the body to stderr) on HTTP >= 400.
api() {
  local method="$1" path="$2" body="${3:-}"
  local url="$BASE_URL$path"
  local resp http
  if [ -n "$body" ]; then
    resp="$(curl -sS -w $'\n%{http_code}' -X "$method" "$url" \
      -H "Authorization: Bearer $TZAFON_API_KEY" \
      -H 'Content-Type: application/json' \
      -d "$body")"
  else
    resp="$(curl -sS -w $'\n%{http_code}' -X "$method" "$url" \
      -H "Authorization: Bearer $TZAFON_API_KEY")"
  fi
  http="${resp##*$'\n'}"
  body="${resp%$'\n'*}"
  if [ "$http" -ge 400 ]; then
    err "HTTP $http on $method $path"
    printf '%s\n' "$body" >&2
    return 1
  fi
  printf '%s' "$body"
}

# api_timed VARPREFIX METHOD PATH [JSON_BODY]
#   Like api(), but also captures timing into shell vars:
#     ${VARPREFIX}_http  -> HTTP status code
#     ${VARPREFIX}_time  -> total request seconds (curl %{time_total})
#     ${VARPREFIX}_body  -> JSON response body
#   Always returns 0; inspect ${VARPREFIX}_http for success.
api_timed() {
  local var="$1" method="$2" path="$3" body="${4:-}"
  local url="$BASE_URL$path" raw http time payload
  if [ -n "$body" ]; then
    raw="$(curl -sS -w $'\n%{http_code} %{time_total}' -X "$method" "$url" \
      -H "Authorization: Bearer $TZAFON_API_KEY" \
      -H 'Content-Type: application/json' \
      -d "$body" || true)"
  else
    raw="$(curl -sS -w $'\n%{http_code} %{time_total}' -X "$method" "$url" \
      -H "Authorization: Bearer $TZAFON_API_KEY" || true)"
  fi
  local last="${raw##*$'\n'}"
  payload="${raw%$'\n'*}"
  http="${last%% *}"
  time="${last##* }"
  printf -v "${var}_http" '%s' "$http"
  printf -v "${var}_time" '%s' "$time"
  printf -v "${var}_body" '%s' "$payload"
}

# --- exec/sync convenience ---------------------------------------------------
# exec_sync ID COMMAND -> prints stdout of the remote command (via jq)
exec_sync() {
  local id="$1" cmd="$2" payload
  payload="$(jq -nc --arg c "$cmd" --argjson t 60 '{command:$c, timeout_seconds:$t}')"
  api POST "/computers/$id/exec/sync" "$payload" | jq -r '.stdout // ""'
}

# --- visual helpers ----------------------------------------------------------
# screenshot_url ID -> prints the screenshot URL (or empty on failure)
screenshot_url() {
  api POST "/computers/$1/screenshot" '{}' 2>/dev/null | jq -r '.result.screenshot_url // empty'
}

# open_browser_search ID LABEL
#   Launches the desktop browser searching for LABEL, then waits for it to render.
#   Best-effort and detached (returns once the page has had time to paint); no-op
#   when BROWSER_SEARCH=0. Caller takes the screenshot afterwards.
open_browser_search() {
  local id="$1" label="$2" url cmd
  [ "$BROWSER_SEARCH" = "1" ] || return 0
  # shellcheck disable=SC2059
  url="$(printf "$SEARCH_URL_TEMPLATE" "$label")"
  cmd="$BROWSER_BIN \"$url\" >/tmp/browser.log 2>&1 &"
  api POST "/computers/$id/exec/sync" \
    "$(jq -nc --arg c "$cmd" --argjson t 20 '{command:$c, timeout_seconds:$t}')" >/dev/null 2>&1 || true
  sleep "$BROWSER_RENDER_SECONDS"
}

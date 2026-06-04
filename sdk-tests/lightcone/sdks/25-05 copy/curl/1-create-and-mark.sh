#!/usr/bin/env bash
#
# Step A — create N persistent desktop VMs and mark each one uniquely.
#
# For each VM we:
#   1. POST /computers   {kind:desktop, persistent:true}        -> environment id
#   2. exec/sync         write a unique MARKER file + a Desktop file (visual proof)
#   3. POST /screenshot  capture proof, save the URL
#   4. DELETE            tear down -> state is persisted to the DB
#
# The (label, environment_id) pairs are appended to state/environments.tsv so that
# 2-resume-and-benchmark.sh knows what to resume.
#
# Usage: ./1-create-and-mark.sh [COUNT]   (default 3, max 26)
#
set -euo pipefail
. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/lib.sh"

require_tools
load_api_key
ensure_state

COUNT="${1:-3}"
[ "$COUNT" -ge 1 ] 2>/dev/null || die "COUNT must be a positive integer"
[ "$COUNT" -le 26 ] || die "COUNT max is 26 (one label per letter)"

# Phonetic labels so each VM is obvious in screenshots / logs.
LABELS=(alpha bravo charlie delta echo foxtrot golf hotel india juliet kilo lima
        mike november oscar papa quebec romeo sierra tango uniform victor whiskey
        xray yankee zulu)

# Header row once.
if [ ! -f "$ENVIRONMENTS_TSV" ]; then
  printf 'label\tenvironment_id\tcreated_at\tscreenshot_url\n' > "$ENVIRONMENTS_TSV"
fi

info "Creating $COUNT persistent $VM_KIND VM(s) against $BASE_URL"
echo

created=0
for i in $(seq 0 $((COUNT - 1))); do
  label="${LABELS[$i]}"
  created_at="$(now_iso)"
  printf '%s── VM %s ──%s\n' "$C_YEL" "$label" "$C_RESET"

  # 1. create persistent desktop
  body="$(jq -nc \
    --arg kind "$VM_KIND" \
    --argjson life "$MAX_LIFETIME_SECONDS" \
    '{kind:$kind, persistent:true, max_lifetime_seconds:$life, idle_timeout_enabled:true}')"
  resp="$(api POST "/computers" "$body")" || { err "  create failed; skipping"; continue; }
  env_id="$(printf '%s' "$resp" | jq -r '.id // empty')"
  [ -n "$env_id" ] || { err "  no id in create response; skipping"; echo "$resp" >&2; continue; }
  ok "  created  id=$env_id"

  # 2. mark it — a unique line we can read back later to prove identity + persistence.
  marker="$label | $env_id | created $created_at"
  mark_cmd="mkdir -p \"\$(dirname $MARKER_PATH)\" \"\$(dirname $DESKTOP_MARKER)\"; \
printf '%s\n' '$marker' | tee $MARKER_PATH $DESKTOP_MARKER >/dev/null; \
hostname > /root/HOSTNAME.txt 2>/dev/null || true; cat $MARKER_PATH"
  written="$(exec_sync "$env_id" "$mark_cmd" 2>/dev/null || true)"
  if [ "$written" = "$marker" ]; then
    ok "  marked   $MARKER_PATH"
  else
    warn "  mark readback unexpected: '$written'"
  fi

  # 3. open a browser and search for the label (visual identity), then screenshot.
  if [ "$BROWSER_SEARCH" = "1" ]; then
    info "  browser  searching \"$label\"…"
    open_browser_search "$env_id" "$label"
  fi
  shot_url="$(screenshot_url "$env_id")"
  [ -n "$shot_url" ] && ok "  shot     $shot_url"

  # 4. tear down -> persists state.
  api DELETE "/computers/$env_id" >/dev/null 2>&1 || warn "  delete returned non-OK"
  ok "  saved    (deleted; state persisted)"

  printf '%s\t%s\t%s\t%s\n' "$label" "$env_id" "$created_at" "${shot_url:-}" >> "$ENVIRONMENTS_TSV"
  created=$((created + 1))
  echo
done

ok "Done. $created/$COUNT VM(s) recorded in $ENVIRONMENTS_TSV"
info "Next: ./2-resume-and-benchmark.sh \"day0\""

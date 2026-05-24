#!/usr/bin/env bash
#
# Steps B & C — resume each persisted VM, benchmark how long it takes, and verify
# the unique marker survived (proving it's the *correct* VM and state persisted).
#
# Idempotent: run it now ("day0"), wait 24h, run it again ("day1"). Each run appends
# rows to state/benchmark.csv; 3-summary.sh diffs the runs.
#
# Per VM (from state/environments.tsv):
#   1. POST /computers {environment_id, kind:desktop, persistent:true}  <- timed (resume)
#   2. poll GET /computers/{id} until ready                              <- time_to_ready
#   3. exec/sync `cat MARKER`                                           <- timed (first action)
#                -> marker_ok = does it match the expected label/env_id?
#   4. time_to_usable = wall-clock from step 1 start to step 3 success  <- headline score
#   5. DELETE (re-persist so the next run still has the environment)
#
# Usage: ./2-resume-and-benchmark.sh [RUN_LABEL]   (default: current ISO timestamp)
#
set -euo pipefail
. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/lib.sh"

require_tools
load_api_key
ensure_state

[ -f "$ENVIRONMENTS_TSV" ] || die "No $ENVIRONMENTS_TSV — run ./1-create-and-mark.sh first"

RUN_LABEL="${1:-$(now_iso)}"
RUN_ISO="$(now_iso)"

# CSV header once.
if [ ! -f "$BENCHMARK_CSV" ]; then
  printf 'run_label,run_iso,vm_label,environment_id,restored_id,resume_http_code,resume_time_s,time_to_ready_s,exec_time_s,time_to_usable_s,marker_ok,notes,confirm_shot_url\n' > "$BENCHMARK_CSV"
fi

info "Resume benchmark  run=\"$RUN_LABEL\"  target=$BASE_URL"
echo

pass=0; fail=0; total=0

# Skip the TSV header, read label + environment_id.
while IFS=$'\t' read -r label env_id _created _shot; do
  [ "$label" = "label" ] && continue          # header
  [ -z "${env_id:-}" ] && continue
  total=$((total + 1))
  printf '%s── %s (%s) ──%s\n' "$C_YEL" "$label" "$env_id" "$C_RESET"

  notes=""
  marker_ok="no"
  restored_id=""
  time_to_ready=""
  exec_time=""
  time_to_usable=""
  confirm_shot_url=""

  wall_start="$(now_secs)"

  # 1. resume = create referencing the saved environment_id.
  resume_body="$(jq -nc \
    --arg env "$env_id" --arg kind "$VM_KIND" --argjson life "$MAX_LIFETIME_SECONDS" \
    '{environment_id:$env, kind:$kind, persistent:true, max_lifetime_seconds:$life, idle_timeout_enabled:true}')"
  api_timed RESUME POST "/computers" "$resume_body"

  if [ "${RESUME_http:-000}" -lt 200 ] || [ "${RESUME_http:-000}" -ge 400 ]; then
    err "  resume FAILED  http=${RESUME_http:-?}  time=${RESUME_time}s"
    notes="resume_http_${RESUME_http}"
    printf '%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s\n' \
      "$RUN_LABEL" "$RUN_ISO" "$label" "$env_id" "" "${RESUME_http:-}" "${RESUME_time:-}" \
      "" "" "" "$marker_ok" "$notes" "" >> "$BENCHMARK_CSV"
    fail=$((fail + 1)); echo; continue
  fi

  restored_id="$(printf '%s' "$RESUME_body" | jq -r '.id // empty')"
  ok "  resumed  http=${RESUME_http}  resume_time=${RESUME_time}s  restored_id=${restored_id:-?}"

  if [ -z "$restored_id" ]; then
    notes="no_restored_id"
    fail=$((fail + 1))
    printf '%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s\n' \
      "$RUN_LABEL" "$RUN_ISO" "$label" "$env_id" "" "${RESUME_http}" "${RESUME_time}" \
      "" "" "" "$marker_ok" "$notes" "" >> "$BENCHMARK_CSV"
    echo; continue
  fi

  # 2. poll until the session reports a ready/running status.
  ready_start="$(now_secs)"
  status="unknown"
  while :; do
    st_resp="$(api GET "/computers/$restored_id" 2>/dev/null || true)"
    status="$(printf '%s' "$st_resp" | jq -r '.status // "unknown"')"
    case "$(printf '%s' "$status" | tr '[:upper:]' '[:lower:]')" in
      running|ready|active|live) break ;;
    esac
    elapsed=$(( $(now_secs) - ready_start ))
    [ "$elapsed" -ge "$READY_TIMEOUT_SECONDS" ] && { warn "  ready poll timed out (last status=$status)"; break; }
    sleep 1
  done
  time_to_ready=$(( $(now_secs) - ready_start ))
  info "  status=$status  time_to_ready=${time_to_ready}s"

  # 3. first real action: read the marker back (timed).
  exec_payload="$(jq -nc --arg c "cat $MARKER_PATH" --argjson t 60 '{command:$c, timeout_seconds:$t}')"
  api_timed EXEC POST "/computers/$restored_id/exec/sync" "$exec_payload"
  exec_time="${EXEC_time:-}"
  read_marker="$(printf '%s' "${EXEC_body:-}" | jq -r '.stdout // ""' | tr -d '\r' | sed -e 's/[[:space:]]*$//')"

  # marker is correct if it carries this VM's label AND its environment id.
  if printf '%s' "$read_marker" | grep -q "$label" && printf '%s' "$read_marker" | grep -q "$env_id"; then
    marker_ok="yes"
    time_to_usable=$(( $(now_secs) - wall_start ))
    ok "  marker OK -> \"$read_marker\""
    ok "  time_to_usable=${time_to_usable}s"
    pass=$((pass + 1))
  else
    marker_ok="no"
    notes="marker_mismatch"
    err "  marker MISMATCH -> got \"$read_marker\""
    fail=$((fail + 1))
  fi

  # 4b. visual confirmation (NOT timed): open the browser, search the label, screenshot.
  #     Lets you eyeball that the resumed VM really is this one.
  if [ "$BROWSER_SEARCH" = "1" ]; then
    info "  browser  searching \"$label\"…"
    open_browser_search "$restored_id" "$label"
    confirm_shot_url="$(screenshot_url "$restored_id")"
    [ -n "$confirm_shot_url" ] && ok "  confirm  $confirm_shot_url"
  fi

  # 5. re-persist so the environment is still available for the next run.
  api DELETE "/computers/$restored_id" >/dev/null 2>&1 || warn "  re-save delete returned non-OK"

  printf '%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s\n' \
    "$RUN_LABEL" "$RUN_ISO" "$label" "$env_id" "$restored_id" "${RESUME_http}" "${RESUME_time}" \
    "$time_to_ready" "$exec_time" "${time_to_usable:-}" "$marker_ok" "$notes" "$confirm_shot_url" >> "$BENCHMARK_CSV"
  echo
done < "$ENVIRONMENTS_TSV"

echo
if [ "$fail" -eq 0 ]; then
  ok "Run \"$RUN_LABEL\": $pass/$total PASS"
else
  warn "Run \"$RUN_LABEL\": $pass PASS, $fail FAIL (of $total)"
fi
info "Appended to $BENCHMARK_CSV — compare runs with ./3-summary.sh"

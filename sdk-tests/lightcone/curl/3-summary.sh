#!/usr/bin/env bash
#
# Summarize state/benchmark.csv: per VM, show each run's resume / time-to-usable and
# the delta vs that VM's first recorded run. Answers "did 24h change the score?".
#
# Usage: ./3-summary.sh
#
set -euo pipefail
. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/lib.sh"

[ -f "$BENCHMARK_CSV" ] || die "No $BENCHMARK_CSV — run ./2-resume-and-benchmark.sh first"

info "Benchmark summary  ($BENCHMARK_CSV)"
echo

# Columns: 1 run_label,2 run_iso,3 vm_label,4 environment_id,5 restored_id,
#          6 resume_http_code,7 resume_time_s,8 time_to_ready_s,9 exec_time_s,
#          10 time_to_usable_s,11 marker_ok,12 notes
awk -F',' -v cvm="$C_YEL" -v cpass="$C_GREEN" -v cfail="$C_RED" -v crst="$C_RESET" '
  function unit(v, u) { return (v == "" ? "?" : v u) }
  NR == 1 { next }                       # skip header
  {
    vm = $3
    if (!(vm in seen)) { order[++n] = vm; seen[vm] = 1 }
    c[vm]++
    idx = c[vm]
    rlabel[vm, idx] = $1
    resume[vm, idx] = $7
    ready[vm, idx]  = $8
    usable[vm, idx] = $10
    mok[vm, idx]    = $11
    notes[vm, idx]  = $12
  }
  END {
    for (i = 1; i <= n; i++) {
      vm = order[i]
      printf "%s%s%s\n", cvm, vm, crst
      base = ""
      for (j = 1; j <= c[vm]; j++) {
        u = usable[vm, j]
        delta = ""
        if (j == 1) { base = u }
        else if (base != "" && u != "") {
          d = u - base
          delta = sprintf("  (%s%.0fs vs first)", (d >= 0 ? "+" : ""), d)
        }
        status = (mok[vm, j] == "yes") ? cpass "PASS" crst : cfail "FAIL" crst
        extra = (notes[vm, j] != "" ? "  [" notes[vm, j] "]" : "")
        printf "  run %-16s  %s  resume=%-9s ready=%-5s usable=%-6s%s%s\n",
               rlabel[vm, j], status, unit(resume[vm, j], "s"),
               unit(ready[vm, j], "s"), unit(usable[vm, j], "s"), delta, extra
      }
      print ""
    }
  }
' "$BENCHMARK_CSV"

# Optional cross-check: any persistent environments still live on the server?
if load_api_key 2>/dev/null && require_tools 2>/dev/null; then
  if live="$(api GET "/computers?type=persistent" 2>/dev/null)"; then
    count="$(printf '%s' "$live" | jq 'if type=="array" then length else ((.data // []) | length) end' 2>/dev/null || echo "?")"
    info "Persistent environments currently reported by server: $count"
  fi
fi

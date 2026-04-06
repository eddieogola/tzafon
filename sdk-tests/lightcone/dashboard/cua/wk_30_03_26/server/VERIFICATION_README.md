# Screenshot Verification Feature

## Overview

Both `lightcone_agent.py` and `advanced_agent.py` now include automatic screenshot verification functionality. After completing a task, the agent generates a detailed markdown summary in the `results/` folder.

## How It Works

### 1. Automatic Path Detection

The agents automatically detect expected screenshots based on the instruction file name:
- `instructions/home_completions.md` → `expected/home_completions.png`
- `instructions/[name].md` → `expected/[name].png`

### 2. Verification Instructions

If an expected screenshot exists, the agent is instructed to:
- Complete the task steps
- Provide a detailed completion summary with checkmarks
- Describe the current screen state in detail

### 3. Summary Generation

After task completion, a markdown summary is automatically saved to:
```
results/[instruction_name]_summary.md
```

The summary includes:
- Task completion date and time
- Instructions file path
- Expected screenshot path
- Detailed completion message from the agent
- Parsed task steps (if available)
- Screenshot verification status

## Important Note: Screenshot Path Issue

**Why the agent can't access local screenshot files:**

Lightcone agents run in a **remote cloud environment**, not on your local machine. This means:
- Local file paths (like `/Users/you/project/expected/screenshot.png`) are not accessible to the agent
- The agent runs in an isolated workspace with its own filesystem

### Current Workaround

Instead of comparing against a screenshot file, the agent:
1. Completes the task
2. Provides a detailed description of the current screen state
3. Lists all completed steps with checkmarks

This allows you to manually verify the results by comparing the agent's description with your expected screenshot.

### Future Enhancement Options

To enable automatic visual comparison, you could:

1. **Upload screenshots to a URL**: Host the expected screenshot on a publicly accessible URL and reference that in the instructions

2. **Use the Responses API**: The Responses API supports providing images as input via `input_image` parameter, though this requires more complex implementation

3. **Post-execution comparison**: Download the final screenshot from the agent and compare it locally using Claude's vision API (the original approach we started with)

## Usage

### Running the Agents

```bash
# Simple agent
python lightcone_agent.py

# Advanced agent with options
python advanced_agent.py --mode stream --max-steps 50 --save-events
```

### Output Structure

```
project/
├── instructions/
│   └── home_completions.md
├── expected/
│   └── home_completions.png
├── results/
│   └── home_completions_summary.md  ← Generated automatically
└── logs/
    └── lightcone_agent_*.log
```

## Summary Format

The generated markdown summary includes:

```markdown
# Task Execution Summary

**Date:** 2026-04-05 19:43:19
**Instructions File:** instructions/home_completions.md
**Expected Screenshot:** expected/home_completions.png

---

## Completion Message

[Full agent completion message]

---

### Task Steps Completed

✅ Step 1: ...
✅ Step 2: ...
✅ Step 3: ...

### Screenshot Verification

[Agent's description of the current screen state]

**Status:** ⚠️ Could not verify - Expected screenshot not accessible to agent

---
```

## Verification Status Indicators

- ✅ **Verification PASSED** - Screen matches expected state
- ❌ **Verification FAILED** - Screen doesn't match expected state
- ⚠️ **Could not verify** - Expected screenshot not accessible (expected behavior with current implementation)

## Next Steps

If you need true automated visual comparison:
1. Upload expected screenshots to a CDN or public URL
2. Update the verification instruction to reference the URL instead of local path
3. The agent will be able to download and compare the images

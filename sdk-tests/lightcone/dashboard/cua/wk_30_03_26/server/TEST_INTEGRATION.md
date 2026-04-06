# Integration Test Guide

## Complete System Overview

You now have a **fully integrated testing system** for Lightcone agents:

```
┌─────────────────────────────────────────────────────────────────┐
│                    LIGHTCONE AGENT TESTING SYSTEM               │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────┐      ┌──────────────────────┐
│  Lightcone Agents    │      │   Next.js Dashboard  │
│                      │      │                      │
│  • lightcone_agent   │◄────►│  • Visual Results    │
│  • advanced_agent    │      │  • Screenshots       │
│                      │      │  • Timeline View     │
│  Generates:          │      │  • API Endpoints     │
│  ├─ results/*.md     │──────┤                      │
│  ├─ logs/*.log       │      │  Real-time Display   │
│  └─ screenshots      │      │  of Agent Results    │
└──────────────────────┘      └──────────────────────┘
         │                              │
         └──────────┬───────────────────┘
                    ▼
         ┌────────────────────┐
         │  Expected Results  │
         │  expected/*.png    │
         └────────────────────┘
```

---

## 🧪 End-to-End Testing Flow

### Step 1: Start the Dashboard

```bash
cd dash-app
pnpm dev
```

The dashboard will be available at **http://localhost:3000**

### Step 2: Run a Lightcone Agent

In a new terminal:

```bash
cd /Users/eddieogola/dev/job/tzafon/sdk-tests/lightcone/dashboard/cua/wk_30_03_26
python lightcone_agent.py
```

This will:
1. Read instructions from `instructions/home_completions.md`
2. Execute the task on Lightcone
3. Check against `expected/home_completions.png`
4. Save results to `results/home_completions_summary.md`
5. Log events to `logs/lightcone_agent_*.log`

### Step 3: View Results in Dashboard

The dashboard automatically displays:
- ✅ Task completion steps
- 📊 Execution timeline
- 📸 Screenshot comparison
- ⚠️ Verification status
- 📝 Full summary

---

## 📋 Testing Checklist

### ✅ Dashboard Features

Test each feature by navigating to the dashboard:

- [ ] **Landing Page** (http://localhost:3000)
  - Modern hero section
  - Feature highlights
  - "Get Started" button links to dashboard

- [ ] **Main Dashboard** (http://localhost:3000/dashboard)
  - Stats cards display
  - Recent activity
  - Overview charts

- [ ] **Results View**
  - Navigate to results section
  - See parsed markdown summaries
  - View verification status badges

- [ ] **API Endpoints**
  - Test with: `bash test-api.sh` (in dash-app/)
  - Or manually test:
    ```bash
    curl http://localhost:3000/api/results
    curl http://localhost:3000/api/screenshots
    curl http://localhost:3000/api/logs
    ```

### ✅ Agent Integration

- [ ] **Run Simple Agent**
  ```bash
  python lightcone_agent.py
  ```
  - Check results folder updated
  - Verify dashboard shows new results

- [ ] **Run Advanced Agent**
  ```bash
  python advanced_agent.py --mode stream
  ```
  - Check detailed logs created
  - Verify structured event history

- [ ] **Multiple Test Runs**
  - Run agent 3-5 times
  - Verify dashboard shows all runs
  - Check timeline sorting

### ✅ Screenshot Verification

- [ ] **Expected Screenshot Exists**
  - Verify `expected/home_completions.png` is present
  - Agent should report file path in summary

- [ ] **Verification Status**
  - Check dashboard shows correct status:
    - ✅ PASSED - if screens match
    - ⚠️ WARNING - if file not accessible
    - ❌ FAILED - if screens don't match

---

## 🔬 Sample Test Scenarios

### Scenario 1: Fresh Install Test

```bash
# 1. Install and start dashboard
cd dash-app
pnpm install
pnpm dev

# 2. In new terminal, run agent
cd ..
python lightcone_agent.py

# 3. Verify dashboard updates
# Visit http://localhost:3000/dashboard
# Should see: home_completions result
```

### Scenario 2: Multiple Instructions

```bash
# Create new instruction file
cat > instructions/test_login.md << 'EOF'
Go to https://example.com
Fill in username: test@example.com
Click login button
EOF

# Create expected screenshot
# (manually capture or use existing)
cp expected/home_completions.png expected/test_login.png

# Update agent to use new file
# Edit lightcone_agent.py line 234:
# agent = LightconeAgent("instructions/test_login.md")

# Run agent
python lightcone_agent.py

# Check dashboard for new result
```

### Scenario 3: API Integration Test

Test all API endpoints:

```bash
cd dash-app

# Test results endpoint
curl http://localhost:3000/api/results | jq

# Test specific result
curl http://localhost:3000/api/results/home_completions | jq

# Test screenshots
curl http://localhost:3000/api/screenshots | jq

# Test logs
curl http://localhost:3000/api/logs?page=1&limit=5 | jq
```

### Scenario 4: Real-time Monitoring

```bash
# Terminal 1: Watch results folder
watch -n 1 ls -lt results/

# Terminal 2: Watch dashboard (keep browser open)
# http://localhost:3000/dashboard

# Terminal 3: Run agent
python lightcone_agent.py

# Observe real-time file creation and dashboard updates
```

---

## 🐛 Debugging Integration Issues

### Dashboard Not Showing Results

**Issue**: API returns empty array

**Check**:
```bash
# Verify results folder exists and has files
ls -la results/

# Check file permissions
ls -l results/*.md

# Test API directly
curl http://localhost:3000/api/results
```

**Fix**:
- Ensure `results/` folder exists in parent directory
- Run agent at least once to generate results
- Check Next.js API route paths in `app/api/results/route.ts`

### Screenshots Not Loading

**Issue**: Screenshot comparison shows broken images

**Check**:
```bash
# Verify screenshot exists
ls -la expected/*.png

# Check file size
du -h expected/*.png

# Test in browser
# http://localhost:3000/expected/home_completions.png
```

**Fix**:
- Ensure screenshots are in `expected/` folder
- Check file extensions (.png)
- Verify Next.js public folder configuration

### Agent Not Generating Summaries

**Issue**: `results/` folder remains empty after agent run

**Check**:
```bash
# Run agent in verbose mode
python lightcone_agent.py

# Check for errors in output
# Look for "Summary saved to:" message
```

**Fix**:
- Verify agent code includes `save_verification_summary()`
- Check results folder path is correct
- Ensure write permissions

---

## 📊 Performance Testing

### Load Test the Dashboard

```bash
# Install Apache Bench (if needed)
brew install ab  # macOS

# Test API endpoints
ab -n 100 -c 10 http://localhost:3000/api/results
ab -n 100 -c 10 http://localhost:3000/api/screenshots
ab -n 100 -c 10 http://localhost:3000/api/logs
```

### Agent Execution Time

Monitor agent performance:

```bash
# Time agent execution
time python lightcone_agent.py

# Check logs for timing
grep "completed in" logs/*.log

# Parse timing from summary
grep "Date:" results/*.md
```

---

## 🎯 Success Criteria

Your integration is successful when:

✅ **Dashboard loads** without errors on http://localhost:3000
✅ **API endpoints** return valid JSON
✅ **Agent executes** and completes task
✅ **Results appear** in dashboard within 5 seconds
✅ **Summaries parse** correctly with markdown formatting
✅ **Screenshots display** in comparison view
✅ **Verification status** shows correctly (✅/⚠️/❌)
✅ **Timeline** displays events chronologically
✅ **Logs** are accessible and readable

---

## 🚀 Advanced Integration

### WebSocket for Real-time Updates

Enable live updates as agent executes:

```typescript
// hooks/useWebSocket.ts is already created
import { useWebSocket } from '@/hooks/useWebSocket';

function Dashboard() {
  const { data, status } = useWebSocket('ws://localhost:3001');

  // Data updates in real-time as agent executes
}
```

### Automated Testing

Create test suite:

```bash
# Install testing dependencies
cd dash-app
pnpm add -D @testing-library/react @testing-library/jest-dom jest

# Create test
# __tests__/integration.test.tsx
```

### CI/CD Integration

```yaml
# .github/workflows/test.yml
name: Integration Tests

on: [push]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: pnpm/action-setup@v2
      - name: Install dependencies
        run: cd dash-app && pnpm install
      - name: Build dashboard
        run: cd dash-app && pnpm build
      - name: Run agent
        run: python lightcone_agent.py
      - name: Verify results
        run: test -f results/home_completions_summary.md
```

---

## 📖 Documentation Reference

- **DASHBOARD_GUIDE.md** - Dashboard usage
- **SETUP.md** - Setup instructions
- **API.md** - API documentation
- **INTEGRATION.md** - Integration details
- **VERIFICATION_README.md** - Agent verification

---

## ✨ Next Steps

1. **Run the integration** - Follow Step 1-3 above
2. **Customize dashboard** - Add your branding, colors
3. **Add more tests** - Create additional instruction files
4. **Monitor results** - Use dashboard to track performance
5. **Automate testing** - Set up CI/CD pipeline

---

**Your complete testing system is ready! 🎉**

Run `pnpm dev` in dash-app/ and `python lightcone_agent.py` to see it in action.

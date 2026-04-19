# Recent Changes - UV Integration

## Updated to Use UV Package Manager

All commands and documentation have been updated to use `uv` instead of `pip`.

### Files Modified

1. **Makefile**
   - `make install` now runs `uv sync` instead of `pip install`
   - All test commands now use `uv run python` instead of `python`
   - Added check for `uv` installation with helpful error message

2. **TESTING_GUIDE.md**
   - Updated all CLI examples to use `uv run python`
   - Updated Makefile target examples

### Commands Changed

**Before:**
```bash
python lightcone_agent.py --suite home
python advanced_agent.py --file home/test.md
```

**After:**
```bash
uv run python lightcone_agent.py --suite home
uv run python advanced_agent.py --file home/test.md
```

### Makefile Commands (No Change Required)

The Makefile handles `uv` automatically, so you can still use:
```bash
make install       # Uses uv sync internally
make test-home     # Uses uv run internally
make test-all      # Uses uv run internally
```

### Installation

If `uv` is not installed, the Makefile will show:
```
❌ Error: uv is not installed
Install uv first: curl -LsSf https://astral.sh/uv/install.sh | sh
```

### Benefits

- ✅ Faster dependency resolution
- ✅ Better dependency management
- ✅ Consistent with project standards
- ✅ Virtual environment management built-in
- ✅ No manual pip/virtualenv setup needed

---

Date: 2026-04-19

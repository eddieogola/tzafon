# Security Guide - PII and Secrets Protection

This project implements industry-standard (2026) security practices for handling PII and secrets in AI agent workflows.

## 🔒 Protection Layers

### 1. Runtime Logging Protection

**SecretsFilter** (`secure_logger.py`) automatically redacts:
- Passwords
- Email addresses
- API keys (OpenAI, Anthropic, AWS, etc.)
- Phone numbers
- SSNs
- Credit card numbers
- Environment variable values

#### How it Works:
- Regex pattern matching for common secret formats
- Environment variable value replacement
- Runs on all log output and saved summaries

#### Usage:
```python
from secure_logger import SecretsFilter, create_safe_preview

filter = SecretsFilter()
safe_text = filter.redact("Login with password: secret123")
# Output: "Login with [PASSWORD_***REDACTED***]: ***REDACTED***"

# For previews
preview = create_safe_preview("Long text with secrets...", max_length=200)
```

### 2. Git Pre-commit Hooks

**Three-layer secret scanning** before commits:

1. **TruffleHog**: 800+ secret types, verification
2. **Gitleaks**: Broad entropy-based detection
3. **detect-secrets**: Baseline scanning

#### Installation:
```bash
# Install pre-commit
uv pip install pre-commit

# Install hooks
pre-commit install

# Test manually
pre-commit run --all-files
```

**Note**: You'll need to install the scanner tools:
```bash
# macOS
brew install trufflehog gitleaks

# Or download from releases:
# - https://github.com/trufflesecurity/trufflehog/releases
# - https://github.com/gitleaks/gitleaks/releases
```

### 3. Environment Variable Best Practices

**Never hardcode secrets.** Always use `.env`:

```bash
# .env (never commit this!)
LIGHTCONE_EMAIL=user@example.com
LIGHTCONE_PASSWORD=your_password
TZAFON_API_KEY=sk_...
```

**Template files use Jinja2 variables:**
```markdown
Login with email: {{ LIGHTCONE_EMAIL }}
password: {{ LIGHTCONE_PASSWORD }}
```

## 🎯 What Gets Redacted

### Automatic Redaction in Logs:
- ✅ Console output during execution
- ✅ Event messages from agent
- ✅ Summary files saved to `results/`
- ✅ Instruction previews

### What's NOT Redacted:
- ❌ The actual instruction sent to the AI (required for execution)
- ❌ Screenshots captured during execution
- ❌ Environment variables themselves (only values in logs)

## 📊 Compliance

This implementation helps with:
- **GDPR**: Data minimization by redacting PII before storage
- **SOC 2**: Secret management and logging controls
- **HIPAA**: PII protection in medical contexts (if applicable)

## 🔧 Customization

### Adding Custom Secret Patterns:

```python
from secure_logger import SecretsFilter

custom_patterns = {
    "CUSTOM_TOKEN": r"mytoken_[a-zA-Z0-9]{20}",
    "INTERNAL_ID": r"ID-\d{8}"
}

filter = SecretsFilter(additional_patterns=custom_patterns)
```

### Adding More Environment Variables to Redact:

Edit `secure_logger.py` line 65:

```python
secret_vars = [
    "LIGHTCONE_PASSWORD",
    "LIGHTCONE_EMAIL",
    "TZAFON_API_KEY",
    "YOUR_NEW_SECRET",  # Add here
]
```

## ⚠️ Known Limitations

1. **Imperfect Detection**: Regex can't catch all secret formats
2. **Performance**: Pattern matching adds small overhead to logging
3. **False Positives**: May redact non-sensitive data that matches patterns
4. **AI Agent Output**: The agent might echo secrets in responses - these are redacted in logs but sent to the AI service

## 📚 References

Based on 2026 industry best practices:
- [LangChain Security Guide](https://docs.langchain.com/langsmith/mask-inputs-outputs)
- [TruffleHog Documentation](https://github.com/trufflesecurity/trufflehog)
- [OWASP Secrets Management](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
- [AI Agent Security Guide 2026](https://langchain-tutorials.github.io/langchain-security-privacy-2026/)

## 🐛 Reporting Security Issues

If you discover a security vulnerability, please email security@example.com instead of using the issue tracker.

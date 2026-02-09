# Integration Plan: Tzafon LLM Models with Braintrust

## Context

Tzafon provides OpenAI-compatible chat completion models through their API at `https://api.tzafon.ai/v1`. Currently, the Braintrust integration in this repository only covers **browser automation tools** ([py/main.py](py/main.py)), not the **LLM capabilities**.

This plan addresses integrating Tzafon's LLM models (like `tzafon.sm-1` and `tzafon.northstar-cua-fast`) with Braintrust's evaluation, tracing, and experimentation platform to:
- Enable Tzafon model evaluation using Braintrust's Eval framework
- Provide automatic tracing of Tzafon LLM calls
- Allow Tzafon models to be used through Braintrust's AI Proxy
- Create a pathway for Tzafon to become an officially supported Braintrust provider

Since Tzafon implements an OpenAI-compatible API, we can leverage Braintrust's existing `wrapOpenAI` functionality without building custom wrappers.

## Integration Approach: Three-Phase Strategy

### Phase 1: Custom Provider Configuration (Quick Win - 1-2 days)
Configure Tzafon as a custom LLM provider through Braintrust's UI settings. This provides immediate functionality without any code changes.

**Steps:**
1. Navigate to Braintrust Settings → AI providers → Custom providers → Create
2. Configure:
   - Provider name: `tzafon`
   - Model names: `tzafon.sm-1`, `tzafon.northstar-cua-fast`
   - Endpoint URL: `https://api.tzafon.ai/v1/chat/completions`
   - Format: `openai` (Tzafon is OpenAI-compatible)
   - Flavor: `chat`
   - Headers: `Authorization: Bearer {{api_key}}`
3. Test via Braintrust AI Proxy: `https://api.braintrust.dev/v1/proxy`

**Result:** Tzafon models accessible via `model="tzafon/tzafon.sm-1"` through the proxy

### Phase 2: SDK Examples & Documentation (Core Integration - 2-3 weeks)
Create comprehensive examples and documentation showing how to use Tzafon models with Braintrust for evaluation, tracing, and experimentation.

**Directory Structure:**
```
integrations/braintrust/
├── llm/                          # NEW: LLM integration
│   ├── py/
│   │   ├── README.md
│   │   ├── .env.example
│   │   ├── pyproject.toml
│   │   ├── requirements.txt
│   │   ├── examples/
│   │   │   ├── 01_basic_completion.py
│   │   │   ├── 02_evaluation.py
│   │   │   ├── 03_streaming.py
│   │   │   ├── 04_proxy_usage.py
│   │   │   └── 05_comparison_experiment.py
│   │   └── tests/
│   │       └── test_integration.py
│   └── ts/                       # Mirror structure for TypeScript
│       ├── README.md
│       ├── package.json
│       └── examples/
├── py/                           # EXISTING: Browser automation
└── ts/                           # EXISTING: Browser automation
```

### Phase 3: Official SDK Contribution (Optional Long-term - 1-2 months)
Contribute Tzafon as a first-class provider to Braintrust's official repositories:
- **braintrust-sdk** repository: Add Tzafon to provider list
- **braintrust-proxy** repository: Add Tzafon provider configuration

This is optional but would make Tzafon officially recognized in the Braintrust ecosystem.

## Critical Files to Create

### 1. Basic Completion Example
**File:** `llm/py/examples/01_basic_completion.py`

Shows the fundamental pattern - using Tzafon with Braintrust tracing:

```python
import os
import braintrust
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

# Initialize Braintrust logger
logger = braintrust.init(
    project="tzafon-chat-examples",
    api_key=os.getenv("BRAINTRUST_API_KEY")
)

# Initialize OpenAI client with Tzafon endpoint
client = OpenAI(
    api_key=os.getenv("TZAFON_API_KEY"),
    base_url="https://api.tzafon.ai/v1"
)

# Wrap for automatic tracing
client = braintrust.wrapOpenAI(client)

# Use normally - all calls automatically traced
@logger.traced
def chat_completion(prompt: str):
    response = client.chat.completions.create(
        model="tzafon.sm-1",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7,
        max_tokens=1024
    )
    return response.choices[0].message.content

if __name__ == "__main__":
    result = chat_completion("What is machine learning?")
    print(result)
```

**Key Pattern:** Direct API usage with `wrapOpenAI` for tracing. No custom wrapper needed due to OpenAI compatibility.

### 2. Evaluation Example
**File:** `llm/py/examples/02_evaluation.py`

Demonstrates running evaluations on Tzafon models:

```python
from braintrust import Eval
from autoevals import Levenshtein

# Define evaluation dataset
eval_data = [
    {"input": "What is 2+2?", "expected": "4"},
    {"input": "Explain recursion briefly", "expected": "A function calling itself"}
]

# Run evaluation
Eval(
    "tzafon-sm1-basic-eval",
    data=lambda: eval_data,
    task=lambda input: chat_completion(input["input"]),
    scores=[Levenshtein]
)
```

**Purpose:** Show core Braintrust use case - evaluating model quality

### 3. Proxy Usage Example
**File:** `llm/py/examples/04_proxy_usage.py`

Shows using Tzafon through Braintrust AI Proxy (after Phase 1 custom provider setup):

```python
# Use Braintrust AI Proxy endpoint
proxy_client = OpenAI(
    api_key=os.getenv("BRAINTRUST_API_KEY"),  # Note: Braintrust key, not Tzafon
    base_url="https://api.braintrust.dev/v1/proxy"
)

response = proxy_client.chat.completions.create(
    model="tzafon/tzafon.sm-1",  # Format: provider/model
    messages=[{"role": "user", "content": "Hello"}]
)
```

**Benefits:** Unified API key management, automatic caching, cost tracking

### 4. Comparison Experiment Example
**File:** `llm/py/examples/05_comparison_experiment.py`

Compares Tzafon against other providers:

```python
# Compare multiple models
models = [
    {"name": "tzafon-sm1", "base_url": "https://api.tzafon.ai/v1", "model": "tzafon.sm-1"},
    {"name": "gpt-4o-mini", "base_url": "https://api.openai.com/v1", "model": "gpt-4o-mini"},
]

for config in models:
    client = OpenAI(api_key=os.getenv(f"{config['name'].upper()}_API_KEY"),
                    base_url=config['base_url'])
    client = braintrust.wrapOpenAI(client)

    Eval(f"comparison-{config['name']}", ...)
```

**Purpose:** Benchmark Tzafon against competitors

### 5. Python Documentation
**File:** `llm/py/README.md`

Following the pattern from [py/README.md](py/README.md):

**Sections:**
1. **Introduction** - What this integration provides
2. **What is Tzafon?** - Brief description with link to docs
3. **Prerequisites** - Python 3.10+, API keys
4. **Setup** - Numbered steps:
   - Install dependencies: `pip install braintrust openai python-dotenv autoevals`
   - Get Tzafon API key
   - Get Braintrust API key
   - Configure `.env` file
5. **Usage** - Running examples locally
6. **Custom Provider Setup** - UI configuration steps for Phase 1
7. **How it Works** - Code explanation
8. **Resources** - Links to docs

### 6. TypeScript Examples
Mirror the Python structure with TypeScript implementations:

**File:** `llm/ts/examples/01_basic_completion.ts`

```typescript
import { initLogger, wrapOpenAI } from "braintrust";
import OpenAI from "openai";

const logger = initLogger({
  project: "tzafon-chat-examples",
  apiKey: process.env.BRAINTRUST_API_KEY
});

const client = wrapOpenAI(
  new OpenAI({
    apiKey: process.env.TZAFON_API_KEY,
    baseURL: "https://api.tzafon.ai/v1"
  })
);

async function chatCompletion(prompt: string) {
  const response = await client.chat.completions.create({
    model: "tzafon.sm-1",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    max_tokens: 1024
  });
  return response.choices[0].message.content;
}
```

## Implementation Timeline

### Week 1: Phase 1 (Quick Win)
- **Day 1-2:** Configure custom provider in Braintrust UI
- **Day 3-4:** Test proxy integration thoroughly
- **Day 5:** Document configuration process

### Week 2-3: Phase 2 (Core Integration)
- **Week 2:**
  - Set up directory structure
  - Implement Python examples (5 examples)
  - Write Python README
  - Create Python tests
- **Week 3:**
  - Implement TypeScript examples
  - Write TypeScript README
  - Create TypeScript tests
  - Integration testing

### Week 4: Phase 2 Finalization
- Comprehensive testing across both languages
- Documentation review and polish
- Create integration guide

### Month 2+ (Optional): Phase 3
- Research Braintrust SDK/Proxy codebases
- Develop local implementations
- Submit pull requests
- Iterate based on maintainer feedback

## Key Design Decisions

### 1. Leverage OpenAI Compatibility
Tzafon's OpenAI-compatible API means we can use `braintrust.wrapOpenAI()` directly without building custom wrappers. This significantly reduces complexity.

### 2. Support Both Direct and Proxy Integration
- **Direct:** `base_url="https://api.tzafon.ai/v1"` - Lower latency, direct connection
- **Proxy:** `base_url="https://api.braintrust.dev/v1/proxy"` - Unified API keys, caching, cost tracking

Both methods have value depending on use case.

### 3. Phase 2 Provides Complete Value
Examples and documentation in Phase 2 deliver a fully functional integration. Phase 3 (official contribution) is a bonus but not required for success.

### 4. Model Naming Conventions
- **Direct usage:** `model="tzafon.sm-1"`
- **Proxy usage:** `model="tzafon/tzafon.sm-1"` (format: `provider/model`)

## Dependencies

### Python
```
braintrust>=1.1.1
openai>=1.0.0
python-dotenv>=1.0.0
autoevals>=0.1.0
pytest>=7.0.0  # For testing
```

### TypeScript
```json
{
  "braintrust": "^1.1.1",
  "openai": "^4.0.0",
  "dotenv": "^17.2.3",
  "vitest": "^1.0.0"
}
```

## Testing & Verification

### Phase 1 Verification
1. Custom provider successfully configured in Braintrust UI
2. Test request via proxy succeeds:
   ```python
   client = OpenAI(
       api_key=BRAINTRUST_API_KEY,
       base_url="https://api.braintrust.dev/v1/proxy"
   )
   response = client.chat.completions.create(
       model="tzafon/tzafon.sm-1",
       messages=[{"role": "user", "content": "test"}]
   )
   assert response.choices[0].message.content
   ```
3. Traces visible in Braintrust dashboard
4. Cost tracking appears (if configured)

### Phase 2 Verification
1. All 5 Python examples run successfully
2. All 5 TypeScript examples run successfully
3. Traces appear in Braintrust with correct metadata
4. Evaluations complete and scores calculate
5. Streaming works correctly
6. Tests pass: `pytest tests/` and `npm test`
7. Documentation is clear and comprehensive

### Integration Test Checklist
- [ ] Basic completion request/response
- [ ] Streaming completions
- [ ] Multi-turn conversations
- [ ] Error handling (invalid API key, rate limits)
- [ ] Evaluation workflow end-to-end
- [ ] Proxy routing works correctly
- [ ] Tracing captures all metadata
- [ ] Both Python and TypeScript working

## Success Criteria

### Phase 1 Success
✅ Custom provider configured and tested
✅ Proxy integration working
✅ Configuration documented

### Phase 2 Success
✅ 5+ working examples per language (Python & TypeScript)
✅ Comprehensive README for each language
✅ All tests passing
✅ Integration guide completed

### Phase 3 Success (Optional)
✅ PR submitted to Braintrust SDK or Proxy repository
✅ Maintainer feedback received
🎯 PR merged (ideal but not required)

## Resources & References

### Existing Codebase
- Browser automation integration: [py/main.py](py/main.py)
- Tzafon OpenAI usage: [../models/py/main.py](../models/py/main.py)
- Documentation pattern: [py/README.md](py/README.md)

### Braintrust Documentation
- Custom Providers: https://www.braintrust.dev/docs/integrations/ai-providers/custom
- AI Proxy Guide: https://www.braintrust.dev/docs/guides/proxy
- OpenAI Integration: https://www.braintrust.dev/docs/integrations/ai-providers/openai

### Braintrust Repositories
- SDK: https://github.com/braintrustdata/braintrust-sdk
- Proxy: https://github.com/braintrustdata/braintrust-proxy

### Tzafon Resources
- API Base URL: `https://api.tzafon.ai/v1`
- Documentation: https://docs.tzafon.ai/core-concepts/chat-completions
- Models: `tzafon.sm-1`, `tzafon.northstar-cua-fast`

## Next Steps

**Immediate (this week):**
1. Configure custom provider in Braintrust UI (Phase 1)
2. Test basic proxy integration
3. Verify tracing works

**Short-term (next 2-3 weeks):**
1. Create directory structure for `llm/`
2. Implement all Python examples
3. Write Python README and tests
4. Implement all TypeScript examples
5. Write TypeScript README and tests

**Optional (future):**
1. Research Braintrust SDK/Proxy codebases
2. Develop PR for official integration
3. Submit and iterate with maintainers

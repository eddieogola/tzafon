# Docs, SDK & API bugs

Found while reconciling this suite with [docs.lightcone.ai](https://docs.lightcone.ai) on
**2026-07-17**, against `tzafon==2.44.0` and `@tzafon/lightcone@0.19.0`.

Every finding is tagged by how it was established:

| Tag | Meaning |
|---|---|
| **LIVE** | Reproduced against the real API with a working key. Not an inference. |
| **SDK** | Verified by introspecting the shipped package (signatures, `.d.ts`, `model_fields`). |
| **ANALYSIS** | Found by reading docs + code. Plausible, not executed. Treat as a lead. |

Two lessons earned the hard way, and they frame everything below:

> **1. The docs are not reliable ground truth for SDK surface.** Every docs-vs-reality conflict
> resolved by execution went against the docs. Three times we broke working code by trusting a
> docs page over the API (`is_main`, `TzafonLoader(kind=)`, and pinning `-1.6`).
>
> **2. Passing is not working.** Running the suite live found five examples that pass while
> testing nothing — and two findings in this file were *wrong* until executed (§2.1, §5.2). A
> green check and a correct behaviour are different claims.

---

## 0. Critical — fix these first

### 0.1 `tzafon.northstar-cua-fast-1.6` returns `x=0` for every coordinate — **LIVE**

**Pages:** [guides/changelog](https://docs.lightcone.ai/guides/changelog/) ("Pin your model versions
(`tzafon.northstar-cua-fast-1.6`, not an unversioned alias)"), and every page whose examples use it.

The pinned, recommended, production-blessed model **cannot return an x coordinate.** Same
screenshot, same prompt, same tool config — only the model differs:

```
tzafon.northstar-cua-fast-1.6  ->  [(0, 230), (0, 230), (0, 230)]
tzafon.northstar-cua-fast      ->  [(149, 230), (149, 230), (149, 230)]
```

`y=230` is identical across both, so the model **located the element** — `x` is lost in transit.
Deterministic across 3/3 here, and 13/13 in a wider sweep (vs. 10/11 correct on the alias).

**Consequence:** every single-shot click via the Responses API lands on the left screen edge. The
CUA loop only survives because it's a loop — its wasted first click at (0,0) is visible in a real
run's transcript. The docs' own `use-cases/docs-validation` page specifies `-1.6`, so following it
exactly produces coordinates *worse* than the hardcoded literals it tells you to replace.

**This is why the deprecation policy is actively harmful right now:** the docs tell you to pin the
broken model and avoid the working one.

### 0.2 Every documented streaming example crashes at end-of-stream — **LIVE**

**Pages:** [guides/tasks](https://docs.lightcone.ai/guides/tasks/),
[guides/run-a-task](https://docs.lightcone.ai/guides/run-a-task/),
[use-cases/docs-validation](https://docs.lightcone.ai/use-cases/docs-validation/)

```
JSONDecodeError: Expecting value: line 1 column 1 (char 0)
```

Two triggers, one root cause in `tzafon/_streaming.py`:

1. **Empty event after `completed`** — the server dispatches `ServerSentEvent(event=None, data='', id=25)`
   immediately after the terminal event. Captured live.
2. **`: ping` heartbeat** — sent after 20.0s of stream idle. The comment line is correctly ignored,
   but the blank line terminating it reaches the emit branch.

Either way the emptiness guard cannot fire:

```python
if not self._event and not self._data and not self._last_event_id and self._retry is None:
    return None
```

`_last_event_id` is **sticky by design** (the SDK's own comment cites the SSE spec), and Lightcone
sends `id:` on **every** frame (histogram: `{id: 30, data: 30}`). So from frame 1 onward an empty
frame always emits, and `Stream.__stream__` calls `sse.json()` → `json.loads('')` unguarded.

Proven offline against the SDK's own decoder: `b'id: 0\ndata: {...}\n\n: ping\n\n'` raises; the
same bytes without `id:` parse fine.

**The docs' canonical pattern is `for event in ...: print(event)` with no `break`** — SDK reference
*and* the docs-validation page, both languages. **Following the docs literally always crashes.**
Examples here survive only because they add a non-documented `break` on `completed`.

**Fix:** guard `sse.json()` on empty data, or don't dispatch empty frames.

### 0.3 `retrieve_events` destroys the session — **LIVE**

**Page:** [guides/observability#event-stream-and-websocket](https://docs.lightcone.ai/guides/observability/#event-stream-and-websocket)

Opens 200, yields **zero** lines, and kills the computer. 3/3 deterministic, with a clean control:

```
events#0      open=200  lines=0  after=DIED
events#1      open=200  lines=0  after=GONE(NotFoundError)
events#2      open=200  lines=0  after=GONE(NotFoundError)
screencast#0  open=200  lines=3  after=RUNNING     <- control: screencast is fine
screencast#1  open=200  lines=3  after=RUNNING
```

An idle control session stayed `RUNNING`. Same class as §3.1.

### 0.4 Streaming shell exec returns nothing and destroys the session — **LIVE**

**Page:** [guides/shell-commands#streaming-execution](https://docs.lightcone.ai/guides/shell-commands/#streaming-execution)

Reproducible on **both** desktop and browser, and independently reproduced by the Python and
TypeScript suites:

```
created          : ALIVE
after exec.sync  : ALIVE   | stdout='line 1\nline 2\n'      <- sync works
stream events    : [('exit', None, -1)]                      <- no stdout, exit -1
after exec.create: GONE (NotFoundError)                      <- session destroyed
```

The 404 you see is the *downstream* cleanup failing; the real bug is upstream.

---

## 1. Silent wrong behaviour

These don't crash. They do the opposite of what the page promises, and look like they work.

### 1.1 Warm sessions can never adopt — **two independent causes** — **LIVE**

**Pages:** [cookbook/warm-sessions-and-self-healing#adopt-or-create](https://docs.lightcone.ai/cookbook/warm-sessions-and-self-healing/#adopt-or-create),
[guides/production](https://docs.lightcone.ai/guides/production/)

**Cause A — `context_id` is never returned.** It's an accepted `create()` param, the response model
is `extra="allow"`, and `model_extra` is still `{}` on create, retrieve *and* list. Verified at the
HTTP wire level:

```
POST /computers -> create resp model_extra: {}   getattr context_id -> <ABSENT>
GET  /computers -> any context_id anywhere in body? False
```

Proven by behaviour, not just introspection: a second adopt-or-create call, while the first desktop
was live, `RUNNING`, seconds old, with every other predicate satisfied — **created a duplicate.**

**Cause B — status vocabulary is inconsistent.** Same computer, three answers:

```
create()          status='ready'
retrieve()        status='RUNNING'
retrieve_status() status='RUNNING'
list()            status=['RUNNING']
```

Docs compare `c.status == "running"` → **False everywhere.** The `guides/production` variant
doesn't use `context_id` at all — it filters on status — **and still never adopts.**

Two unrelated bugs producing the same silent no-op. No error either way.

> **⚠ Latent multi-tenant hazard:** `computers.list()` is **org-wide**. If Cause B were naively
> "fixed", the docs' session-hygiene loop would navigate and **`delete()` other tenants' computers.**
> It is safe today only because the filter never matches.

### 1.2 The liveness probe can never return `False` — **LIVE**

**Page:** [cookbook/warm-sessions-and-self-healing#an-active-liveness-probe](https://docs.lightcone.ai/cookbook/warm-sessions-and-self-healing/#an-active-liveness-probe)

Docs, verbatim: *"Counting dark pixels in the field's cropped region is enough to prove the app
processed the keystrokes."* It proves nothing:

```
BASELINE dark pixels in probe region, NOTHING typed: 4000  -> live = True
AFTER typing zzprobe:                                4000  -> live = True
delta: 0
```

The crop is 200×20 = **4000 pixels, all dark** — the desktop background is dark. Typing changes the
count by **exactly zero**. The heuristic tests "does this region contain dark pixels," never "did it
change." On any dark-background UI it returns `True` unconditionally.

`_is_live` gates `session.healthy` in `escalating-recovery` **and** the keepalive loop's
auto-recovery. **A probe whose job is catching a frozen app reports "healthy" for a frozen app.**

**Fix:** a baseline diff, not an absolute count.

### 1.3 `apt-get install` installs nothing — **LIVE**

**Page:** [guides/lightcone-os#installing-software](https://docs.lightcone.ai/guides/lightcone-os/#installing-software)

The docs example is a no-op that reports success:

```
which libreoffice        -> ABSENT-BEFORE
apt-get install -y libreoffice
  exit=100   E: Unable to locate package libreoffice
which libreoffice        -> ABSENT-AFTER
libreoffice --calc &      -> exit=0   (bash: libreoffice: command not found)
```

Root cause proven by isolation — the image ships with unpopulated apt lists and the docs omit
`apt-get update`:

```
apt-get install -s libreoffice  -> exit=100  (E: Unable to locate package)
apt-get update                  -> exit=0
apt-get install -s libreoffice  -> exit=0
```

Second-order trap (cousin of §1.5): `libreoffice --calc &` returns **exit 0 despite
command-not-found**, because `&` makes bash report the fork, not the result. Both calls look clean,
the screenshot shows an empty desktop, the example goes green.

**Fix:** prepend `apt-get update &&`.

### 1.4 `ActionResult.status` is `"SUCCESS"`; docs compare `"success"` — **LIVE**

**Page:** [guides/errors#action-level-failures](https://docs.lightcone.ai/guides/errors/#action-level-failures)

```
GOOD nav  status='SUCCESS'          docs idiom  result.status != "success"  -> True
BAD  nav  status='EXECUTION_ERROR'  error_message='net::ERR_CONNECTION_RESET'
```

The docs' canonical idiom (both language tabs) prints `Navigation failed: None` after **every
successful action**. `status` is `Optional[str]` in the SDK — no enum, no validation. Every reader's
error check is inverted.

### 1.5 `firefox … &` doesn't survive exec teardown — **ANALYSIS**

**Pages:** [use-cases/software-testing](https://docs.lightcone.ai/use-cases/software-testing/),
[guides/operate-a-computer](https://docs.lightcone.ai/guides/operate-a-computer/),
[guides/how-lightcone-works](https://docs.lightcone.ai/guides/how-lightcone-works/)

The bare `&` gets reaped when the exec session closes. This suite uses
`nohup firefox … > /dev/null 2>&1 & disown`.

---

## 2. Documented surface that does not exist

### 2.1 `responses.cancel` is unimplemented; `DELETE` works — **LIVE** — ⚠ *corrected*

**Page:** [guides/responses-api#manage-responses](https://docs.lightcone.ai/guides/responses-api/#manage-responses)

> **This entry previously said the opposite.** It was tagged SDK and inferred — wrongly — that
> `cancel()` was correct because docs and SDK agreed. Both are wrong about the server.

```
GET    /responses/{valid}         -> 200  application/json
POST   /responses/{valid}/cancel  -> 404  text/plain  "404 page not found"   <- router-level
POST   /responses/{bogus}/cancel  -> 404  text/plain  "404 page not found"   <- identical; ID irrelevant
GET    /responses/{bogus}         -> 404  text/plain  "not found"            <- resource-level, different body
DELETE /responses/{valid}         -> 200  {"deleted":true,"id":"...","object":"response"}
```

The `/cancel` route returns Go's unrouted-path message for *any* id; the resource handler says
`"not found"`. **The cancel route doesn't exist. DELETE does.**

SDK: `ResponsesResource` exposes `create`/`retrieve`/`cancel`, **no `delete`**. So the SDK and API
are exactly inverted, and there is **no working way to manage a response from the SDK.**

### 2.2 `enable_login_handoff` and its events — **SDK**

**Page:** [guides/logins-and-sessions#strategy-b-human-in-the-loop-login-handoff](https://docs.lightcone.ai/guides/logins-and-sessions/#strategy-b-human-in-the-loop-login-handoff)

`enable_login_handoff`, `login_required`, `computer_parked` — none exist in either SDK. Strategy B
is unimplementable as written.

### 2.3 `client.corrections` and `client.learning` — the whole page — **SDK**

**Page:** [guides/continuous-learning](https://docs.lightcone.ai/guides/continuous-learning/)

Top-level client resources are exactly `agent`, `computers`, `chat`, `models`, `responses`. The
page's entire distinctive surface is fiction.

### 2.4 `TzafonLoader(kind="browser")` raises — **SDK**

**Page:** [integrations/langchain#document-loader](https://docs.lightcone.ai/integrations/langchain/#document-loader)

```python
TzafonLoader.__init__(self, urls, api_key=None, text_content=True)
```

No `kind`. We added it from the docs, it broke a working example, we reverted. Without it the
loader works (verified live).

### 2.5 `TzafonBrowserTool` doesn't exist — **SDK**

**Page:** [integrations/langchain#browser-tool-for-agents](https://docs.lightcone.ai/integrations/langchain/#browser-tool-for-agents)

```
langchain_tzafon exports: ChatTzafon, TzafonLoader, chat_tzafon, constants, core,
                          tzafon_loader, utils
```

`ImportError` at runtime.

### 2.6 `@langchain/tzafon` was never published — **LIVE**

**Page:** [integrations/langchain#install](https://docs.lightcone.ai/integrations/langchain/#install)

```
npm view @langchain/tzafon  ->  404 Not Found
```

The Python `langchain-tzafon` is genuine (PyPI 200). The **TypeScript LangChain integration is
undeliverable.**

### 2.7 `/integrations/crewai` is deleted — **LIVE**

`https://docs.lightcone.ai/integrations/crewai` → **404** (control:
[/integrations/langchain](https://docs.lightcone.ai/integrations/langchain/) → 200), and absent from
[/integrations/overview](https://docs.lightcone.ai/integrations/overview/).

### 2.8 `agent.tasks` has no `cancel()` — **SDK**

**Page:** [guides/errors#task-level-errors-sse-events](https://docs.lightcone.ai/guides/errors/#task-level-errors-sse-events)

The page documents a `cancelled` event. `agent.tasks` exposes only `start`, `start_stream`,
`retrieve_status`, `pause`, `resume`, `inject_message`. There is no way to reach that event — and
see §3.5, which makes this actively painful.

---

## 3. Reliability

### 3.1 Task event streams wedge, and `timeout=` doesn't protect you — **LIVE**

**Page:** [guides/run-a-task#start-a-task-with-streaming](https://docs.lightcone.ai/guides/run-a-task/#start-a-task-with-streaming)

A stream stopped emitting mid-task — no `completed`, no `failed`, no error. The example was correct
(`max_steps=20`, per docs) and had reached only step 4. The process sat in `futex_do_wait` burning
**1 second of CPU across 72 minutes**.

`Lightcone(timeout=30.0)` bounds individual HTTP requests, **not the gap between stream events**.
`for event in start_stream(...)` blocks forever. This suite carries its own 600s watchdog because
the SDK offers no equivalent.

### 3.2 TS `retrieveScreencast` / `retrieveEvents` are unusable as documented — **SDK**

**Page:** [guides/observability#screencast-stream](https://docs.lightcone.ai/guides/observability/#screencast-stream)

Typed `APIPromise<void>`. The docs' "await it, then parse the SSE body" has no body to parse, and
awaiting buffers an unbounded stream. Only `.asResponse()` works. Python's non-streaming form is
typed `-> None` with `cast_to=NoneType` — buffers-and-discards. Nothing warns.

### 3.3 `retrieve_ws` cannot produce a WebSocket — **SDK**

**Page:** [guides/observability#event-stream-and-websocket](https://docs.lightcone.ai/guides/observability/#event-stream-and-websocket)

Plain GET, `cast_to=NoneType`, no upgrade handshake.

### 3.4 Invalid enum returns 503, not 400 — **LIVE**

**Page:** [guides/errors#status-codes](https://docs.lightcone.ai/guides/errors/#status-codes)

`computers.create(kind='not-a-kind')` → `503 Service unavailable / "Please try again later."`
(3/3, `max_retries=0`; control `kind='browser'` → 200).

The docs' own table says `5xx → Retry with backoff`. So a **permanent client error is advertised as
retryable**, and the SDK's default `max_retries=3` will dutifully retry a request that can never
succeed.

### 3.5 Tasks that don't finish never reach a terminal state — **LIVE**

**Page:** [guides/run-a-task#fire-and-poll](https://docs.lightcone.ai/guides/run-a-task/#fire-and-poll)

A task that exhausted its steps polled `running` **180 times over 600s**, and was still `running`
~20 minutes later:

```
status: running   exit_code: None
```

The documented loop (`while True: ... if status in ("completed","failed"): break`) **hangs forever**.
Distinct from §3.1 (which is `start_stream`); this is the polling surface. With no
`agent.tasks.cancel()` (§2.8), there is no escape.

### 3.6 problem+json `type` is always `""` — **LIVE**

**Page:** [guides/errors#error-body-shape](https://docs.lightcone.ai/guides/errors/#error-body-shape)

```
404 body={'status': 404, 'title': 'Session not found', 'type': ''}
401 body={'status': 401, 'title': 'Invalid token', 'type': ''}
503 body={'detail': 'Please try again later.', 'status': 503, 'title': 'Service unavailable', 'type': ''}
```

Docs show `"type": "about:blank"`, and [guides/production](https://docs.lightcone.ai/guides/production/)
explicitly advises *"branch on the `type` field instead of parsing message strings"* — **impossible**.
RFC 7807 requires a URI reference.

---

## 4. Wrong field and type names

### 4.1 Tab fields: `is_main`, not `is_main_tab`; `tab_id`, not `id` — **LIVE**

**Page:** [guides/browser-tabs#list-open-tabs](https://docs.lightcone.ai/guides/browser-tabs/#list-open-tabs)

```json
[
  {"tab_id": "B47D909A…", "url": "https://example.org/", "title": "Example Domain", "is_main": true},
  {"tab_id": "5E9DAE98…", "url": "https://example.com/", "title": "Example Domain"}
]
```

```
actual keys : ['is_main', 'tab_id', 'title', 'url']
has is_main_tab : False
```

`is_main` is **only present on the main tab** (absent elsewhere), so `.get("is_main", False)` is the
correct read. It is also a **focus flag, not stable identity** — it migrates to whichever tab is
active.

**Likely origin of the docs error:** `is_main_tab` *does* exist — as a field on **`PageContext`**.
It appears to have been cross-wired into the tabs payload.

This one cost us: the docs convinced us Python was buggy and TypeScript was right. **The reverse was
true.**

### 4.2 `page_context` is `None` on desktop, silently — **LIVE**

**Page:** [guides/operate-a-computer#working-with-page-context](https://docs.lightcone.ai/guides/operate-a-computer/#working-with-page-context)

```
[browser] page_context=PageContext(title='Example Domain', url='https://example.com/', viewport 1280x720)
[desktop] status='SUCCESS' error=None page_context=None
```

Desktop returns `SUCCESS` with `error_message=None` and `page_context=None`. The docs never say
`page_context` is browser-only.

### 4.3 `tabs.switch` argument order contradicts itself — **ANALYSIS**

**Page:** [guides/browser-tabs](https://docs.lightcone.ai/guides/browser-tabs/)

- `#switch-between-tabs`: `switch("tab_abc123", id=computer.id)`
- `#example-compare-two-pages`: `switch(computer.id, first_tab_id)`

Reversed between two sections of the same page.

### 4.4 Task event stream typed as `string` — **SDK**

**Page:** [guides/tasks](https://docs.lightcone.ai/guides/tasks/)

```ts
export type TaskStartStreamResponse = string;
```

Every documented `event.type` is a TypeScript error. Python has the same `TypeAlias = str`.

### 4.5 The docs contradict themselves on event access — **SDK**

[guides/errors](https://docs.lightcone.ai/guides/errors/) writes `event.type`;
[guides/observability](https://docs.lightcone.ai/guides/observability/) writes `event.get("type")`.
Task streams yield **dicts**, so the errors page raises.

> **Careful — this does not generalize.** `response.output` yields **pydantic models, never dicts**.
> Guarding it with `isinstance(item, dict)` is dead code that silently skips. Task streams = dicts;
> response output = models.

### 4.6 Chat completions violates its own declared tool schema — **LIVE**

**Page:** [guides/coordinates#full-example](https://docs.lightcone.ai/guides/coordinates/#full-example)

Schema declares `x`/`y` as `"type":"integer"`, both `required`. Three consecutive samples:

```
{"x": "[555, 965]"}                 <- x is a str holding an array; y MISSING (required!)
{"x": "[553, 957]"}
{"x": "[556, 946]", "y": "[957]"}   <- both str arrays
```

No constrained decoding on function args. **The docs' own example (`args["x"]` → `scale_coordinates`)
dies with `KeyError: 'y'`.** The page cannot work as written.

### 4.7 `role: "system"` is rejected when tools are present — **LIVE**

**Page:** [guides/responses-api#system-instructions](https://docs.lightcone.ai/guides/responses-api/#system-instructions)

```
instructions=                       -> ACCEPTED (completed)
role=system WITHOUT tools           -> ACCEPTED (completed)
role=system WITH computer_use tool  -> 400 "System message must be at the beginning."
```

The system message **was** at index 0. The API appears to inject its own system prompt ahead of it
when `computer_use` is present, then rejects the caller's for not being first — an unsatisfiable
constraint with a misleading error.

### 4.8 `computer_use` is right; the TS types are incomplete — **LIVE**

**Page:** [guides/responses-api](https://docs.lightcone.ai/guides/responses-api/) (uses `computer_use` 25×)

```
docs say      computer_use         : ACCEPTED (status=completed)
SDK types say computer_use_preview : ACCEPTED (status=completed)
```

**The API accepts both. The docs are correct.** But `computer_use` appears **zero** times in the
TypeScript SDK — its Responses types are inherited from OpenAI's schema (the SDK's own comment links
to `platform.openai.com`) and only know `computer_use_preview`. So the documented name is a compile
error and `responses.create` needs an `as any` cast.

This single cause accounts for ~40 of the 48 type errors in this suite. **Do not "fix" code to match
these types.**

### 4.9 `shot.result.screenshot_url` — attribute access on a dict — **SDK**

**Pages:** [cookbook/wrap-a-legacy-app-in-an-api](https://docs.lightcone.ai/cookbook/wrap-a-legacy-app-in-an-api/),
[cookbook/verified-structured-extraction](https://docs.lightcone.ai/cookbook/verified-structured-extraction/)

`ActionResult.result` is `Optional[Dict[str, object]]`. The SDK's own `get_screenshot_url()` uses
`.get()`. The docs' attribute form raises.

### 4.10 `resp.output_text` doesn't exist — **SDK**

**Page:** [cookbook/verified-structured-extraction#the-ask_screen-helper](https://docs.lightcone.ai/cookbook/verified-structured-extraction/#the-ask_screen-helper)

`'output_text' in dir(ResponseCreateResponse)` → `False`. An OpenAI SDK convenience the docs
borrowed.

### 4.11 `status` casing differs by endpoint — **LIVE**

`create()` → `'ready'` (lowercase); `retrieve()` / `retrieve_status()` / `list()` → `'RUNNING'`
(uppercase). Different casing *and* different vocabulary for the same computer. See §1.1 Cause B.

---

## 5. Documentation gaps

### 5.1 Batch actions are never enumerated — **LIVE**

**Page:** [guides/computers#batch-actions](https://docs.lightcone.ai/guides/computers/#batch-actions)

The SDK accepts:

```
click|double_click|right_click|drag|type|keypress|scroll|wait|screenshot|go_to_url|debug|
get_html_content|set_viewport|list_tabs|new_tab|switch_tab|close_tab|key_down|key_up|
mouse_down|mouse_up
```

The docs show a four-action example and never list the rest. `go_to_url`, `set_viewport`,
`list_tabs`, `new_tab` appear **nowhere** on the page — yet `go_to_url` is the canonical example in
the SDK's *own* `ComputerSession.batch()` docstring. Verified live: `Executed: 3/3`, and a bogus
action type returns `status='error'`, so SUCCESS is meaningful.

The enum is a **JSDoc comment over `type?: string`** — neither SDK validates action types.

### 5.2 Only the TypeScript coordinate tab is broken — **LIVE** — ⚠ *corrected*

**Page:** [tutorials/scrape-behind-a-login](https://docs.lightcone.ai/tutorials/scrape-behind-a-login/)

> **This entry previously claimed a "four-way disagreement" where no two variants agreed.** Tested
> live, that was wrong.

For `quotes.toscrape.com/login` (ground truth ≈ (190,165)/(192,245)/(94,302)):

| Source | username | password | login | Result |
|---|---|---|---|---|
| Docs **python** tab | (191, 163) | (189, 247) | (93, 302) | **login OK** |
| Docs **typescript** tab | (580, 280) | (580, 330) | (580, 390) | **login FAILED** |
| docs-validation page | (189, 163) | (189, 246) | (93, 302) | **login OK** |
| This suite | (180, 165) | (180, 245) | (85, 305) | **login OK** |

Input fields absorb ~10px, so three of four work. **Only the TypeScript tab is genuinely wrong.**
There is no meaningful coordinate rot — which makes §0.1 sharper: the self-healing page exists to
cure a problem that barely exists, using a model that makes it worse.

### 5.3 Placeholder hosts don't resolve — **ANALYSIS**

`app.example.com`, `timesheets.example.com`
([guides/logins-and-sessions](https://docs.lightcone.ai/guides/logins-and-sessions/)) don't exist.
[integrations/playwright#example](https://docs.lightcone.ai/integrations/playwright/#example) targets
`example.com` with `input[name='search']`, which it doesn't have. And `example.com/pricing`
([guides/responses-api](https://docs.lightcone.ai/guides/responses-api/)) has no pricing — the model
confabulates `$0` rather than erroring.

### 5.4 Strategy A blocks on `input()` — **ANALYSIS**

**Page:** [guides/logins-and-sessions#strategy-a-persistent-sessions](https://docs.lightcone.ai/guides/logins-and-sessions/#strategy-a-persistent-sessions)

Unusable unattended. (The underlying recipe is sound — verified live: correct coordinates → login
SUCCESS → `environment_id` restore → AUTHENTICATED.)

### 5.5 The default model is undiscoverable — **LIVE**

`start_stream` without `model=` runs `tzafon.lightcone-1` (per the `started` event).
`models.list()` returns only `northstar-cua-fast-1.6`, `northstar-cua-fast`, `sm-1`. The default
isn't advertised anywhere.

### 5.6 The Playwright CDP recipe is over-complicated — **LIVE**

**Page:** [integrations/playwright#example](https://docs.lightcone.ai/integrations/playwright/#example)

The docs' `/json/version` → `webSocketDebuggerUrl` dance is unnecessary. All four combinations
return 200 and both `connect_over_cdp` forms connect:

| Auth on `session.endpoints["cdp"]` | `/json/version` | `connect_over_cdp` |
|---|---|---|
| `Authorization: Bearer` | 200 | connected |
| `?token=` query | 200 | connected |
| no auth | 401 | — |

### 5.7 `response_format` works and should be the recommendation — **LIVE**

**Page:** [cookbook/verified-structured-extraction](https://docs.lightcone.ai/cookbook/verified-structured-extraction/)

The schema path returns perfect output:

```
{"heading": "todos", "confidence": 0.95}
```

The **same page's** prompt-only technique — under an anchor literally called *"prompt for an exact
JSON shape"* — returned **1 of 6 required keys**. The schema path is the afterthought; it should be
the headline.

### 5.8 Install commands miss dependencies / name packages wrong — **ANALYSIS**

- [integrations/browser-use#install](https://docs.lightcone.ai/integrations/browser-use/#install):
  `pip install browser-use tzafon playwright`, but the example imports `langchain_openai`.
- [integrations/mastra#install](https://docs.lightcone.ai/integrations/mastra/#install): says
  `mastra`; the real package appears to be `@mastra/core`.

### 5.9 Integration API shapes look wrong — **ANALYSIS**

- [integrations/kernel](https://docs.lightcone.ai/integrations/kernel/): module-level
  `kernel.browsers.create(...)` with no client construction; `stealth_mode=` / `session.id` where the
  real SDK appears to use `stealth=` / `session.session_id`.
- [integrations/vercel-ai](https://docs.lightcone.ai/integrations/vercel-ai/): `tool({ parameters })`
  — AI SDK v5+ renamed this to `inputSchema`. The pinned `ai@^7.0.3` gives
  `No overload matches this call`.

### 5.10 Deprecated fields, no sunset date — **LIVE**

**Page:** [guides/computers#timeouts-and-keepalive](https://docs.lightcone.ai/guides/computers/#timeouts-and-keepalive)

`ComputerResponse` declares both generations side by side: `auto_kill`,
`inactivity_timeout_seconds` (deprecated) alongside `max_lifetime_seconds`, `idle_timeout_enabled`.
The [changelog](https://docs.lightcone.ai/guides/changelog/) promises Deprecation/Sunset headers
"indicating when support ends" but publishes no date.

---

## Summary

| Tier | Count | Character |
|---|---|---|
| **Critical** | 4 | Broken model; every stream crashes; two session destroyers |
| Silent wrong behaviour | 5 | Look like they work; don't |
| Missing surface | 8 | Documented, doesn't exist |
| Reliability | 6 | Hang, destroy state, or mislead retries |
| Wrong names/types | 11 | Crash or silently skip |
| Doc gaps | 10 | Incomplete, unrunnable, or misdirecting |

**Fix first:**

1. **§0.1** — the model the docs tell you to pin returns `x=0`. Everything coordinate-based is broken
   for anyone following the deprecation policy.
2. **§0.2** — every documented streaming example crashes at end-of-stream. One `sse.json()` guard.
3. **§0.3 / §0.4** — two documented endpoints destroy the session they're called on.
4. **§1.1** — a whole cookbook page is a silent no-op, for two independent reasons.

Reproductions for every **LIVE** finding are in this repo's git history. The suite (`make test`)
re-checks most of them and exits non-zero when they break — with the caveat that five examples
currently pass while testing nothing, which is a bug in *this* repo, not upstream.

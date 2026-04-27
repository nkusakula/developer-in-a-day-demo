# Demo Script — Developer-in-a-Day (Happy Path)
**Duration:** 30 minutes | **Audience:** Engineering leaders, platform teams, security teams, developers

---

## Overview

This script guides a live facilitated walkthrough of the complete DevSecOps lifecycle in a single repository. Every step maps to a real GitHub feature. No slides — everything happens live in the browser and IDE.

The story: a developer starts the day, makes a code change, and watches it travel automatically from IDE to production with compliance evidence captured at every step — zero manual handoffs.

---

## Pre-Demo Setup Checklist (15 minutes before)

- [ ] Fork or clone `https://github.com/nkusakula/developer-in-a-day-demo`
- [ ] Open the repo in VS Code with the **GitHub Copilot** extension installed and signed in
- [ ] Open `https://github.com/nkusakula/developer-in-a-day-demo` in a browser tab
- [ ] Open a second browser tab to **Actions** (pipeline view)
- [ ] Open a third browser tab to **Security** (code scanning alerts)
- [ ] Have a terminal ready: `cd developer-in-a-day-demo && npm install`
- [ ] Configure branch protection on `main` (Settings > Branches):
  - Require pull request before merging
  - Require status checks: `All CI Gates Passed`, `Validate PR Title`, `Dependency Audit`
  - Require review from CODEOWNERS
  - Require signed commits
- [ ] Configure Environments (Settings > Environments):
  - `development` — no protection rules
  - `staging` — no protection rules  
  - `production` — **Required reviewers:** add yourself
- [ ] Run `npm test` locally to confirm all tests pass

---

## Act 1 — Developer Starts in the IDE (5 minutes)

### 1.1 — Show the project structure (1 min)

**Say:** “The developer opens VS Code. GitHub Copilot is already in context because of the `.github/copilot-instructions.md` file — it knows the coding standards, branch naming conventions, and how to diagnose CI failures for this specific project.”

- Open `src/routes/api.js` — show the items endpoint
- Open `src/__tests__/api.test.js` — show corresponding tests
- Open `.github/copilot-instructions.md` — point out the AI context setup

**Talking point:** Copilot doesn’t just know the language — it knows *this* project’s standards and the exact commands to fix CI failures.

---

### 1.2 — Make a code change (2 min)

**Say:** “Let’s add a new endpoint. The developer asks Copilot to scaffold it.”

In VS Code Copilot Chat, type:
```
Add a GET /api/items/search endpoint that filters items by category query param.
Follow the project coding standards and add a corresponding unit test.
```

Copilot generates:
- The route handler in `src/routes/api.js` (validates query param, handles empty results)
- A test case in `src/__tests__/api.test.js`

**Show:** The generated code uses `'use strict'`, validates input, follows the existing pattern. Copilot is aware of the project conventions.

---

### 1.3 — Run tests locally (1 min)

```bash
npm test
```

All tests pass. Coverage stays above 80%.

**Talking point:** The developer never leaves the IDE. The feedback loop is seconds, not minutes.

---

### 1.4 — Commit and push (1 min)

```bash
git checkout -b feat/add-search-endpoint
git add .
git commit -S -m "feat(api): add category search endpoint"
git push origin feat/add-search-endpoint
```

**Point out:** `-S` flag — commit is signed. Branch protection on `main` means direct push is blocked. The developer must go through a pull request.

---

## Act 2 — Pull Request & SCM-Native Gates (8 minutes)

### 2.1 — Open the pull request (1 min)

Open `https://github.com/nkusakula/developer-in-a-day-demo` in the browser.

GitHub shows a banner: *“Recently pushed branch: feat/add-search-endpoint — Compare & pull request”*

Click **Compare & pull request**.

- **Title:** `feat(api): add category search endpoint` (Conventional Commits format)
- **Body:** auto-populated from `.github/PULL_REQUEST_TEMPLATE.md`
- Show the checklist: security checklist, testing checklist, deployment notes

Submit the PR.

**Talking point:** The PR template isn’t a bureaucratic form — it’s a runbook that guides the developer through what matters before merge.

---

### 2.2 — PR Checks fire immediately (2 min)

Switch to the **Checks** tab on the PR.

The `PR Checks — Convention & Audit` workflow fires first (fastest):

- **Validate PR Title:** Passes — `feat(api): add category search endpoint` matches Conventional Commits
- **Dependency Audit:** Passes — `npm audit` finds no high/critical vulnerabilities
- A bot comment appears on the PR: *“PR Gate Summary: PR Title — PASS | Dependency Audit — PASS”*

**Talking point:** These checks run in under 90 seconds. The developer gets feedback without waiting for the full CI.

---

### 2.3 — CODEOWNERS enforcement (1 min)

Scroll to the **Reviewers** section of the PR.

**Show:** GitHub has automatically requested a review from `@nkusakula` (CODEOWNERS rule for `/src/`). The PR **cannot merge** without this approval.

**Talking point:** Code ownership rules are version-controlled in `.github/CODEOWNERS`. No tribal knowledge, no Jira ticket to find the right person.

---

### 2.4 — Full CI pipeline runs (4 min)

Switch to the **Actions** tab — the `CI — Build, Test & Security Gates` workflow is running.

Walk through each job in real time:

**Job 1 — Static Analysis (ESLint)**
- Runs in ~45 seconds using npm dependency cache (point to `cache: npm` in the workflow)
- Passes: no lint errors, no security plugin warnings
- SARIF uploaded to Security > Code scanning

**Job 2 — CodeQL SAST**
- Runs in ~3 minutes (parallel with other jobs)
- Scans for injection, prototype pollution, ReDoS, path traversal
- Results appear in Security > Code scanning alerts
- Show the Security tab: *“No new alerts introduced by this PR”*

**Job 3 — License Validation**
- `license-checker` validates all transitive dependencies against the approved SPDX list
- License report uploaded as artifact (90-day retention)

**Job 4 — Unit Tests + Coverage Gate**
- Jest runs all tests; coverage must hit 80% lines/functions or the job fails
- JUnit XML + coverage HTML uploaded as artifacts
- Show the artifact list: *test-results-N*, *coverage-N*

**Job 5 — Container Build & Security Scan**
- Multi-stage Docker build using `node:20-alpine` (approved base image)
- Layer cache hit from GHA cache — *“12 layers cached, rebuild in 8 seconds instead of 45”*
- Image pushed to GHCR with OCI provenance + SBOM attached
- **Trivy** scans for CVEs (CRITICAL/HIGH), SARIF uploaded to Security dashboard
- **Grype** provides a second-opinion scan
- **SBOM (SPDX-JSON)** uploaded as artifact — 365-day retention
- **Sigstore cosign** signs the image with keyless OIDC — no long-lived secrets

**Job 6 — All CI Gates Passed**
- Final summary job: aggregates all gate results
- This is the required status check on `main` — the PR is now unblocked for merge

**Talking point:** Everything you just watched happens automatically on every PR. The developer didn’t configure any of this — it’s the platform.

---

### 2.5 — Demonstrate a gate failure + AI remediation (2 min)

*Optional but high-impact: do this if your audience includes skeptics.*

**Introduce a deliberate lint error:**
```bash
git checkout feat/add-search-endpoint
# Add an unused variable to src/routes/api.js:
# const unused = 'demo';
git commit -S -am "demo: introduce lint error"
git push
```

The CI workflow runs. **Job 1 (ESLint) fails.**

Switch back to VS Code. In Copilot Chat:
```
The ESLint gate failed on my PR. Here is the error:
  error  'unused' is defined but never used  no-unused-vars
How do I fix it?
```

Copilot explains the error and suggests the fix. The developer applies it without leaving VS Code.

```bash
git commit -S -am "fix(api): remove unused variable"
git push
```

CI re-runs. ESLint passes.

**Talking point:** The developer diagnosed and fixed a CI failure in under 2 minutes, never left the IDE, never filed a ticket.

---

## Act 3 — Merge & CI/CD Pipeline (8 minutes)

### 3.1 — Approve and merge the PR (1 min)

Approve the PR as the CODEOWNERS reviewer. All status checks are green.

Click **Merge pull request** — squash and merge.

**Show:** The merge button was locked until:
- All required status checks passed
- CODEOWNERS approval was obtained
- (Optionally) commit was signed

---

### 3.2 — CD pipeline fires automatically (2 min)

Switch to the **Actions** tab. The `CD — Deploy to Environments` workflow starts immediately, triggered by the CI workflow completing successfully on `main`.

**Show the workflow graph:** Three deployment stages are visible.

---

### 3.3 — Deploy to Development (1 min)

The `Deploy to Development` job runs with no approval required.

- **Runtime config injection:** `NODE_ENV=development`, `LOG_LEVEL=debug`, `APP_VERSION=sha-abc1234` — injected from GitHub Secrets at deploy time, never baked into the image
- Liveness probe smoke test passes
- Readiness probe smoke test passes

**Talking point:** The same image is deployed to every environment. Config changes are injected at runtime. No code change needed to promote.

---

### 3.4 — Promote to Staging (1 min)

Automatically, the `Deploy to Staging` job runs next.

- Config overridden: `NODE_ENV=staging`, `LOG_LEVEL=info`
- Integration test suite runs against the staging endpoint:
  - `GET /health` → 200 OK
  - `GET /api/items` → 200, items returned
  - `POST /api/items` → 201 Created
  - `GET /metrics` → Prometheus format
- All tests pass — stage advances

---

### 3.5 — Change record auto-created (1 min)

Switch to the **Issues** tab.

A new issue has been created automatically: **`[CHANGE] production deployment — sha-abc1234`**

Open the issue. Show the auto-populated table:
- Environment, change type, image tag, git SHA, pipeline run URL, requester, timestamp
- Compliance evidence table: every gate listed with its result
- Rollback plan pre-filled
- Labels: `change-record`, `automated`

**Talking point:** This is your change record. No ServiceNow form, no Jira ticket, no email. It was created by the pipeline at the moment it was needed, with all evidence pre-filled.

---

### 3.6 — Production approval gate (2 min)

Switch back to **Actions**. The `Deploy to Production` job is **waiting for approval**.

A yellow lock icon shows: *“Waiting for review — production environment requires approval”*

Click **Review deployments** > select `production` > **Approve and deploy**.

The job runs:
- Config: `NODE_ENV=production`, `LOG_LEVEL=warn`
- Production health validation: liveness, readiness, error rate, p99 latency
- Change record issue is **auto-commented** with deployment success details and **auto-closed**

**Talking point:** The approval gate is the only human touchpoint after the PR merge. Everything else — staging tests, change record creation, compliance evidence, deployment — is automated.

Switch back to the Issues tab. The change record issue is now closed with a `deployed` label and a success comment.

---

## Act 4 — Post-Deploy Observability & Compliance (5 minutes)

### 4.1 — Live metrics and health (2 min)

*If running the app locally via `docker compose up`:*

Open `http://localhost:3000/health`:
```json
{
  "status": "healthy",
  "version": "sha-abc1234",
  "environment": "production",
  "uptimeSeconds": 47,
  "timestamp": "2026-04-27T10:15:00.000Z"
}
```

Open `http://localhost:3000/metrics` — show Prometheus format:
- `api_requests_total` — request counter by method, route, status code
- `api_response_duration_seconds` — histogram with p50/p95/p99 buckets
- Default Node.js process metrics (heap, GC, event loop lag)

**Talking point:** The developer sees live metrics immediately after deployment. No separate monitoring setup required — it’s in the application from day one.

---

### 4.2 — Compliance artifacts (2 min)

Switch to the **Actions** tab. Click the completed CI run. Scroll to **Artifacts**.

Point to each artifact:

| Artifact | Purpose | Retention |
|---|---|---|
| `test-results-N` | JUnit XML — audit evidence | 90 days |
| `coverage-N` | HTML coverage report | 30 days |
| `license-report-N` | Dependency license inventory | 90 days |
| `sbom-N` | SPDX-JSON software bill of materials | 365 days |

Switch to **Security** tab. Show:
- **Code scanning alerts** — CodeQL + ESLint + Trivy results, all green
- **Secret scanning** — GitHub native, enabled by default
- **Dependabot alerts** — dependency vulnerabilities + automated PRs

**Talking point:** Every compliance artifact — test evidence, SBOM, vulnerability scan, license report — was captured automatically during the pipeline run. No manual collection, no spreadsheet.

---

### 4.3 — Nightly security posture (1 min)

Switch to **Actions** > **Scheduled Security Scan**.

**Say:** “At 02:00 UTC every night, Trivy re-scans the *current production image* against the latest CVE database. If a new vulnerability is published overnight, this scan catches it and uploads the SARIF to the Security dashboard — no code change required.”

Click **Run workflow** to trigger it manually as a demo.

---

## Act 5 — Summary & Key Talking Points (4 minutes)

### What just happened — end to end

| Step | GitHub Feature | Time |
|---|---|---|
| IDE assistance | GitHub Copilot + project instructions | On-demand |
| Branch protection | Settings > Branches | Enforced on push |
| CODEOWNERS review | `.github/CODEOWNERS` | Auto-assigned on PR |
| PR convention check | PR Checks workflow | ~90 seconds |
| Static analysis | ESLint + CodeQL (GHAS) | ~3 minutes |
| Secret scanning | GitHub Advanced Security | Continuous |
| License validation | `license-checker` in CI | ~2 minutes |
| Unit tests + coverage | Jest, 80% gate | ~2 minutes |
| Container build | Docker Buildx + layer cache | ~30 seconds |
| Container scan | Trivy + Grype + SBOM | ~3 minutes |
| Image signing | Sigstore cosign (keyless) | ~15 seconds |
| Deploy: development | CD workflow, auto | ~1 minute |
| Deploy: staging + tests | CD workflow, auto | ~2 minutes |
| Change record | GitHub Issues API, auto-created | ~10 seconds |
| Deploy: production | Manual approval gate | On-demand |
| Compliance close-out | Auto-comment + close issue | ~10 seconds |
| Nightly CVE re-scan | Scheduled workflow | 02:00 UTC |

**Total wall-clock time from `git push` to production: ~15 minutes, one manual approval.**

---

### The five proof points

**1. AI-native, not AI-bolted-on**
Copilot is in context from the start via `.github/copilot-instructions.md`. The developer asks a natural language question and gets a project-specific answer — including how to diagnose the failing gate.

**2. Security is not a gate at the end — it is the pipeline**
CodeQL, Trivy, Grype, Sigstore, secret scanning, license validation: all run on every PR. There is no “security review sprint”.

**3. Compliance is captured, not audited**
Every artifact (SBOM, test results, license report, scan SARIFs, change record) is created by the pipeline and retained automatically. An auditor can pull any run and see the full evidence chain.

**4. Config is never in the image**
The same container image runs in development, staging, and production. Environment configuration is injected at runtime from GitHub Secrets. Promotion is just changing the deployment target, not rebuilding.

**5. Zero manual handoffs**
The only human interactions are: write code, open PR, approve production deployment. Everything else — testing, scanning, signing, staging, change record creation, close-out — is automated.

---

## Troubleshooting During the Demo

### “The ESLint gate failed unexpectedly”
```bash
npm run lint   # See errors with file:line
# Ask Copilot: "ESLint failed with <error>. How do I fix it?"
```

### “Tests are failing”
```bash
npm test       # Full output + coverage
# Open coverage/lcov-report/index.html for line-by-line view
```

### “The PR title check failed”
Rename the PR title to `type(optional-scope): lowercase description` — e.g., `feat(api): add search endpoint`.

### “The production approval gate is not showing”
Check Settings > Environments > production — confirm Required reviewers is set.

### “The change record issue was not created”
Check the `create-change-record` job logs. The `issues: write` permission must be set on the workflow.

---

## Appendix — Extending the Demo

### Add a deliberate secret leak
Add `const API_KEY = 'ghp_abc123...'` to any source file and push. GitHub Advanced Security secret scanning will flag it within seconds, before the PR can merge.

### Simulate a Dependabot alert
Pin an old vulnerable version of `express` in `package.json`. Dependabot will open a PR automatically within the next scan cycle.

### Show SBOM content
Download `sbom-N.spdx.json` from the CI run artifacts. Open it to show every package, version, and license in the container image — the full software bill of materials.

### Show image signature verification
```bash
cosign verify ghcr.io/nkusakula/developer-in-a-day-demo:latest \
  --certificate-identity-regexp="https://github.com/nkusakula" \
  --certificate-oidc-issuer="https://token.actions.githubusercontent.com"
```
The signed image verification output proves the image was built by a specific GitHub Actions workflow run.

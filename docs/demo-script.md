# Demo Script — Developer-in-a-Day (Happy Path)
**Duration:** 30 minutes | **Audience:** Engineering leaders, platform teams, security teams, developers
**Platform:** GitHub (SCM, CI/CD, Security, Registry) + Azure (AKS deployment target, Azure Monitor, Azure App Configuration)

---

## Capability Indicator Legend

| Symbol | Meaning |
|--------|---------|
| 🟢 | **Native** — built into GitHub or Azure, zero configuration |
| 🔵 | **Out-of-box integration** — supported via a first-party action, app, or service with minimal setup |
| 🟡 | **Requires customization** — possible but needs workflow code, scripts, or additional tooling |
| 🔴 | **Roadmap / Not currently available** — not supported natively; third-party product required |

Every demo step below is annotated with its capability indicator.

---

## Demo Narrative (PDF Demo View 1 — sentence by sentence)

> *"A developer starts the day in the IDE, makes a change, pushes the code to GitHub, where branch protections, code ownership rules, commit signing checks, and pull-request validations are automatically applied."*
> → **Acts 1 and 2**

> *"The developer opens a pull request, which triggers SCM-native checks including static analysis, secret scanning, license validation, and required reviewer enforcement before merging."*
> → **Act 2**

> *"Once approved, the pull request triggers a standardized CI/CD pipeline that builds a containerized application using approved base images, accelerates execution through dependency caching, pulls dependencies and base images from the native artifact management tool, pushes signed artifacts back, and runs automated unit, integration, and security tests."*
> → **Acts 2 and 3**

> *"The pipeline enforces policy gates for security, image hardening, quality thresholds, and environment promotion before deploying using an approved deployment pattern."*
> → **Acts 2 and 4**

> *"Environment-specific configuration and secrets are injected dynamically at runtime without code changes, and the deployment automatically integrates with change management by creating and updating a standard change record."*
> → **Acts 4 and 5**

> *"Throughout the process, AI assistance embedded in the IDE helps the developer diagnose and remediate SCM check failures, build issues, test failures, policy gate violations, or deployment errors without leaving the development environment."*
> → **Acts 1, 2, 4, and 6**

> *"After deployment, the developer sees live metrics, logs, and deployment health, while compliance evidence is captured automatically and transparently across source control, pipeline execution, artifact promotion, and release — no manual handoffs required."*
> → **Acts 5 and 7**

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
  - Require signed commits 🟢
- [ ] Configure Environments (Settings > Environments):
  - `development` — no protection rules
  - `staging` — no protection rules
  - `production` — **Required reviewers:** add yourself 🟢
- [ ] Run `npm test` locally to confirm all tests pass
- [ ] *For deployment demo:* have an AKS cluster ready with `kubectl` context configured 🔵
- [ ] *For DORA metrics:* open GitHub Insights > Metrics in a browser tab (requires GitHub Enterprise Cloud) 🟢 (Enterprise only)

---

## Act 1 — Developer Starts in the IDE (5 minutes)

**Capability areas covered:** Pipeline orchestration (governance context), AI-enabled IDE

---

### 1.1 — Show the project structure and pipeline governance (2 min)

**Say:** "The developer opens VS Code. GitHub Copilot is already in context because of the `.github/copilot-instructions.md` file — it knows the coding standards, branch naming conventions, CI failure diagnosis commands, and policy rules for this specific project."

- Open `src/routes/api.js` — show the items endpoint
- Open `src/__tests__/api.test.js` — show corresponding tests
- Open `.github/copilot-instructions.md` — point out the AI context setup

**Then open `.github/workflows/ci.yml`.**

**Say:** "This is the standardized CI pipeline. It lives in the `.github/workflows/` directory and is version-controlled like application code. Teams cannot modify this without a pull request — the pipeline governance model is enforced through the same branch protection rules as the application code."

**Capability callouts:**
- 🟢 **Pipeline standardization via reusable workflows:** The `ci.yml` and `deploy.yml` are the governed templates. At GitHub Enterprise scale, platform teams publish these as [reusable workflows](https://docs.github.com/en/actions/using-workflows/reusing-workflows) in a central `.github` organization repo. Application teams call them with `uses: org/.github/.github/workflows/ci.yml@main` — they cannot modify the template, only pass permitted inputs.
- 🟢 **Closed for modification, open for configuration:** Reusable workflows enforce the pipeline shape. Teams pass configuration inputs (language, coverage threshold, image name) but cannot bypass jobs.
- 🟢 **Governance and guardrails:** Required status checks (`All CI Gates Passed`) on branch protection mean no merge without passing the governed pipeline.
- 🟡 **Approved extension points:** Teams can add jobs to their own workflow file but cannot remove or skip the required checks. Enforcing *which* jobs are required centrally at the org level requires GitHub Enterprise + custom rulesets.

**Talking point:** Copilot doesn't just know the language — it knows *this* project's standards and the exact commands to fix CI failures.

---

### 1.2 — Make a code change with Copilot assistance (2 min)

**Say:** "Let's add a new endpoint. The developer asks Copilot to scaffold it."

In VS Code Copilot Chat, type:
```
Add a GET /api/items/search endpoint that filters items by category query param.
Follow the project coding standards and add a corresponding unit test.
```

Copilot generates:
- The route handler in `src/routes/api.js` (validates query param, handles empty results)
- A test case in `src/__tests__/api.test.js`

**Show:** The generated code uses `'use strict'`, validates input, follows the existing pattern.

**Capability callout:** 🟢 **AI-native IDE integration** — Copilot reads `.github/copilot-instructions.md` automatically and applies project-specific context without any developer configuration.

---

### 1.3 — Run tests locally (1 min)

```bash
npm test
```

All tests pass. Coverage stays above 80%.

**Talking point:** The developer never leaves the IDE. The feedback loop is seconds, not minutes.

---

### 1.4 — Commit and push (signed) (1 min)

```bash
git checkout -b feat/add-search-endpoint
git add .
git commit -S -m "feat(api): add category search endpoint"
git push origin feat/add-search-endpoint
```

**Point out the `-S` flag** — commit is GPG-signed. Branch protection on `main` is configured to **require signed commits**.

**Capability callouts:**
- 🟢 **Branch protection:** GitHub natively enforces that direct pushes to `main` are blocked.
- 🟢 **Commit signing checks:** GitHub natively verifies GPG/SSH signatures and can block unsigned commits via branch protection > "Require signed commits".
- 🟢 **Code ownership rules:** `.github/CODEOWNERS` auto-assigns reviewers. Enforced natively without any CI configuration.

---

## Act 2 — Pull Request & SCM-Native Gates (8 minutes)

**Capability areas covered:** Pipeline orchestration, dependency caching, policy enforcement, test automation

---

### 2.1 — Open the pull request (1 min)

Open `https://github.com/nkusakula/developer-in-a-day-demo` in the browser.

GitHub shows a banner: *"Recently pushed branch: feat/add-search-endpoint — Compare & pull request"*

Click **Compare & pull request**.

- **Title:** `feat(api): add category search endpoint` (Conventional Commits format)
- **Body:** auto-populated from `.github/PULL_REQUEST_TEMPLATE.md`
- Show the checklist: security checklist, testing checklist, deployment notes

Submit the PR.

**Capability callout:** 🟢 **Pull-request validations** — PR template, CODEOWNERS auto-assignment, and required status checks are all GitHub-native. No external tooling required.

---

### 2.2 — PR Checks fire immediately (2 min)

Switch to the **Checks** tab on the PR.

The `PR Checks — Convention & Audit` workflow fires first (fastest):

- **Validate PR Title:** 🟢 Passes — `feat(api): add category search endpoint` matches Conventional Commits
- **Dependency Audit:** 🟢 Passes — `npm audit` finds no high/critical vulnerabilities
- A bot comment appears: *"PR Gate Summary: PR Title — PASS | Dependency Audit — PASS"*

**Policy scope callout:**
- 🟢 **Repository level:** These checks are defined in `pr-checks.yml` and enforced via branch protection on this specific repo.
- 🟡 **Organization/enterprise level:** To mandate these checks across *all* repos, use GitHub Enterprise org-level rulesets (Settings > Rules > Rulesets). A platform team can push a ruleset that requires `All CI Gates Passed` on every repo in the org.
- 🟢 **Policy outcomes — fail/block:** The `--max-warnings 0` flag causes ESLint to fail the job (block). `npm audit --audit-level=high` blocks on high/critical CVEs.
- 🟡 **Policy outcomes — warn only:** Configurable by removing `--max-warnings 0` or using `continue-on-error: true` in the workflow step.

---

### 2.3 — CODEOWNERS enforcement (1 min)

Scroll to the **Reviewers** section of the PR.

**Show:** GitHub has automatically requested a review from `@nkusakula` (CODEOWNERS rule for `/src/`). The PR **cannot merge** without this approval.

**Capability callout:** 🟢 **Required reviewer enforcement** — GitHub enforces CODEOWNERS natively. No bot or plugin needed. The rule is version-controlled in `.github/CODEOWNERS`.

---

### 2.4 — Full CI pipeline runs — all six gates (4 min)

Switch to the **Actions** tab — the `CI — Build, Test & Security Gates` workflow is running.

Walk through each job:

**Job 1 — Static Analysis (ESLint)** 🟢
- Runs in ~45 seconds
- Uses `cache: npm` in `actions/setup-node@v4` — **first-run** downloads and caches ~250 MB of node_modules; **subsequent runs** restore in ~4 seconds
- 🟢 **Dependency caching (package dependencies):** `actions/cache` / `setup-node cache:` key is `package-lock.json` hash. If `package-lock.json` changes (new dep added), cache is automatically invalidated and rebuilt.
- SARIF uploaded to Security > Code scanning

**Job 2 — CodeQL SAST** 🟢
- Runs in ~3 minutes (parallel with other jobs — 🟢 **native parallelization** via `needs:` graph)
- Scans for injection, prototype pollution, ReDoS, path traversal
- Results appear in Security > Code scanning alerts
- Show: *"No new alerts introduced by this PR"*

**Job 3 — License Validation** 🟡
- `license-checker` validates all transitive dependencies against the approved SPDX list
- 🟡 **Requires customization:** The approved license list is maintained in `package.json` (the `license-check` script). Platform teams must update this centrally and all repos must reference the same script version.
- License report uploaded as artifact (90-day retention)

**Job 4 — Unit Tests + Coverage Gate** 🟢
- Jest runs all tests; coverage must hit 80% lines/functions or the job fails
- 🟢 **Pipeline gating based on test outcomes:** Jest `--coverage --coverageThreshold` natively fails the process with exit code 1 if the threshold is not met.
- JUnit XML + coverage HTML uploaded as artifacts
- 🟡 **Test parallelization:** Jest runs single-threaded by default. For large test suites, use `jest --runInBand` disabled and `--maxWorkers=auto`, or split test files across matrix jobs.
- **Additional test capabilities:**
  - 🔴 **UI test automation (Playwright):** Not in this pipeline. Adding Playwright requires a `npx playwright test` step in a separate job with a browser-capable runner. This is a customization step, not native.
  - 🔴 **Load/performance testing:** Not native to GitHub Actions. Requires integrating k6, Artillery, or Azure Load Testing 🔵 as a step.
  - 🔵 **Smoke testing:** The staging deployment job runs `curl` health checks — a basic smoke test. A structured smoke test suite can be added as a workflow step.
  - 🔴 **Contract testing:** Not native. Requires Pact or similar tool as a custom step.

**Job 5 — Container Build & Security Scan**
- Multi-stage Docker build using `node:20-alpine` (approved base image)
- 🟢 **Dependency caching (container layers):** Docker layer cache is stored via `cache-from: type=gha` in the `docker/build-push-action`. Layers for unchanged `npm install` steps are restored from the GitHub Actions cache.
- 🟢 **Pulls from native artifact management (GHCR):** Base image `node:20-alpine` is pulled from Docker Hub; the built image is **pushed to GHCR** (`ghcr.io/nkusakula/developer-in-a-day-demo`) — GitHub's native OCI registry with OCI provenance + SBOM attached.
- 🔵 **Artifactory integration:** Not configured in this demo. To route through Artifactory, add a `docker login` step against your Artifactory URL using `secrets.ARTIFACTORY_TOKEN`. The same secret handling pattern works for any enterprise tool integration (NPM registry proxy, Maven, etc.).
- **Trivy** scans for CVEs (CRITICAL/HIGH), SARIF uploaded to Security dashboard — 🟢 native GHAS integration
- **Grype** provides a second-opinion scan — 🔵 open-source tool, runs as a step
- **SBOM (SPDX-JSON)** uploaded as artifact — 365-day retention — 🟢 via `anchore/sbom-action`
- **Sigstore cosign** signs the image with keyless OIDC — no long-lived secrets — 🔵 `sigstore/cosign-installer` action
- 🟢 **Approved base image enforcement:** Trivy's `--exit-code 1` on CRITICAL CVEs in the base image blocks the pipeline. To enforce a specific *list* of approved base images, add a 🟡 custom step that checks `FROM` in the Dockerfile against an allowlist.

**Job 6 — All CI Gates Passed** 🟢
- Required status check on `main` — the PR is now unblocked for merge

**Talking point:** Everything you just watched runs on every PR. The developer didn't configure any of this — it is the platform.

---

### 2.5 — Dependency caching: first-run vs cached (1 min — embedded in 2.4)

**Say:** "Let me show you the timing difference."

Navigate to **Actions** > pick two CI runs: the first run of the day and a second run.

| Run | `npm ci` step | Docker build step |
|-----|--------------|-------------------|
| First (cold cache) | ~45 seconds | ~45 seconds |
| Second (warm cache) | ~4 seconds | ~8 seconds |

**Zero-day cache invalidation:**
**Say:** "What happens if a zero-day is published in a dependency overnight?"

- 🟢 **Package dependency cache invalidation:** The cache key is `${{ hashFiles('**/package-lock.json') }}`. Running `npm audit fix` updates `package-lock.json`, changing the hash → cache is automatically invalidated on next push → fresh `npm install` from the registry.
- 🟡 **Selective cache purge:** Go to **Actions** > **Caches** > search for the key > **Delete**. This purges that specific cache entry without affecting other branches.
- 🟢 **Container layer cache invalidation:** A new base image tag in `Dockerfile` (`FROM node:20-alpine@sha256:…`) changes the layer hash → Docker build cannot reuse the cached layer → full rebuild.
- 🟡 **Centrally governed cache purge:** Requires a platform-level workflow (e.g., triggered by a security event) that calls the GitHub REST API `DELETE /repos/{owner}/{repo}/actions/caches` across all affected repos. This is custom but feasible.

---

### 2.6 — Gate failure + AI remediation in VS Code (2 min)

**Say:** "Let me show what happens when a gate fails — and how the developer never has to leave the IDE."

Introduce a deliberate lint error:
```bash
# Add an unused variable to src/routes/api.js:
# const unused = 'demo';
git commit -S -am "demo: introduce lint error"
git push
```

The CI workflow runs. **Job 1 (ESLint) fails.**

Switch back to VS Code. In Copilot Chat, paste the CI log error:
```
The ESLint gate failed on my PR. Here is the error:
  error  'unused' is assigned a value but never used  no-unused-vars
How do I fix it?
```

Copilot explains the error and applies the fix. The developer never opens a browser.

```bash
git commit -S -am "fix(api): remove unused variable"
git push
```

CI re-runs. ESLint passes.

**Capability callout:** 🟢 **AI-generated explanation and remediation** — Copilot reads the raw log, explains the failure in plain language, and generates the fix. The `.github/copilot-instructions.md` file pre-loads the exact ESLint commands so Copilot gives project-specific answers, not generic ones.

---

## Act 3 — Artifact Management (2 minutes)

**Capability areas covered:** Artifact management (GHCR), image signing, secrets management

---

### 3.1 — Show the signed image in GHCR (1 min)

Navigate to **github.com/nkusakula/developer-in-a-day-demo** > **Packages** tab.

**Show:**
- The built image `ghcr.io/nkusakula/developer-in-a-day-demo:sha-abc1234`
- OCI provenance attestation attached
- SPDX SBOM attached
- Sigstore cosign signature (keyless OIDC)

**Capability callouts:**
- 🟢 **Native artifact management (GHCR):** GitHub Container Registry is built into every GitHub org. No Artifactory licence required for the demo. Images, provenance, and SBOMs are stored together.
- 🔵 **Artifactory integration:** If your enterprise mandates Artifactory, replace `ghcr.io` with your Artifactory Docker registry URL in the workflow. Credentials are stored as `secrets.ARTIFACTORY_TOKEN` — the same pattern works for npm, Maven, pip, or any package type. One secret, one `docker login` step.
- 🟢 **Secrets management pattern:** All credentials (`GITHUB_TOKEN`, registry tokens, deployment keys) are stored in **GitHub Secrets** at org or repo level. They are injected as environment variables at runtime — never baked into the image, never in source code.
- 🟡 **Reusable secret pattern for other enterprise tools:** The same `secrets.MY_TOOL_TOKEN` pattern works for ServiceNow, Artifactory, SonarQube, Slack, etc. Platform teams can standardize secret names at the org level using org-level secrets so all repos share the same integration credentials automatically.

---

### 3.2 — Image promotion across environments (1 min)

**Say:** "We never rebuild the image. The same SHA-tagged image that passed every gate in CI is what gets deployed to development, staging, and production. Config changes, not rebuilds."

Open `deploy.yml`. Show `IMAGE_TAG: ${{ needs.resolve-image.outputs.image-tag }}` — the same tag flows through all three deployment stages.

**Capability callout:** 🟢 **Immutable artifact promotion** — The CD pipeline reads the image tag from the CI run output and uses it unchanged. There is no rebuild at any promotion stage.

---

## Act 4 — Merge & CD: Deploy to All Environments (8 minutes)

**Capability areas covered:** Deployment capabilities, dynamic config injection, ITSM change management

---

### 4.1 — Approve and merge the PR (1 min)

Approve the PR as the CODEOWNERS reviewer. All status checks are green.

Click **Merge pull request** — squash and merge.

**Show:** The merge button was locked until:
- All required status checks passed 🟢
- CODEOWNERS approval was obtained 🟢
- Commit was signed 🟢

---

### 4.2 — CD pipeline fires automatically (30 sec)

Switch to **Actions**. The `CD — Deploy to Environments` workflow starts immediately, triggered by `workflow_run` on CI success on `main`.

**Show the workflow graph:** `Development → Staging → Production` — three stages, each dependent on the previous.

**Capability callout:** 🟢 **Pipeline triggered by CI success** — `workflow_run` trigger is native. No webhook configuration or external orchestrator needed.

---

### 4.3 — Deploy to Development: runtime config injection (1 min)

The `Deploy to Development` job runs with no approval gate.

**Show the config injection step in `deploy.yml`:**
```yaml
- name: Inject runtime config
  run: |
    echo "NODE_ENV=${{ vars.NODE_ENV }}" >> .env
    echo "LOG_LEVEL=${{ vars.LOG_LEVEL }}" >> .env
    echo "APP_VERSION=${{ env.IMAGE_TAG }}" >> .env
```

**Capability callouts — Dynamic environment configuration (12-factor):**
- 🟢 **Push-based config injection at deploy time:** GitHub Secrets and Variables are injected as environment variables at the point the job runs. The image is never rebuilt.
- 🟢 **Secrets vs non-sensitive config handled separately:** `secrets.*` for sensitive values (tokens, keys) — masked in logs, never exported. `vars.*` for non-sensitive config (log level, feature flags) — visible in logs.
- 🟡 **Pull-based model (config changes without redeployment):** Not native to GitHub Actions. To support runtime config updates *without* a new deployment, integrate **Azure App Configuration** 🔵 — the app polls App Config at startup or on-demand. Changes to App Config values do not require a pipeline run or image rebuild.
- 🟢 **Same immutable artifact across all environments:** `IMAGE_TAG` is set once in `resolve-image` and passed via `needs` outputs to every deployment job. Development, staging, and production run the exact same image.
- 🟡 **Config hierarchy (app / environment / region / tenant):** GitHub Secrets support repo-level and org-level scopes. For hierarchical config (app > environment > region), use Azure App Configuration with labels 🔵 or a custom config resolution step 🟡 in the workflow.
- 🟡 **Configuration drift prevention:** Config values in GitHub Variables/Secrets can only be changed by users with repo admin rights. For stronger drift prevention, combine with branch protection on the workflow file itself and org-level secret scanning.
- 🔴 **No-restart config updates:** Not supported natively. Requires a config-as-a-service product (Azure App Configuration with feature flags, AWS Parameter Store, HashiCorp Vault dynamic secrets). These are 🔵 integrations.

---

### 4.4 — Deploy to Staging + integration smoke tests (1 min)

Automatically, `Deploy to Staging` runs next.

- Config overridden: `NODE_ENV=staging`, `LOG_LEVEL=info`
- Integration smoke test suite runs against the staging endpoint:
  - `GET /health` → 200 OK
  - `GET /api/items` → 200, items returned
  - `POST /api/items` → 201 Created
  - `GET /metrics` → Prometheus format

All pass. Pipeline advances to the production stage.

---

### 4.5 — Change record auto-created (1 min)

Switch to the **Issues** tab.

A new issue has been created automatically: **`[CHANGE] production deployment — sha-abc1234`**

Open the issue. Show:
- Environment, change type, image tag, git SHA, pipeline run URL, requester, timestamp
- Compliance evidence table: every gate with its result (PASS/FAIL)
- Rollback plan pre-filled
- Labels: `change-record`, `automated`

**Capability callouts:**
- 🟡 **ITSM integration (change record creation):** This demo uses a GitHub Issue as a lightweight change record, auto-created by the pipeline via the GitHub Issues API. It demonstrates the pattern.
- 🔴 **ServiceNow / enterprise ITSM native integration:** GitHub does not natively create ServiceNow change requests. This requires a 🟡 custom step using the ServiceNow REST API (`scripts/create-change-record.sh`) or a 🔵 GitHub App like the [ServiceNow DevOps integration](https://docs.servicenow.com/bundle/devops/page/product/devops/concept/devops-integration-github.html). The pattern (create on pipeline start, update on success/failure, close on completion) is the same.

**Talking point:** The change record was created by the pipeline at the moment it was needed, with all evidence pre-filled. No form, no ticket, no email.

---

### 4.6 — Production approval gate (1 min)

Switch back to **Actions**. The `Deploy to Production` job is **waiting for approval**.

A yellow lock icon: *"Waiting for review — production environment requires 1 reviewer"*

Click **Review deployments** > select `production` > **Approve and deploy**.

**Capability callout:** 🟢 **Environment protection rules / approval gate** — GitHub Environments with required reviewers is native. No external gate tool needed. The approval is logged with approver identity, timestamp, and pipeline run context — **audit evidence captured automatically**.

---

### 4.7 — Deployment patterns on Azure Kubernetes Service (2 min)

**Say:** "Let's look at how the application is deployed. The K8s manifests are in `k8s/`."

Open `k8s/deployment.yaml`. Show `strategy: type: RollingUpdate`.

**Capability callouts:**

**Rolling upgrade** 🟢 (Azure AKS native)
- `k8s/deployment.yaml` uses `RollingUpdate` with `maxUnavailable: 1, maxSurge: 1` by default.
- AKS rolls pods one at a time — zero downtime, zero configuration beyond the manifest.

**Blue-green deployment** 🟡 (requires customization on AKS)
- Not native to vanilla Kubernetes. Implement by maintaining two Deployments (`-blue`, `-green`) and switching the Service selector. The CD workflow updates the selector after health validation.
- 🔵 On **Azure Container Apps**, blue-green is a native first-class feature (traffic splitting between revisions) requiring no custom scripting.
- Alternatively, use **Azure Application Gateway** or **NGINX Ingress** with traffic-weight annotations 🟡.

**Feature flag-based release control** 🔴 (not native — requires integration)
- GitHub has no built-in feature flag service. Integrate with **Azure App Configuration + feature management** 🔵, LaunchDarkly, or Split.io. The pipeline can toggle flags via the App Configuration REST API as a deployment step.

**Rollback** 🟢 (AKS native)
```bash
kubectl rollout undo deployment/developer-in-a-day-demo
```
AKS stores rollout history. `kubectl rollout history` shows all revisions.

**Backout to a specific prior version** 🟢 (AKS + GHCR)
```bash
kubectl set image deployment/developer-in-a-day-demo app=ghcr.io/nkusakula/developer-in-a-day-demo:sha-abc0001
```
Every CI run produces a unique SHA-tagged image retained in GHCR. Any prior version is one command away.

---

### 4.8 — Post-deployment: change record closed (30 sec)

Switch back to **Issues**. The change record issue is now:
- Auto-commented with deployment success details (timestamp, approver, image tag) 🟡
- Auto-closed with label `deployed` 🟡

**Talking point:** This is the compliance close-out. The change record lifecycle — open, evidence collected, approved, deployed, closed — happened without a single manual action.

---

## Act 5 — Live Metrics, Logs, and Deployment Health (3 minutes)

**Capability areas covered:** Post-deploy observability, DORA metrics, compliance evidence

---

### 5.1 — Live metrics and health endpoints (1 min)

*Running via `docker compose up` locally or against the AKS endpoint:*

Open `/health`:
```json
{
  "status": "healthy",
  "version": "sha-abc1234",
  "environment": "production",
  "uptimeSeconds": 47,
  "timestamp": "2026-04-30T10:15:00.000Z"
}
```

Open `/metrics` — show Prometheus format:
- `api_requests_total` — counter by method, route, status code
- `api_response_duration_seconds` — histogram with p50/p95/p99 buckets

**Capability callout:** 🟡 **Live metrics** — custom Prometheus metrics are instrumented in `src/routes/api.js` using `prom-client`. For a production observability stack, scrape these metrics with **Azure Monitor managed Prometheus** 🔵 and visualize in **Azure Managed Grafana** 🔵 — both are AKS add-ons enabled with one `az aks enable-addons` command.

---

### 5.2 — Compliance artifacts from the CI run (1 min)

Switch to **Actions** > click the completed CI run > scroll to **Artifacts**.

| Artifact | Purpose | Retention | Capability |
|----------|---------|-----------|------------|
| `test-results-N` | JUnit XML — test execution evidence | 90 days | 🟢 |
| `coverage-N` | HTML line-by-line coverage report | 30 days | 🟢 |
| `license-report-N` | Dependency license inventory | 90 days | 🟡 |
| `sbom-N` | SPDX-JSON software bill of materials | 365 days | 🔵 |

Switch to **Security** tab. Show:
- **Code scanning alerts** — CodeQL + ESLint + Trivy SARIF, all green 🟢
- **Secret scanning** — GitHub native, enabled by default 🟢
- **Dependabot alerts** — dependency CVEs + automated fix PRs 🟢

**Capability callouts — Audit evidence:**
- 🟢 **Who approved what and when:** GitHub PR review history, Environment approval events, and deployment logs are immutable and accessible via the GitHub API indefinitely (subject to retention policy).
- 🟢 **Who deployed what and when:** Every `workflow_run` record captures the triggering actor, SHA, environment, and timestamp.
- 🟢 **What version was promoted to which environment:** The `IMAGE_TAG` output flows through the workflow graph and is recorded in deployment events on each GitHub Environment.
- 🟢 **Policy/test/security check evidence:** SARIF uploads, JUnit XML, and coverage reports are all attached to the run as artifacts with configurable retention.
- 🟡 **Immutable, exportable, long-term retention:** GitHub artifact retention is configurable (up to 90 days on free, custom on Enterprise). For immutable audit-grade retention, forward artifacts and audit log events to **Azure Blob Storage** (WORM/immutable storage) 🔵 via a workflow step or GitHub Audit Log streaming.
- 🟡 **Enterprise-level evidence surfacing:** Artifact data is per-repo by default. For cross-repo, enterprise-level compliance reporting, use **GitHub Advanced Security enterprise-level security overview** 🟢 (Enterprise Cloud) or export to an external SIEM/dashboard 🟡.

---

### 5.3 — DORA metrics (1 min)

Navigate to the GitHub organization > **Insights** > **Metrics**.

**Show (GitHub Enterprise Cloud):**
- **Deployment frequency** — deployments per day/week to production 🟢
- **Lead time for changes** — time from first commit to production deployment 🟢
- **Change failure rate** — deployments that required a rollback or hotfix 🟢
- **Mean time to restore** — time from incident open to service restored 🟡 (requires linking incidents to deployments)

**Capability callouts:**
- 🟢 **DORA metrics** are available natively in **GitHub Enterprise Cloud** under Organization Insights > DORA metrics. No external tool required.
- 🟡 **Team / application / environment-level views:** GitHub Insights shows org-wide and repo-level views. For team-level or environment-specific DORA slicing, use **Azure DevOps Analytics** 🔵 or a custom dashboard in **Azure Monitor Workbooks** 🟡.
- 🟡 **Pipeline execution trends, failure hotspots, stage duration analysis:** Not available natively in GitHub UI. Export workflow telemetry to **Azure Monitor** or a custom dashboard 🟡 using the GitHub REST API or webhook events.

---

## Act 6 — Scheduled and Event-Driven CI/CD (2 minutes)

**Capability areas covered:** Schedule-based CI/CD, event-driven CI/CD

---

### 6.1 — Scheduled CI/CD: nightly security scan (1 min)

Navigate to **Actions** > **Scheduled Security Scan**.

**Show the cron trigger in `scheduled-security.yml`:**
```yaml
on:
  schedule:
    - cron: '0 2 * * *'  # 02:00 UTC every night
```

**Say:** "At 02:00 UTC every night, Trivy re-scans the *current production image* against the latest CVE database. If a new vulnerability is published overnight, this scan catches it and uploads the SARIF to the Security dashboard — no code change required."

Click **Run workflow** to trigger it manually.

**Capability callouts:**
- 🟢 **Scheduled CI/CD:** GitHub Actions `schedule` trigger is native. Cron expressions support any recurring schedule.
- 🟢 **Recurring pipeline governance:** Scheduled workflows live in `.github/workflows/` like all other workflows — version-controlled, auditable, subject to the same branch protection rules.
- 🟡 **Approvals and exceptions for scheduled runs:** GitHub does not natively support "skip this scheduled run" without modifying the workflow. A 🟡 custom approach is to add a repo variable `SKIP_NIGHTLY_SCAN=true` that the workflow checks at the start of each run.
- 🟢 **Notifications:** Workflow failure notifications are sent natively to repository watchers and can be routed to Slack, Teams, or email via 🔵 integration steps.

---

### 6.2 — Event-driven CI/CD: zero-day security response (1 min)

**Say:** "Now let's simulate a zero-day: a critical CVE is published in a dependency we use."

**Show the pattern (manual trigger for demo):**
```bash
# Trigger a targeted re-scan + rebuild workflow via API
gh workflow run scheduled-security.yml
```

**Capability callouts:**
- 🟢 **Event-driven trigger via `workflow_dispatch`:** Any workflow can be triggered manually or via GitHub API (`repository_dispatch`). An external security feed (e.g., NVD webhook, Dependabot alert) can call the GitHub API to fire a response workflow.
- 🟢 **Dependabot as event source:** When a new CVE is published affecting a dependency, Dependabot natively opens a PR with the fix. This triggers the full CI pipeline automatically.
- 🟡 **Automated cache invalidation on zero-day:** A platform-level response workflow can: (1) call `DELETE /repos/{owner}/{repo}/actions/caches` to purge the npm cache, (2) trigger a rebuild, (3) push the patched image. This requires a custom workflow but is fully automatable.
- 🟡 **Policy updates in response to security event:** Updating CodeQL queries or Trivy severity thresholds in response to a zero-day requires a PR to the workflow files — subject to branch protection, which is the correct governance model.
- 🔴 **Automated multi-repo zero-day response at scale:** Triggering the same response workflow across hundreds of repos simultaneously is not natively supported. Requires a 🟡 custom orchestration script calling the GitHub API per-repo, or a GitHub App that fans out the event.

---

## Act 7 — AI IDE Integration Deep Dive (2 minutes)

**Capability areas covered:** AI-enabled IDE integration for pipeline issue resolution

---

### 7.1 — Navigate from failure notification to context in VS Code (30 sec)

**Say:** "A developer gets a notification that their PR failed. They don't open a browser."

In VS Code, the **GitHub Pull Requests and Issues** extension shows the failed check inline on the PR panel.

Click the failed check → VS Code opens the relevant file at the line flagged by ESLint or the test failure.

**Capability callouts:**
- 🔵 **Pipeline status surfaced in IDE:** The **GitHub Pull Requests and Issues** VS Code extension (official, Microsoft-published) shows PR status, check results, and review comments natively in the IDE.
- 🟢 **Failure notification:** GitHub sends email/push notifications on check failure. These are native.
- 🟡 **Navigation from notification to pipeline context in IDE:** Full log-in-IDE navigation requires the extension + Copilot Chat. There is no single click from a failure email directly into the IDE log view — the developer pastes the log into Copilot Chat.

---

### 7.2 — Build issue troubleshooting with Copilot (30 sec)

Paste a failed Docker build log into Copilot Chat:
```
My container build failed. Here is the error:
  npm ERR! code ENOTFOUND
  npm ERR! errno ENOTFOUND
  npm ERR! network request failed for https://registry.npmjs.org/express
How do I fix this?
```

Copilot identifies it as a network/DNS issue in the build runner, suggests checking `--network=host` or a registry mirror, and provides the exact `docker build` flag to use.

**Capability callouts:**
- 🟢 **AI-generated explanation in plain language:** Copilot Chat explains technical errors in conversational English.
- 🟢 **Remediation recommendations:** Copilot suggests specific code/config fixes grounded in the project's `.github/copilot-instructions.md`.
- 🔴 **Automatic log ingestion from CI into Copilot:** Copilot does not automatically pull CI logs. The developer must paste the relevant log section. A future native integration (GitHub Copilot for CI) would close this gap.

---

### 7.3 — Failed gate troubleshooting (30 sec)

Paste a CodeQL alert into Copilot Chat:
```
CodeQL flagged this in src/routes/api.js:
  "Prototype pollution: property 'constructor' of req.body is accessed without validation"
How do I fix this?
```

Copilot explains the prototype pollution risk, generates a safe fix using `Object.hasOwn()`, and links to the OWASP reference.

**Capability callout:** 🟢 **Security gate remediation** — Copilot has deep knowledge of OWASP Top 10 and can generate secure code patterns on demand. The project instructions in `.github/copilot-instructions.md` pre-load CodeQL common findings so Copilot gives project-specific answers.

---

### 7.4 — Deployment issue troubleshooting (30 sec)

Paste a failed `kubectl rollout` log:
```
The production deployment is stuck. Here is the AKS event:
  Warning  FailedCreate  ReplicaSet "app-xyz" failed to create pod: 
  container "app" is not allowed to run as root.
What should I do?
```

Copilot identifies the Pod Security Admission violation, explains the `runAsNonRoot: true` requirement, and generates the corrected `securityContext` block for `k8s/deployment.yaml`.

**Capability callouts:**
- 🟢 **Root cause analysis from logs:** Copilot can interpret Kubernetes event logs and suggest fixes.
- 🟢 **Generation of configuration fixes:** Copilot generates the corrected YAML block directly in the chat, which the developer applies with one paste.
- 🟡 **Rollback recommendation:** Copilot can suggest `kubectl rollout undo` but cannot trigger it autonomously. The developer runs the command.
- 🟡 **Access control and data handling:** Copilot Chat in VS Code transmits only what the developer pastes. No pipeline logs are sent automatically. Enterprise customers can configure **Copilot for Business / Enterprise** to route traffic through a private endpoint and apply content exclusion policies.
- 🟢 **Works in restricted enterprise environments:** GitHub Copilot Business/Enterprise supports IP allow-lists, SSO, and audit log forwarding. It does not require internet access to the source repo — only to the Copilot API endpoint.

---

## Act 8 — Summary & Talking Points (2 minutes)

### End-to-end timeline

| Step | Tool / Feature | Capability | Approx. Time |
|------|---------------|------------|-------------|
| Code change in IDE | VS Code + GitHub Copilot | 🟢 | On-demand |
| Branch protection / commit signing | GitHub branch protection | 🟢 | On push |
| CODEOWNERS auto-assignment | `.github/CODEOWNERS` | 🟢 | On PR open |
| PR convention + audit check | `pr-checks.yml` + Actions | 🟢 | ~90 sec |
| Static analysis (ESLint) | GitHub Actions + cache | 🟢 | ~45 sec |
| SAST (CodeQL) | GitHub Advanced Security | 🟢 | ~3 min |
| Secret scanning | GitHub Advanced Security | 🟢 | Continuous |
| License validation | `license-checker` in CI | 🟡 | ~1 min |
| Unit tests + 80% coverage gate | Jest in CI | 🟢 | ~1 min |
| Container build + layer cache | Docker Buildx + GHA cache | 🟢 | ~8 sec (warm) |
| Container CVE scan | Trivy + Grype | 🔵 | ~2 min |
| SBOM generation | `anchore/sbom-action` | 🔵 | ~30 sec |
| Image signing (keyless) | Sigstore cosign | 🔵 | ~15 sec |
| Image push to GHCR | GitHub Container Registry | 🟢 | ~30 sec |
| Deploy: development (auto) | CD workflow + AKS | 🔵 | ~1 min |
| Deploy: staging + smoke tests | CD workflow + AKS | 🔵 | ~2 min |
| Change record auto-created | GitHub Issues API | 🟡 | ~10 sec |
| Production approval gate | GitHub Environments | 🟢 | On-demand |
| Deploy: production (rolling) | AKS RollingUpdate | 🟢 | ~1 min |
| Compliance close-out | Auto-comment + close issue | 🟡 | ~10 sec |
| DORA metrics | GitHub Insights (Enterprise) | 🟢 | Live |
| Nightly CVE re-scan | Scheduled Actions workflow | 🟢 | 02:00 UTC |

**Total wall-clock time from `git push` to production: ~15 minutes, one manual approval.**

---

### Capability gaps and third-party requirements

| Capability from PDF | GitHub/Azure status | Recommended solution |
|---------------------|--------------------|--------------------|
| Artifactory integration | 🔵 GHCR is the native registry; Artifactory requires custom `docker login` step | Add Artifactory credentials as org-level GitHub Secrets |
| Pull-based config (no-restart updates) | 🔴 Not native to GitHub Actions | Azure App Configuration + feature flags |
| Blue-green deployment | 🟡 Custom on AKS; native on Azure Container Apps | Azure Container Apps revisions or custom K8s Service swap |
| Feature flag release control | 🔴 Not native | Azure App Configuration feature management or LaunchDarkly |
| ServiceNow ITSM change records | 🔴 Not native | ServiceNow DevOps GitHub App or custom REST API step |
| UI test automation (Playwright) | 🟡 Requires customization | Add `npx playwright test` job with browser runner |
| Load/performance testing | 🔵 Requires integration | Azure Load Testing in CI step |
| Contract testing | 🔴 Requires third party | Pact broker as a custom CI step |
| Enterprise DORA (all repos) | 🟢 GitHub Enterprise Cloud | GitHub Insights > Metrics |
| Multi-repo zero-day response | 🟡 Requires custom orchestration | Platform workflow calling GitHub API per-repo |
| Automatic log ingestion into Copilot | 🔴 Not yet available | Developer pastes log; future: GitHub Copilot for CI |

---

### The five proof points

**1. AI-native, not AI-bolted-on**
Copilot reads `.github/copilot-instructions.md` on every interaction. The developer gets project-specific answers — including exact commands to diagnose the failing gate — without leaving VS Code.

**2. Security is not a gate at the end — it is the pipeline**
CodeQL, Trivy, Grype, Sigstore, secret scanning, license validation, and Dependabot all run on every PR. There is no "security review sprint".

**3. Compliance is captured, not audited**
Every artifact — SBOM, test results, license report, scan SARIFs, change record, approval event — is created by the pipeline and retained automatically. An auditor pulls any run and sees the full evidence chain.

**4. Config is never in the image**
The same container image runs in development, staging, and production. Configuration is injected at runtime from GitHub Secrets. Promotion is a target change, not a rebuild.

**5. Zero manual handoffs**
The only human interactions are: write code, open PR, approve production deployment. Testing, scanning, signing, staging, change record creation, and close-out are all automated.

---

## Troubleshooting During the Demo

### "The ESLint gate failed unexpectedly"
```bash
npm run lint   # See errors with file:line
# Ask Copilot: "ESLint failed with <error>. How do I fix it?"
```

### "Tests are failing"
```bash
npm test       # Full output + coverage
# Open coverage/lcov-report/index.html for line-by-line view
```

### "The PR title check failed"
Rename the PR title to `type(optional-scope): lowercase description` — e.g., `feat(api): add search endpoint`.

### "The production approval gate is not showing"
Check Settings > Environments > production — confirm Required reviewers is set.

### "The change record issue was not created"
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

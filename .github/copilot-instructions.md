# GitHub Copilot — Project Instructions

This repository is a **Node.js/Express DevSecOps demo** showcasing an end-to-end
Developer-in-a-Day pipeline. Use these instructions to provide context-aware assistance.

## Code Standards
- Add `'use strict';` at the top of every `.js` file
- Follow ESLint rules in `.eslintrc.json` (extends `eslint:recommended` + `plugin:security`)
- Write Jest tests for every new route handler in `src/__tests__/`
- Minimum 80% line/function coverage enforced by CI gate
- Use `helmet()`, validate inputs, never commit secrets

## Naming Conventions
- Branch names: `type/short-description` (e.g., `feat/add-pagination`, `fix/health-timeout`)
- Commit messages: Conventional Commits — `type(scope): description`
- PR titles: same format, lowercase subject

## Diagnosing CI Failures

### Lint failure
```bash
npm run lint        # See all ESLint errors with locations
npm run lint:sarif  # Generate SARIF for Security dashboard
```
Common fixes: add `'use strict'`, remove unused variables, escape regex literals.

### Test / coverage failure
```bash
npm test            # Run tests + coverage report
# Open coverage/lcov-report/index.html for line-by-line coverage
```
Check `test-results/` for JUnit XML. Coverage threshold: 80% lines/functions, 70% branches.

### Trivy container scan finding
Update the base image tag in `Dockerfile` (`FROM node:20-alpine`) to the latest patch.
For dependency CVEs: `npm audit fix` or pin the fixed version in `package.json`.

### CodeQL SAST alert
Check the **Security** tab → **Code scanning alerts**. Common JS issues:
- Prototype pollution: avoid `obj[userInput]` — use `Object.hasOwn()`
- ReDoS: avoid complex regex on untrusted input
- Path traversal: validate and sanitize file paths

### License check failure
Run `npm run license-check` locally. Approved licenses:
`MIT, Apache-2.0, ISC, BSD-2-Clause, BSD-3-Clause, 0BSD, Unlicense, CC0-1.0, Python-2.0, CC-BY-3.0, CC-BY-4.0, LGPL-2.1+`.
For `LGPL-2.1+` packages: use `--excludePackages '<package>'` in the license-check script (do not add to `--onlyAllow` — the `+` breaks regex matching in license-checker).
For a non-approved license: find an alternative package or open an exception request.

### Deploy gate blocked
Check GitHub Environment protection rules: the environment requires manual approval.
Navigate to **Actions** → the blocked workflow → click **Review deployments**.

## Adding a New API Endpoint
1. Add route handler in `src/routes/api.js`
2. Add unit tests in `src/__tests__/api.test.js`
3. Update `docs/demo-guide.md` if the endpoint changes the demo flow
4. Open a PR with title: `feat(api): <description>`

## Environment Configuration
All environment-specific config is injected at runtime via GitHub Secrets / environment variables.
Never hardcode environment values — use `process.env.VARIABLE_NAME` with safe defaults.

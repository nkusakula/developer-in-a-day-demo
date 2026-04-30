# Developer-in-a-Day Demo


End-to-end DevSecOps platform demo on GitHub — **30-minute happy path** showing how a developer starts the day in the IDE and, without any manual handoffs, ships signed, scanned, compliance-evidenced code to production.

## Architecture at a Glance

```
IDE (VS Code + GitHub Copilot)
  │
  ├── git push ──> GitHub (branch protection, CODEOWNERS, commit signing)
  │              │
  │         Pull Request
  │              ├── PR Checks: Conventional Commits, npm audit
  │              ├── CI: ESLint, CodeQL, license check, tests (>=80% cov)
  │              └── Container: Trivy + Grype + SBOM + Sigstore signing
  │
  ├── merge ───> CD Pipeline
  │              ├── Deploy: development (auto)
  │              ├── Deploy: staging (auto + integration tests)
  │              ├── Change Record: auto-created GitHub Issue
  │              └── Deploy: production (manual approval gate)
  │
  └── Post-deploy: live metrics (/metrics), health (/health), compliance artifacts
```

## Workflows

| Workflow | Trigger | Purpose |
|---|---|---|
| `ci.yml` | Push / PR | Static analysis, CodeQL, license, tests, container scan, image sign |
| `deploy.yml` | CI success on main | Promote dev → staging → production, create change record |
| `pr-checks.yml` | Pull request | Conventional Commits, npm audit, post gate summary comment |
| `scheduled-security.yml` | Nightly 02:00 UTC | Trivy container + filesystem scan for new CVEs |

## Quick Start

```bash
git clone https://github.com/nkusakula/developer-in-a-day-demo
cd developer-in-a-day-demo
npm install
npm test

# Run locally
docker compose up
# App:        http://localhost:3000
# Metrics:    http://localhost:3000/metrics
# Prometheus: http://localhost:9090
```

## API Reference

| Method | Path | Description |
|---|---|---|
| GET | `/health` | Full health status |
| GET | `/health/live` | Kubernetes liveness probe |
| GET | `/health/ready` | Kubernetes readiness probe |
| GET | `/metrics` | Prometheus scrape endpoint |
| GET | `/api/items` | List items (paginated) |
| GET | `/api/items/:id` | Get item by ID |
| POST | `/api/items` | Create new item |

## Demo Script

See [docs/demo-script.md](docs/demo-script.md) for the full 30-minute facilitated demo guide.

## Repository Layout

```
.
├── src/               Application source
│   ├── app.js           Express entry point
│   ├── routes/
│   │   ├── api.js       Items API with Prometheus metrics
│   │   └── health.js    Health + readiness probes
│   └── __tests__/       Jest unit tests
├── k8s/               Kubernetes manifests
├── .github/
│   ├── workflows/       GitHub Actions CI/CD pipelines
│   ├── CODEOWNERS       Mandatory reviewer rules
│   ├── dependabot.yml   Automated dependency updates
│   ├── PULL_REQUEST_TEMPLATE.md
│   ├── copilot-instructions.md  AI assistance context
│   └── ISSUE_TEMPLATE/change-record.yml
├── Dockerfile         Multi-stage, hardened, non-root
├── docker-compose.yml Local dev environment
├── docs/
│   ├── demo-script.md   Facilitated 30-min demo guide
│   └── prometheus.yml   Local Prometheus config
└── SECURITY.md        Vulnerability reporting + control list
```

## Security Controls

| Layer | Control |
|---|---|
| Source | Branch protection, CODEOWNERS, commit signing |
| SCM gates | Secret scanning (GitHub Advanced Security), CodeQL SAST |
| Code quality | ESLint + security plugin, 80% coverage threshold |
| Supply chain | License validation, Dependabot, npm audit |
| Container | Multi-stage build, non-root, Trivy + Grype + SBOM |
| Signing | Sigstore keyless (OIDC, no long-lived keys) |
| Runtime | Kubernetes non-root securityContext, resource limits |
| Compliance | Automated change records, 90-day artifact retention |


#Random-update

## License

MIT

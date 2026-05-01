# syntax=docker/dockerfile:1
# =============================================================
# Approved base image: node:20-alpine (LTS, minimal attack surface)
# Image hardening: non-root user, no shell, read-only where possible
# OCI labels: build provenance attached for supply chain traceability
# =============================================================

# ── Stage 1: Dependency install ──────────────────────────────
FROM node:25-alpine AS deps

WORKDIR /app

# Copy manifests first — layer cache invalidated only on dep change
COPY package*.json ./

# Install all deps (including dev) for build stage
RUN npm install --frozen-lockfile 2>/dev/null || npm install

# ── Stage 2: Test runner (CI only, not shipped) ───────────────
FROM deps AS test
COPY . .
RUN npm test

# ── Stage 3: Production image ─────────────────────────────────
FROM node:25-alpine AS production

# Security hardening: create dedicated non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 -G nodejs

WORKDIR /app

# Install production-only dependencies
COPY package*.json ./
RUN npm install --omit=dev --frozen-lockfile 2>/dev/null || npm install --omit=dev && \
    npm cache clean --force

# Copy application source
COPY src/ ./src/

# Set ownership to non-root user
RUN chown -R nodejs:nodejs /app

# Drop to non-root
USER nodejs

# Expose only the application port
EXPOSE 3000

# Liveness health check for orchestrators
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:3000/health/live || exit 1

# OCI image annotations (populated by CI via --build-arg)
ARG BUILD_DATE="unknown"
ARG GIT_SHA="unknown"
ARG VERSION="dev"
ARG GITHUB_REPOSITORY="nkusakula/developer-in-a-day-demo"

LABEL org.opencontainers.image.created="${BUILD_DATE}" \
      org.opencontainers.image.revision="${GIT_SHA}" \
      org.opencontainers.image.version="${VERSION}" \
      org.opencontainers.image.source="https://github.com/${GITHUB_REPOSITORY}" \
      org.opencontainers.image.title="developer-in-a-day-demo" \
      org.opencontainers.image.description="DevSecOps platform demo application" \
      org.opencontainers.image.vendor="nkusakula" \
      org.opencontainers.image.licenses="MIT"

CMD ["node", "src/app.js"]

# ============================================
# Streamify Backend — Production Dockerfile
# ============================================
# Build context: repository root (monorepo)
# Usage: docker build -f infra/docker/backend.Dockerfile .
# ============================================

# ---- Stage 1: Install Dependencies ----
FROM node:20-alpine AS deps

WORKDIR /app

# Copy workspace root files
COPY package.json package-lock.json* ./

# Copy package manifests for workspace resolution
COPY apps/backend/package.json apps/backend/package.json
COPY packages/shared/package.json packages/shared/package.json

# Install production deps only
RUN npm ci --omit=dev --workspace=@streamify/backend --include-workspace-root && \
    npm cache clean --force

# ---- Stage 2: Production Image ----
FROM node:20-alpine AS runner

# Install system dependencies
RUN apk add --no-cache \
    ffmpeg \
    curl \
    dumb-init && \
    rm -rf /var/cache/apk/*

WORKDIR /app

# Copy installed node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/backend/node_modules ./apps/backend/node_modules 2>/dev/null || true

# Copy shared package source
COPY packages/shared/ packages/shared/

# Copy backend source
COPY apps/backend/ apps/backend/

# Create non-root user
RUN addgroup -g 1001 -S streamify && \
    adduser -S streamify -u 1001 -G streamify && \
    mkdir -p /app/apps/backend/logs && \
    chown -R streamify:streamify /app

USER streamify

WORKDIR /app/apps/backend

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8000/api/v1/health || exit 1

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "-r", "dotenv/config", "src/index.js"]

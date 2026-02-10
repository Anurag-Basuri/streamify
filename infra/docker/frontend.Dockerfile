# ============================================
# Streamify Frontend — Production Dockerfile
# ============================================
# Build context: repository root (monorepo)
# Usage: docker build -f infra/docker/frontend.Dockerfile .
# ============================================

# ---- Stage 1: Build ----
FROM node:25-alpine AS builder

WORKDIR /app

# Copy workspace root files
COPY package.json package-lock.json* ./

# Copy package manifests for workspace resolution
COPY apps/frontend/package.json apps/frontend/package.json
COPY packages/shared/package.json packages/shared/package.json

# Install all deps (including devDependencies for build)
RUN npm ci --workspace=@streamify/frontend --include-workspace-root && \
    npm cache clean --force

# Copy shared package source
COPY packages/shared/ packages/shared/

# Copy frontend source
COPY apps/frontend/ apps/frontend/

# Build
WORKDIR /app/apps/frontend
RUN npm run build

# ---- Stage 2: Serve with Nginx ----
FROM nginx:alpine AS runner

# Copy built assets
COPY --from=builder /app/apps/frontend/dist /usr/share/nginx/html

# Copy Nginx config
COPY infra/nginx/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
    CMD wget -qO /dev/null http://localhost/health || exit 1

CMD ["nginx", "-g", "daemon off;"]

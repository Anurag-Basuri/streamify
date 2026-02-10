# ============================================
# Streamify Backend — Production Dockerfile
# Multi-stage build for minimal image size
# ============================================

# Stage 1: Install production dependencies
FROM node:25-alpine AS deps

WORKDIR /app

# Copy package files for dependency caching
COPY package.json package-lock.json ./

# Install only production dependencies
RUN npm ci --only=production --ignore-scripts && \
    npm cache clean --force

# Stage 2: Production runner
FROM node:25-alpine AS runner

# Install system dependencies
#  - ffmpeg: video processing
#  - curl: health checks
#  - dumb-init: proper PID 1 signal handling
RUN apk add --no-cache ffmpeg curl dumb-init

# Security: run as non-root user
USER node

WORKDIR /app

# Copy production node_modules from deps stage
COPY --from=deps --chown=node:node /app/node_modules ./node_modules

# Copy application source
COPY --chown=node:node package.json ./
COPY --chown=node:node src ./src

# Create public directory (used for temp file uploads)
RUN mkdir -p public/temp

# Environment
ENV NODE_ENV=production
ENV PORT=8000

EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the server
CMD ["node", "src/index.js"]

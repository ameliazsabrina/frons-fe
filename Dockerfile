# Use Node.js 20 LTS for Next.js 15 compatibility
FROM node:20.18.0-bullseye-slim AS base

# Install system dependencies for native modules and web3 libraries
RUN apt-get update && apt-get install -y \
    curl \
    python3 \
    make \
    g++ \
    git \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files first for better Docker layer caching
COPY package*.json ./

# Set environment variables for proper build
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Install dependencies with optimizations for web3 and native modules
RUN echo "=== Installing dependencies ===" && \
    npm ci --only=production --prefer-offline --no-audit && \
    npm cache clean --force

# Build stage
FROM base AS builder

WORKDIR /app

# Copy package files and install all dependencies (including devDependencies for build)
COPY package*.json ./
RUN npm ci --prefer-offline --no-audit

# Copy source code and configuration files
COPY . .

# Copy environment files
COPY .env.production .env.production

# Debug build environment
RUN echo "=== Build Environment ===" && \
    node --version && \
    npm --version && \
    echo "NODE_ENV: $NODE_ENV" && \
    echo "=== Building Next.js application ===" && \
    ls -la

# Build the Next.js application
RUN npm run build

# Production stage
FROM base AS runner

WORKDIR /app

# Create non-root user for security
RUN groupadd -r nextjs && useradd -r -g nextjs nextjs

# Copy built application from builder stage
COPY --from=builder --chown=nextjs:nextjs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nextjs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nextjs /app/public ./public

# Copy environment files
COPY --from=builder --chown=nextjs:nextjs /app/.env.production ./.env.production

# Set proper permissions
RUN chown -R nextjs:nextjs /app
USER nextjs

# Expose port (Railway will set this via $PORT)
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

# Add health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:${PORT:-3000}/api/health || exit 1

# Start the application
CMD ["node", "server.js"]
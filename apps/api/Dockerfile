# syntax=docker/dockerfile:1
# Multi-stage build for the NestJS API within the pnpm/Turborepo monorepo.
# Build context is the repository root.

FROM node:22-alpine AS base
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable
WORKDIR /app

# --- Install dependencies (cached on lockfile) ---
FROM base AS deps
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json .npmrc ./
COPY apps/api/package.json apps/api/
COPY packages/types/package.json packages/types/
COPY packages/utils/package.json packages/utils/
COPY packages/database/package.json packages/database/
RUN pnpm install --frozen-lockfile

# --- Build ---
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm --filter @invincible/database db:generate \
  && pnpm --filter @invincible/types --filter @invincible/utils --filter @invincible/database build \
  && pnpm --filter @invincible/api build \
  && pnpm --filter @invincible/api --prod deploy /app/deploy

# --- Runtime ---
FROM node:22-alpine AS runner
ENV NODE_ENV=production
WORKDIR /app
RUN addgroup -S nodejs && adduser -S nestjs -G nodejs
COPY --from=build --chown=nestjs:nodejs /app/deploy ./
COPY --from=build --chown=nestjs:nodejs /app/packages/database/prisma ./packages/database/prisma
USER nestjs
EXPOSE 4000
CMD ["node", "dist/main.js"]

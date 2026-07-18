# syntax=docker/dockerfile:1
# Multi-stage build for the Next.js web app (standalone output).
# Build context is the repository root.

FROM node:22-alpine AS base
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable
WORKDIR /app

# --- Install dependencies ---
FROM base AS deps
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json .npmrc ./
COPY apps/web/package.json apps/web/
COPY packages/types/package.json packages/types/
COPY packages/utils/package.json packages/utils/
COPY packages/ui/package.json packages/ui/
COPY packages/sdk/package.json packages/sdk/
RUN pnpm install --frozen-lockfile

# --- Build ---
FROM base AS build
ARG NEXT_PUBLIC_API_URL=http://localhost:4000
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm --filter @invincible/types --filter @invincible/utils --filter @invincible/sdk build \
  && pnpm --filter @invincible/web build

# --- Runtime (standalone) ---
FROM node:22-alpine AS runner
ENV NODE_ENV=production
WORKDIR /app
RUN addgroup -S nodejs && adduser -S nextjs -G nodejs
COPY --from=build --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=build --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public
USER nextjs
EXPOSE 3000
ENV PORT=3000
CMD ["node", "apps/web/server.js"]

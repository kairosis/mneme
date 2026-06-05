FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@latest --activate

FROM base AS deps
WORKDIR /app
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json tsconfig.base.json ./
COPY packages/qdrant/package.json packages/qdrant/
COPY apps/server/package.json apps/server/
RUN pnpm install --frozen-lockfile

FROM base AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/qdrant/node_modules ./packages/qdrant/node_modules
COPY --from=deps /app/apps/server/node_modules ./apps/server/node_modules
COPY . .
RUN pnpm --filter @mneme/qdrant build
RUN pnpm --filter server build

FROM node:22-alpine AS runner
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json tsconfig.base.json ./
COPY packages/qdrant/package.json packages/qdrant/
COPY apps/server/package.json apps/server/
RUN pnpm install --frozen-lockfile --prod
COPY --from=build /app/packages/qdrant/dist ./packages/qdrant/dist
COPY --from=build /app/apps/server/dist ./apps/server/dist

EXPOSE 3000
CMD ["node", "apps/server/dist/main.js"]

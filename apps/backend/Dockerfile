# Step 1: Use the official Bun image
FROM node:20-slim AS base
RUN npm i -g bun@latest
WORKDIR /app

# Add lockfile and package.json's of isolated subworkspace
FROM base AS runner

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 trpc
USER trpc

COPY --chown=trpc:nodejs . .
RUN bun install --production --frozen-lockfile --no-save

EXPOSE 3001/tcp
WORKDIR /app/apps/backend
CMD ["bun", "run", "start"]
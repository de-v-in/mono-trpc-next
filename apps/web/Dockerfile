# Step 1: Use the official Bun image
FROM node:20-slim AS base
RUN npm i -g bun@latest
WORKDIR /app

# Add lockfile and package.json's of isolated subworkspace
FROM base AS installer
COPY . .
RUN bun install --production --frozen-lockfile --no-save
RUN bun turbo run build --filter=web

FROM base AS runner
WORKDIR /app

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=installer --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=installer --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=installer --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public

EXPOSE 3000/tcp

CMD ["node", "apps/web/server.js"]
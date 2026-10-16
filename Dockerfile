FROM node:22-bookworm-slim AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
ARG NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=
ENV NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=$NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
RUN npm install --global pnpm@11.25.0
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build
FROM node:22-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0
RUN groupadd --gid 10001 app && useradd --uid 10001 --gid app --no-create-home app
COPY --from=build --chown=app:app /app/.next/standalone ./
COPY --from=build --chown=app:app /app/.next/static ./.next/static
COPY --from=build --chown=app:app /app/public ./public
COPY --from=build --chown=app:app /app/scripts/preflight.mjs ./scripts/preflight.mjs
COPY --from=build --chown=app:app /app/scripts/database-readiness.mjs ./scripts/database-readiness.mjs
COPY --from=build --chown=app:app /app/scripts/push-worker.mjs ./scripts/push-worker.mjs
COPY --from=build --chown=app:app /app/scripts/push-fcm.mjs ./scripts/push-fcm.mjs
USER app
EXPOSE 3000
CMD ["sh","-c","node scripts/preflight.mjs && node scripts/database-readiness.mjs && exec node server.js"]

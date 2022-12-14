FROM node:16 AS build
WORKDIR /build
RUN corepack enable
ADD package.json pnpm-lock.yaml ./
RUN --mount=type=cache,target=/root/.local/share/pnpm/store/v3 pnpm i
ADD prisma ./
RUN pnpx prisma generate
ADD . .
RUN SVELTE_ADAPTER=docker pnpm build

FROM node:16-slim
ENV PORT=5173
USER node
COPY --from=build /build/build /app
WORKDIR /app
CMD node server.js

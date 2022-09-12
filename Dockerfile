# syntax=docker/dockerfile:1.4

FROM --platform=$BUILDPLATFORM node:18-alpine AS build
RUN corepack enable
WORKDIR /build
COPY package.json pnpm-lock.yaml ./
RUN pnpm install
COPY . .
RUN true \
 && pnpx prisma generate \
 && SK_ADAPTER=node pnpm build


FROM node:18-alpine AS prod-dep
RUN corepack enable
WORKDIR /build
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --production


FROM node:18-alpine
WORKDIR /app
COPY --link --from=prod-dep /build/node_modules ./
COPY --link package.json .
COPY --from=build /build/build ./
CMD ["node", "index.js"]

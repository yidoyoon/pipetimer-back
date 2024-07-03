FROM node:18-alpine as dev
WORKDIR /app
SHELL ["/bin/sh", "-c"]
ENV PNPM_HOME="/app" \
    PATH="$PNPM_HOME:$PATH"

COPY --chown=node:node ./backend ./
COPY --chown=node:node ./pnpm-lock.yaml ./

RUN corepack enable && pnpm --version && \
    pnpm i --prefer-frozen-lockfile --prod=false

FROM node:18-alpine as build
WORKDIR /app
SHELL ["/bin/sh", "-c"]
ENV PNPM_HOME="/app" \
    PATH="$PNPM_HOME:$PATH"

ARG NODE_ENV

RUN echo "Currently run build process in '$NODE_ENV'"

COPY --chown=node:node ./pnpm-lock.yaml ./
COPY --chown=node:node ./backend .
COPY --chown=node:node --from=dev /app/node_modules ./node_modules

RUN corepack enable && pnpm --version && \
    pnpm i -g @nestjs/cli && \
    NODE_ENV=$NODE_ENV nest build

FROM node:18-alpine As prod
WORKDIR /app
SHELL ["/bin/sh", "-c"]
ENV PNPM_HOME="/app" \
    PATH="$PNPM_HOME:$PATH"

ARG API_PORT_0

COPY --chown=node:node --from=build /app/node_modules ./node_modules
COPY --chown=node:node --from=build /app/dist ./dist

RUN corepack enable && pnpm --version && \
    pnpm i -g pm2

EXPOSE $API_PORT_0

CMD [ "pm2-runtime", "start", "dist/main.js" ]

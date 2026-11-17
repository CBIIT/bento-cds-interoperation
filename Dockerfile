FROM node:22-alpine AS deps
WORKDIR /usr/src/app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev \
  && npm cache clean --force

FROM node:22-alpine AS runner
ENV PORT=4030
ENV NODE_ENV=production
WORKDIR /usr/src/app

# Pull latest patched Alpine packages from the selected base image line.
RUN apk upgrade --no-cache \
  && rm -rf /var/cache/apk/*

COPY --from=deps --chown=node:node /usr/src/app/node_modules ./node_modules
COPY --chown=node:node . .

# Runtime container does not need npm or npx.
RUN rm -rf /usr/local/lib/node_modules/npm /usr/local/bin/npm /usr/local/bin/npx

USER node
EXPOSE 4030
CMD [ "node", "./bin/www" ]

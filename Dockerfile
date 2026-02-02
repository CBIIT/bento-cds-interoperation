FROM node:25.5.0-alpine3.22 AS fnl_base_image
ENV PORT 4030
ENV NODE_ENV production
WORKDIR /usr/src/app

# Upgrade OpenSSL to 3.5.5+ and remove gnupg (CVE-2026-24882 has no fix)
RUN apk update && \
    apk upgrade --no-cache libcrypto3 libssl3 && \
    apk del gnupg 2>/dev/null || true && \
    rm -rf /var/cache/apk/*

RUN npm install -g npm@11.7.0
RUN rm -rf /usr/local/lib/node_modules/npm/node_modules/cross-spawn
COPY package*.json ./
#RUN npm ci --only=production
RUN npm install --omit=dev \
  && npm cache clean --force \
  && rm -rf /usr/local/lib/node_modules/npm /usr/local/bin/npm /usr/local/bin/npx
COPY  --chown=node:node . .
EXPOSE 4030
CMD [ "node", "./bin/www" ]

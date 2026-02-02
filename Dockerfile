FROM node:25.3.0-bookworm-slim AS fnl_base_image
ENV PORT 4030
ENV NODE_ENV production
WORKDIR /usr/src/app

# Update system packages including OpenSSL
RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get install -y --no-install-recommends openssl && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

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

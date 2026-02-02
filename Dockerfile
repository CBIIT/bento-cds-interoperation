FROM node:25.3.0-alpine3.22 AS fnl_base_image
ENV PORT 4030
ENV NODE_ENV production
WORKDIR /usr/src/app
RUN apk update && apk upgrade --no-cache && \
    apk add --no-cache openssl>=3.5.5-r0
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

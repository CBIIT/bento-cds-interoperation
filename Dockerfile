#ARG ECR_REPO
#FROM ${ECR_REPO}/base-images:20.11.1

# Use most recent Alpine with Node.js and force OpenSSL update
FROM node:22-alpine3.20 as fnl_base_image

# Force update all packages including OpenSSL
RUN apk update && apk upgrade && \
    apk add --no-cache openssl=3.1.7-r0 || apk add --no-cache openssl && \
    apk cache clean

ENV PORT 4030
ENV NODE_ENV production
WORKDIR /usr/src/app
# Remove vulnerable cross-spawn
RUN rm -rf /usr/local/lib/node_modules/npm/node_modules/cross-spawn || true
COPY package*.json ./
#RUN npm ci --only=production
RUN npm install
COPY  --chown=node:node . .
EXPOSE 4030
CMD [ "node", "./bin/www" ]

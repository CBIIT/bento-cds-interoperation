#ARG ECR_REPO
#FROM ${ECR_REPO}/base-images:20.11.1
FROM node:24.10.0-alpine3.22 as fnl_base_image
ENV PORT 4030
ENV NODE_ENV production
WORKDIR /usr/src/app
RUN apk upgrade --no-cache busybox \
  && npm install -g npm@10.9.2 \
  && rm -rf /usr/local/lib/node_modules/npm/node_modules/cross-spawn
COPY package*.json ./
#RUN npm ci --only=production
RUN npm install --omit=dev \
  && npm cache clean --force \
  && rm -rf /usr/local/lib/node_modules/npm /usr/local/bin/npm /usr/local/bin/npx
COPY  --chown=node:node . .
EXPOSE 4030
CMD [ "node", "./bin/www" ]

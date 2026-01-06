#ARG ECR_REPO
#FROM ${ECR_REPO}/base-images:20.11.1
FROM node:22-alpine as fnl_base_image
ENV PORT 4030
ENV NODE_ENV production
WORKDIR /usr/src/app
RUN apk upgrade --no-cache openssl
RUN npm install -g npm@11.7.0
RUN rm -rf /usr/local/lib/node_modules/npm/node_modules/cross-spawn
COPY package*.json ./
#RUN npm ci --only=production
RUN npm install
COPY  --chown=node:node . .
EXPOSE 4030
CMD [ "node", "./bin/www" ]

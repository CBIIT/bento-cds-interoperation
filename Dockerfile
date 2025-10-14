#ARG ECR_REPO
#FROM ${ECR_REPO}/base-images:20.11.1
FROM node:22-bookworm-slim as fnl_base_image
ENV PORT 4030
ENV NODE_ENV production
WORKDIR /usr/src/app
# Remove vulnerable cross-spawn and update system packages for security
RUN apt-get update && apt-get upgrade -y && apt-get clean && rm -rf /var/lib/apt/lists/* && \
    rm -rf /usr/local/lib/node_modules/npm/node_modules/cross-spawn
COPY package*.json ./
#RUN npm ci --only=production
RUN npm install
COPY  --chown=node:node . .
EXPOSE 4030
CMD [ "node", "./bin/www" ]

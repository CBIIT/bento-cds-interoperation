#ARG ECR_REPO
#FROM ${ECR_REPO}/base-images:20.11.1
FROM node:18.20.5-alpine as fnl_base_image
ENV PORT 4030
ENV NODE_ENV production
WORKDIR /usr/src/app
COPY package*.json ./
#RUN npm ci --only=production
RUN npm install
COPY  --chown=node:node . .
EXPOSE 4030
CMD [ "node", "./bin/www" ]

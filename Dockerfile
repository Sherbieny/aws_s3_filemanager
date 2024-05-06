# Dockerfile
FROM node:latest

WORKDIR /usr/src/app

COPY ./app/package*.json ./

RUN npm install

COPY ./app .

CMD [ "node", "server/index.js" ]
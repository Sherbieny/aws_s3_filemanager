# Dockerfile
FROM node:latest

WORKDIR /usr/src/app

COPY ./app/package*.json ./

RUN npm install --only=development
RUN npm install -g nodemon

COPY ./app .

# Define environment variable
ENV NODE_ENV=development

# Run the app using nodemon
CMD ["nodemon", "-L", "server/index.js"]
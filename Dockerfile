FROM node:16.13.1-alpine

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install -g cross-env
RUN apk add g++ make py3-pip
RUN npm install
COPY . ./
EXPOSE 5000
CMD ["npm", "start"]
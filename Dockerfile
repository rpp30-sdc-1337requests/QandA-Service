FROM node:alpine

COPY . /qandaService

WORKDIR /qandaService

CMD node ./Server/dist/QAserver.js
FROM node:alpine

COPY . /qandaService

WORKDIR /qandaService

EXPOSE 8080

CMD node ./Server/dist/QAserver.js
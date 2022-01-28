# Question & Answer microservice for project Atelier

## Overview
This project is a Node server created with Typescript that queries a Postgres database I created with over 10 million questions, 
answers, and photos associated with the answer replies. The server was optimized through k6 testing, loader.io, client pooling, and 
a redis cache. Database query results were transformed with Postgres JSON aggregation methods. Both the database and and server were
deployed on AWS EC2 instances.

## Tools
* Typescript
* Node.js
* Postgres
* Docker
* Redis
* K6
* Loader.io
* Jest

<div align="center">
<img src="https://github.com/rpp30-sdc-1337requests/qandaService/tree/master/screenshots/loaderIO.png" width="400px"></img>
<img src="https://github.com/rpp30-sdc-1337requests/qandaService/tree/master/screenshots/k6testing" width="400px"></img>
</div>

## Reflections
This was one of the more challenging projects I ever worked on. There were times when I was knee deep in obscure Linux commands on my EC2 
ubuntu instance trying to map ports from my service to my database. Other days I was deep in the Postgres JSON aggregation methods
documentation trying to have Postgres do all of my query transformation. I was eventually successful with this and wasn't forced to do 
any server-side transforming of the database queries. I learned much about Postgres, containerizing with Docker, and performance and 
stress testing with k6 and loader.io.

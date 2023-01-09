# global-reverse-proxy
Building a global reverse proxy with on-demand SSL support on AWS.

## Prerequisites
You need to have a recent (>=3.1.2) version of the [Serverless Framework](https://goserverless.com) installed globally on your machine.

If you haven't, you can run `npm i -g serverless`.
## Deployment
The infrastructure consists of three different stacks:

* A stack for the domain whitelisting service, and the certificate table in DynamoDB
* A stack for the proxy server(s) itself, which can be deployed multiple times if you want high (global) availability and fast latencies
* A stack for the GlobalAccelerator, and the according DNS records

### Deployment order
You need to follow a specific deployment order to be able to run the overall service:

1. Domain whitelisting service: `cd domain-service-stack && sls deploy && cd ..`
2. Proxy server(s): `cd prosy-server-stack && sls deploy && cd ..`
3. GlobalAccelerator: `cd accelerator-stack && sls deploy && cd ..`


# global-reverse-proxy
Building a global reverse proxy with on-demand SSL support on AWS.

## Architecture overview
![Architecture](images/architecture.png)

## Prerequisites

### Serverless Framework
You need to have a recent (>=3.1.2) version of the [Serverless Framework](https://goserverless.com) installed globally on your machine.

If you haven't, you can run `npm i -g serverless`.

### Valid AWS credentials
The Serverless Framework relies on already configured AWS credentials. Please refer to the [docs](https://www.serverless.com/framework/docs/providers/aws/guide/credentials/) to learn how to set them up on your local machine.

### EC2 key already configured
If you want to interact with the deployed EC2 instance(s), you need to add your existing public SSH key, or create a new one. Please have a look at the [AWS docs](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/create-key-pairs.html#how-to-generate-your-own-key-and-import-it-to-aws) to learn how you can do that.

Pleas also note the name you have given to the newly created key, as you will have to update the [configuration of the proxy server(s) stack](proxy-server-stack/serverless.yml#L15).

## Other configurations

### Stack configurations
Please configure the following values for the different stacks:
* The target domain name where you want your reverse proxy to send the requests to ([targetDomainName](proxy-server-stack/serverless.yml#L7))
* The email address to use for automatic certificate generation via LetsEncrypt ([letsEncryptEmailAddress](proxy-server-stack/serverless.yml#L8))
* The domain name of the proxy service itself, which is then used by GlobalAccelerator ([domain](accelerator-stack/serverless.yml#L6))
* Optionally: The current IP address which you want to use the EC2 instance(s) via SSH from ([sshClientIPAddress](proxy-server-stack/serverless.yml#L18)). If you want to use SSH, you'll need to uncomment the respective [SecurityGroup settings](proxy-server-stack/resources/ec2.yml#L56-L59)

### Whitelisted domain configuration
You need to make sure that not everyone can use your reverse proxy with every domain. Therefore, you need to configure the whitelist of domains that you be used by Caddy's [on-demand TLS feature](https://caddyserver.com/docs/automatic-https#on-demand-tls).

This is done with the Domain Verifier Lambda function, which is deployed at a Function URL endpoint.

The configuration can be changed [here](domain-service-stack/src/domainVerifier.js#L3-L6) before deploying the service.

**HINT**: To use this dynamically, as you'd probably wish in a production setting, you could rewrite the Lambda function to read the custom domains from a DynamoDB table, and have another Lambda function run recurrently to issue DNS checks for the CNAME entries the customers would need to make (see below).

### DNS / Nameserver configurations
If you use an external domain provider, such as Namecheap or GoDaddy, make such that you point the DNS settings at your domain's configuration to those which are assigned to your HostedZone by Amazon. You can look these up in the AWS Console or via the AWS CLI.

### CNAME configuration for proxying
You also need to add CNAME records to the domains you want to proxy for, e.g. if your proxy service domain is `external.mygreatproxyservice.com`, you need to add a CNAME record to your existing domain (e.g. `test.myexistingdomain.com`) to redirect to the proxy service domain:

```bash
CNAME test.myexistingdomain.com external.mygreatproxyservice.com
```

### Passing options during deployment
When running `sls deploy` for each stack, you can specify the following options to customize the deployments:
* `--stage`: This will configure the so-called stage, which is part of the stack name (default: `prd`)
* `--region`: This will configure the AWS region where the stack is deployed to (default: `us-east-1`)

## Deployment
The infrastructure consists of three different stacks:

* A stack for the domain whitelisting service, and the certificate table in DynamoDB
* A stack for the proxy server(s) itself, which can be deployed multiple times if you want high (global) availability and fast latencies
* A stack for the GlobalAccelerator, and the according DNS records

### Deployment order
You need to follow a specific deployment order to be able to run the overall service:

1. Domain whitelisting service: `cd domain-service-stack && sls deploy && cd ..`
2. Proxy server(s): `cd proxy-server-stack && sls deploy && cd ..`
3. GlobalAccelerator: `cd accelerator-stack && sls deploy && cd ..`

## Costs
The deployment and usage of the infrastructure is not for free, although some costs should be covered by the AWS Free Tier (but this depends on what you already run in your AWS account). The GlobalAccelerator will definitely incur costs, as well as the network traffic going out. The EC2 instance(s) will also generate costs for your account.

Please make yourself comfortable with the AWS pricing. Use these stacks at your own risk, and review the generated IaC as careful as possible.

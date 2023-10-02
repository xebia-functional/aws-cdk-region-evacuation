# Guide to deploy this infrastructure on AWS

## Requirements
- AWS account credentials
  - Install AWS CLI https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html
  - Get credentials https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html
- NodeJS installation https://nodejs.org/en/download/

## Configuration Step

aws configure list-profiles
aws configure list
aws sts get-caller-identity

[config file](./config/environment.ts) we will need to update this DNS_ZONE_NAME variables with the values that we want to use.

```javascript
export const AppConfig = {
  VPC_NAME: 'fargate-test',
  CLUSTER_NAME: 'fargate-test',
  APP_NAME: 'app-region-evacuation',
  DNS_ZONE_NAME: 'subdomain-2.subdomain-1.cloudns.ph',
  INTERNAL_DNS: 'edge'
};
```

## Building Step

These are the following steps to build the project:
* Install javascript dependencies
* AWS CDK Synth the project
```bash
npm install -dd
npm run build -dd
npx cdk context --clear
npx cdk synth --debug -vv
```

## Deployment Steps

### Setting up the environment
These are the following stacks that will be deployed:
```bash
npx cdk bootstrap --debug -vv
npx cdk list --debug -vv
```
```
stage-1/app-region-evacuation-basic-infrastructure-us-east-1
stage-2/app-region-evacuation-service-us-east-1
```

### Deployment First Stage
> **Note** **This should be deployed in a separated CDK application, because it will have a different deployment pace. It may be deployed only once or just a few times**, but for simplicity we will keep it here.

This command will deploy the basic infrastructure in one region(us-east-1).
```bash
npx cdk deploy stage-1/* --debug -vv
```
* Creates a VPC that spans a whole region. It will automatically divide the provided VPC CIDR range, and create public and private subnets per Availability Zone. Network routing for the public subnets will be configured to allow outbound access directly via an Internet Gateway. Network routing for the private subnets will be configured to allow outbound access via a set of resilient NAT Gateways (one per AZ).
* Fargate cluster
* Route53 DNS public zone
> :warning: **Manual Step:** To establish a chain of trust for DNSSEC, you must update the parent zone for your hosted zone with the DNSSEC information. The updates that you make depend on if you use Route 53 or another registrar.


### Deployment Second Stage
> **Note** **This should be deployed in a separated CDK application, because it will have a different deployment pace. The microservice will need to be deployed regularly**, but for simplicity we will keep it here.

After creating basic infrastructure in the previous step we need to recreate the file cdk.context.json

```bash
npx cdk context --clear --debug -vv
npx cdk context --clear --debug -vv
npx cdk synth --debug -vv
```

This command will deploy the dummy-server and is related infrastructure in three different regions(us-east-1, us-east-2, us-west-2):
```bash
cdk deploy stage-2/* --debug -vv
```
* Creates a public certificate in ACM:
> **Warning** **Manual Step:** You must update the parent zone with a DNS record CNAME provided by AWS, so that AWS can confirm that you're the owner of the domain.
* Creates Application Load Balancer with the previously created certificate
* Creates Route53 DNS records
* Deploys dummy server in Fargate


## Validations Steps

You can use the following online resources to confirm that your public endpoint is avilable and the certificate is valid.
* https://dnschecker.org/#A/edge-us-east-1.subdomain-2.subdomain-1.cloudns.ph
* https://www.sslshopper.com/ssl-checker.html#hostname=https://edge-us-east-1.subdomain-2.subdomain-1.cloudns.ph/


## Remove All resources from your AWS account

https://us-east-1.console.aws.amazon.com/cloudformation/home?region=us-east-1


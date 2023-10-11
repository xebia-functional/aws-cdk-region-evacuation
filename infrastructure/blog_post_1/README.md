# Guide to deploy this infrastructure on AWS

## Step 0 - Install dependencies
- AWS account credentials
  - Install AWS CLI https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html
  - Get AWS credentials https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html
- NodeJS installation https://nodejs.org/en/download/

## Step 1 - Confirm AWS credentials
Confirm AWS credentials are working by running the following commands:
```
aws configure list-profiles
aws configure list
aws sts get-caller-identity
```

## Step 2 - Configuration
> **Warning** Update the following domains with your value.

In [ClouDNS](https://www.cloudns.net) set up the following:
* Create a free DNS Hosted Zone (Example case: subdomain-**xx**.cloudns.ph)

In this GitHub repository, update the [configuration file](./config/environment.ts) with the values that you want to use.
* DNS_ZONE_NAME: "_subdomain-**yy**.subdomain-**xx**.cloudns.ph_"

```javascript
export const AppConfig = {
  VPC_NAME: 'fargate-test',
  CLUSTER_NAME: 'fargate-test',
  APP_NAME: 'app-region-evacuation',
  DNS_ZONE_NAME: 'subdomain-2.subdomain-1.cloudns.ph',
  INTERNAL_DNS: 'edge'
};
```

## Step 3 - Build
These are the following steps to build the project:
* Install javascript dependencies
```bash
npm install -dd
npm run build -dd
```
* AWS CDK Synth the project
```bash
npx cdk context --clear
npx cdk synth --debug -vv
```

## Step 4 - Setting up AWS CloudFormation
It sets up the necessary AWS resources and configurations required to deploy your CDK stack
```bash
npx cdk bootstrap --debug -vv --region us-east-1
```

## Step 5 - Deploy First CDK Stack
> **Note** **This should be deployed in a separated CDK application, because it will have a different deployment pace. It may be deployed only once or just a few times**, but for simplicity we will keep it here.

This command will deploy the basic infrastructure in one region(us-east-1):
* Creates a VPC that spans a whole region. It will automatically divide the provided VPC CIDR range, and create public and private subnets per Availability Zone. Network routing for the public subnets will be configured to allow outbound access directly via an Internet Gateway. Network routing for the private subnets will be configured to allow outbound access via a set of resilient NAT Gateways (one per AZ).
* Fargate cluster
* Route53 DNS public zone

```bash
npx cdk deploy stage-1/* --debug -vv --require-approval never
```

## Step 6 - Configure ClouDNS with the NS records from AWS route53
Go to [AWS Route 53](https://us-east-1.console.aws.amazon.com/route53/v2/hostedzones?region=us-east-1#) the hosted zone created in the previous step.
Copy the NS records related to the authoritative DNS servers.
* Example values:
```
ns-231.awsdns-28.com.
ns-1965.awsdns-53.co.uk.
ns-1055.awsdns-03.org.
ns-724.awsdns-26.net.
```

Go to your account in [ClouDNS](https://www.cloudns.net/) and open your free DNS zone (For our example was subdomain-**xx**.cloudns.ph).
Add four NS records one for each authoritative DNS servers.
* Type: NS record
* Host: subdomain-yyy.subdomain-xxx.cloudns.ph
* Points to: ns-231.awsdns-28.com


## Step 7 - Update CDK Context with the new resources
After creating basic infrastructure in the previous step we need to recreate the file cdk.context.json
```bash
npx cdk context --clear --debug -vv
npx cdk synth --debug -vv
```

## Step 8 - Deploy Second CDK Stack
> **Note** **This should be deployed in a separated CDK application, because it will have a different deployment pace. The microservice will need to be deployed regularly**, but for simplicity we will keep it here.

In this step, we will deploy the dummy-server and is related infrastructure in (us-east-1):
* Creates a public certificate in ACM. 
> **Warning** So that AWS can confirm that you're the owner of the domain, Step 6 needs to be working.
* Creates Application Load Balancer with the previously created certificate
* Creates Route53 DNS records
* Deploys dummy server in Fargate

```bash
cdk deploy stage-2/* --debug -vv --require-approval never
```



## Validations Steps
You can use the following online resources to confirm that your public endpoint is available and the certificate is valid.
> **Warning** Update the following domains with your value.
* https://dnschecker.org/#A/edge-us-east-1.subdomain-2.subdomain-1.cloudns.ph
* https://www.sslshopper.com/ssl-checker.html#hostname=https://edge-us-east-1.subdomain-2.subdomain-1.cloudns.ph/


## Remove all resources from your AWS account

https://us-east-1.console.aws.amazon.com/cloudformation/home?region=us-east-1


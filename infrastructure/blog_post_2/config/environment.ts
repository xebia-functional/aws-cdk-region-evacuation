// Shared values that are the same across all environments
export const AppConfig = {
  VPC_NAME: 'fargate-test',
  CLUSTER_NAME: 'fargate-test',
  APP_NAME: 'app-region-evacuation',
  DNS_ZONE_NAME: 'subdomain-2.subdomain-1.cloudns.ph',
  INTERNAL_DNS: 'web-container',
  DOCKER_IMAGE: 'jaimenavarro/aws-cdk-region-evacuation'
};

export const TargetRegions = ['us-east-1'];

export const PRIMARY_REGION = 'us-east-1';

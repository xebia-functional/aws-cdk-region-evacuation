// Shared values that are the same across all environments
export const AppConfig = {
  VPC_NAME: 'fargate-test',
  CLUSTER_NAME: 'fargate-test',
  APP_NAME: 'app-region-evacuation',
  DNS_ZONE_NAME: 'subdomain-2.subdomain-1.cloudns.ph',
  INTERNAL_DNS: 'edge',
  DOCKER_IMAGE: 'jaimenavarro/aws-cdk-region-evacuation',
};

export const TargetRegions = ['us-east-1'];

export const PRIMARY_REGION = 'us-east-1';

export const TAG_RESOURCES_USED_BY_ROUTE53_ARC_READINESS = {
  key: 'route53-arc',
  value: 'resource-used-by-route53-arc'
};


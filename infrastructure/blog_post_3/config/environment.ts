// Shared values that are the same across all environments
export const AppConfig = {
  VPC_NAME: 'vpc-web-container',
  CLUSTER_NAME: 'fargate-cluster-web-container',
  APP_NAME: 'app-region-evacuation',
  DNS_ZONE_NAME: 'subdomain-2.subdomain-1.cloudns.ph',
  INTERNAL_DNS: 'web-container',
  DOCKER_IMAGE: 'jaimenavarro/web-container',
  LATENCY_DNS_RECORD: 'latency-endpoint'
};

// Regions where the app will be deployed (stage-1 and stage-2)
export const TargetRegions = ['us-east-1', 'us-west-2'];

export const PRIMARY_REGION = 'us-east-1';

import * as route53 from 'aws-cdk-lib/aws-route53'
import * as ec2 from 'aws-cdk-lib/aws-ec2'
import * as ecs from 'aws-cdk-lib/aws-ecs'
import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { AppConfig, PRIMARY_REGION } from '../../../config/environment';

/**
 * Stack for deploying the basic infrastructure in one region
 * 1. Create Route53 Public Hosted Zone
 * 2. Create VPC and ECS Cluster
 */
export class DeployBasicInfrastructureStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);
    // It's a global resource, so we only need to create once
    if (props?.env?.region === PRIMARY_REGION) {
      this.createRoute53PublicHostedZone();
    }
    // Create VPC in each region
    const vpc = new ec2.Vpc(this, 'MyVpc', { vpcName: AppConfig.VPC_NAME, maxAzs: 2 });
    // Create ECS Cluster in each region
    new ecs.Cluster(this, 'Cluster', { clusterName: AppConfig.CLUSTER_NAME, vpc });
  }

  /**
   * Create Route53 Public Hosted Zone
   */
  private createRoute53PublicHostedZone() {
    new route53.PublicHostedZone(this, 'create-dns-zone.cloudns.ph', {
      zoneName: AppConfig.DNS_ZONE_NAME,
      comment: 'Web container public hosted zone'
    });
  }
}

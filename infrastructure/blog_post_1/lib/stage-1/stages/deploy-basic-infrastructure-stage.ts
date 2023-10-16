import { Stage, StageProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { AppConfig, TargetRegions } from '../../../config/environment';
import { DeployBasicInfrastructureStack } from '../stacks/deploy-basic-infrastructure-stack';

interface DeployBasicInfrastructureStageProps extends StageProps {
  stage: string;
}

/**
 * Stage for deploying the basic infrastructure in all the regions
 * 1. Create Route53 Public Hosted Zone and Activate DNSSEC
 * 2. Create VPC and ECS Cluster in each region
 */
export class DeployBasicInfrastructureStage extends Stage {
  constructor(scope: Construct, id: string, props: DeployBasicInfrastructureStageProps) {
    super(scope, id, props);
    for (let region of TargetRegions) {
      new DeployBasicInfrastructureStack(this, `${AppConfig.APP_NAME}-basic-infrastructure-${region}`, {
        terminationProtection: false,
        env: {
          region: region,
          account: process.env.CDK_DEPLOY_ACCOUNT || process.env.CDK_DEFAULT_ACCOUNT
        },
        stackName: `${AppConfig.APP_NAME}-basic-infrastructure`
      });
    }
  }
}

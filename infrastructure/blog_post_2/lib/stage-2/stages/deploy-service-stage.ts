import { Stage, StageProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { DeployServiceStack } from '../stacks/deploy-service-stack';
import { AppConfig, TargetRegions } from '../../../config/environment';

interface DeploymentServiceStageProps extends StageProps {
  stage: string;
}

/**
 * Stage for deploying the service in all the regions
 * 1. Creates certificate
 * 2. Deploys an application load balancer
 * 3. Deploys a container inside Fargate cluster
 * 4. Creates public DNS records to reach the load balancer
 * 5. Creates a CloudWatch alarm to monitor the health of the service
 */
export class DeployServiceStage extends Stage {
  constructor(scope: Construct, id: string, props: DeploymentServiceStageProps) {
    super(scope, id, props);
    for (let region of TargetRegions) {
      new DeployServiceStack(this, `${AppConfig.APP_NAME}-service-${region}`, {
        terminationProtection: false,
        env: {
          region: region,
          account: process.env.CDK_DEPLOY_ACCOUNT || process.env.CDK_DEFAULT_ACCOUNT
        },
        stackName: `${AppConfig.APP_NAME}-service`
      });
    }
  }
}

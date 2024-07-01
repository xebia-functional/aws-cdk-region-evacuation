import { Stage, StageProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { DeployServiceStack } from '../stacks/deploy-service-stack';
import { AppConfig, TargetRegions } from '../../../config/environment';
import { DeployGlobalAcceleratorStack } from '../stacks/deploy-global-accelerator-stack';
import { ApplicationLoadBalancedFargateService } from 'aws-cdk-lib/aws-ecs-patterns';

interface DeploymentServiceStageProps extends StageProps {
  stage: string;
}

/**
 * Stage for deploying the service in all the regions
 * 1. Creates certificate
 * 2. Deploys an application load balancer
 * 3. Deploys a container inside Fargate cluster
 * 4. Creates public DNS records to reach the load balancer
 */
export class DeployServiceAndGlobalAcceleratorStage extends Stage {
  constructor(scope: Construct, id: string, props: DeploymentServiceStageProps) {
    super(scope, id, props);

    const applicationLoadBalancedFargateServices = new Array<ApplicationLoadBalancedFargateService>();

    const deployServiceStackEast1 = new DeployServiceStack(this, `${AppConfig.APP_NAME}-service-us-east-1`, {
      terminationProtection: false,
      env: {
        region: 'us-east-1',
        account: process.env.CDK_DEPLOY_ACCOUNT || process.env.CDK_DEFAULT_ACCOUNT
      },
      stackName: `${AppConfig.APP_NAME}-service`,
      crossRegionReferences: true
    });
    applicationLoadBalancedFargateServices.push(deployServiceStackEast1.fargateAlbService);

    const deployServiceStackWest2 = new DeployServiceStack(this, `${AppConfig.APP_NAME}-service-us-west-2`, {
      terminationProtection: false,
      env: {
        region: 'us-west-2',
        account: process.env.CDK_DEPLOY_ACCOUNT || process.env.CDK_DEFAULT_ACCOUNT
      },
      stackName: `${AppConfig.APP_NAME}-service`,
      crossRegionReferences: true
    });
    applicationLoadBalancedFargateServices.push(deployServiceStackWest2.fargateAlbService);

    // Deploy the global accelerator in us-west-2
    const deployGlobalAcceleratorStack = new DeployGlobalAcceleratorStack(
      this,
      `${AppConfig.APP_NAME}-global-accelerator-us-west-2`,
      {
        terminationProtection: false,
        env: {
          region: 'us-west-2',
          account: process.env.CDK_DEPLOY_ACCOUNT || process.env.CDK_DEFAULT_ACCOUNT
        },
        stackName: `${AppConfig.APP_NAME}-global-accelerator`,
        crossRegionReferences: true,
        appLoadBalancedFargateServices: applicationLoadBalancedFargateServices
      }
    );
    deployGlobalAcceleratorStack.addDependency(deployServiceStackEast1);
    deployGlobalAcceleratorStack.addDependency(deployServiceStackWest2);
  }
}

import { Duration, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Accelerator, ClientAffinity } from 'aws-cdk-lib/aws-globalaccelerator';
import { AppConfig, TargetRegions } from '../../../config/environment';
import { ApplicationLoadBalancer } from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { ApplicationLoadBalancerEndpoint } from 'aws-cdk-lib/aws-globalaccelerator-endpoints';
import * as route53 from 'aws-cdk-lib/aws-route53';
import { GlobalAcceleratorDomainTarget } from 'aws-cdk-lib/aws-route53-targets';
import { ApplicationLoadBalancedFargateService } from 'aws-cdk-lib/aws-ecs-patterns';

interface DeployGlobalAcceleratorStackProps extends StackProps {
  appLoadBalancedFargateServices: Array<ApplicationLoadBalancedFargateService>;
}

/**
 * Stack for deploying the global accelerator
 * 1. Creates a global accelerator
 * 2. Creates a DNS record for the global accelerator
 * 3. Creates a listener for the global accelerator
 * 4. Adds the application load balancer endpoints to the listener
 */
export class DeployGlobalAcceleratorStack extends Stack {
  constructor(scope: Construct, id: string, props: DeployGlobalAcceleratorStackProps) {
    super(scope, id, props);

    const accelerator = new Accelerator(this, 'Accelerator', { acceleratorName: 'MyAccelerator' });
    this.createDNSRecordForGlobalAccelerator(accelerator);
    const listener = accelerator.addListener('Listener', {
      portRanges: [{ fromPort: 443 }],
      clientAffinity: ClientAffinity.SOURCE_IP
    });

    for (const region of TargetRegions) {
      const appLoadBalancedFargateService = props.appLoadBalancedFargateServices.pop();

      // Get values from ALB
      const alb = ApplicationLoadBalancer.fromApplicationLoadBalancerAttributes(this, 'alb-' + region, {
        loadBalancerArn: appLoadBalancedFargateService?.loadBalancer.loadBalancerArn ?? '',
        securityGroupId: appLoadBalancedFargateService?.loadBalancer.connections.securityGroups[0].securityGroupId ?? ''
      });

      // Create Endpoint Group
      listener.addEndpointGroup('group-' + region, {
        endpoints: [
          new ApplicationLoadBalancerEndpoint(alb, {
            weight: 128,
            preserveClientIp: true
          })
        ]
      });
    }
  }

  private createDNSRecordForGlobalAccelerator(accelerator: Accelerator) {
    const hostedZone = route53.HostedZone.fromLookup(this, 'look-up-dns-validation.cloudns.ph', {
      domainName: AppConfig.DNS_ZONE_NAME,
      privateZone: false
    });
    const globalAcceleratorDomainTarget = new GlobalAcceleratorDomainTarget(accelerator.dnsName);
    const dnsRecord = new route53.ARecord(this, `record-global-accelerator`, {
      zone: hostedZone,
      recordName: AppConfig.GLOBAL_ACCELERATOR_DNS_RECORD,
      target: route53.RecordTarget.fromAlias(globalAcceleratorDomainTarget),
      ttl: Duration.minutes(1),
      comment: `CDK global accelerator DNS`
    });
    dnsRecord.node.addDependency(accelerator);
  }
}

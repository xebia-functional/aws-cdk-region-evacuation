import route53 = require('aws-cdk-lib/aws-route53');
import ec2 = require('aws-cdk-lib/aws-ec2');
import ecs = require('aws-cdk-lib/aws-ecs');
import ecs_patterns = require('aws-cdk-lib/aws-ecs-patterns');
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import { Duration, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { AppConfig } from '../../../config/environment';
import { LoadBalancerTarget } from 'aws-cdk-lib/aws-route53-targets';

/**
 * Stack for deploying the service in one region
 * 1. Creates certificate
 * 2. Deploys an application load balancer
 * 3. Deploys a container inside Fargate cluster
 * 4. Creates public DNS records to reach the load balancer
 */
export class DeployServiceStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    const vpc = this.lookUpForVPC();
    const cluster = this.lookUpForFargateCluster(vpc);
    const hostedZone = this.lookUpForPublicHostedZone();
    const certificate = this.createSSLCertificate(hostedZone);
    const fargateAlbService = this.createApplicationLoadBalancedFargateService(cluster, certificate, props);
    this.createDNSRecordTypeSimple(hostedZone, fargateAlbService, props);
  }

  /**
   * Lookup for resources created in previous stage-1
   * Details should be included in cdk.context.json
   */
  private lookUpForVPC(): ec2.IVpc {
    // Lookup for resources created in previous stage AppInfraPreProvision
    // Details should be included in cdk.context.json
    return ec2.Vpc.fromLookup(this, 'DefaultVPC', { vpcName: AppConfig.VPC_NAME });
  }

  /**
   * Lookup for resources created in previous stage-1
   * Details should be included in cdk.context.json
   */
  private lookUpForFargateCluster(vpc: ec2.IVpc): ecs.ICluster {
    return ecs.Cluster.fromClusterAttributes(this, 'service-cluster', {
      clusterName: AppConfig.CLUSTER_NAME,
      securityGroups: [],
      vpc: vpc
    });
  }

  /**
   * Lookup for resources created in previous stage-1
   * Details should be included in cdk.context.json
   */
  private lookUpForPublicHostedZone(): route53.IHostedZone {
    return route53.HostedZone.fromLookup(this, 'look-up-dns-domain.cloudns.ph', {
      domainName: AppConfig.DNS_ZONE_NAME,
      privateZone: false
    });
  }

  /**
   * Create Certificate for all subdomains (*).subdomain-1.cloudns.ph
   */
  private createSSLCertificate(hostedZone: route53.IHostedZone): acm.Certificate {
    return new acm.Certificate(this, 'Certificate', {
      domainName: '*.' + AppConfig.DNS_ZONE_NAME,
      validation: acm.CertificateValidation.fromDns(hostedZone)
    });
  }

  /**
   * Create Fargate Service and its related ALB for our web-server container
   * @param cluster
   * @param certificate
   * @param props
   */
  private createApplicationLoadBalancedFargateService(
    cluster: ecs.ICluster,
    certificate: acm.Certificate,
    props: StackProps
  ): ecs_patterns.ApplicationLoadBalancedFargateService {
    const fargateAlbService = new ecs_patterns.ApplicationLoadBalancedFargateService(this, 'FargateService', {
      cluster: cluster,
      certificate: certificate,
      loadBalancerName: AppConfig.INTERNAL_DNS + '-' + props.env?.region,
      taskImageOptions: {
        image: ecs.ContainerImage.fromRegistry(AppConfig.DOCKER_IMAGE),
        environment: { REGION: `${props.env?.region}` }
      }
    });

    // Configure targetGroup in our ALB
    fargateAlbService.targetGroup.configureHealthCheck({
      path: '/health',
      interval: Duration.seconds(5),
      unhealthyThresholdCount: 2,
      healthyThresholdCount: 5,
      timeout: Duration.seconds(4)
    });

    return fargateAlbService;
  }

  /**
   * Create DNS record to reach the ALB from the Internet
   * @param hostedZone
   * @param fargateAlbService
   * @param props
   */
  private createDNSRecordTypeSimple(
    hostedZone: route53.IHostedZone,
    fargateAlbService: ecs_patterns.ApplicationLoadBalancedFargateService,
    props: StackProps
  ) {
    // Create DNS A Record to reach our service
    new route53.ARecord(this, 'record-simple', {
      zone: hostedZone,
      recordName: AppConfig.INTERNAL_DNS + '-' + props.env?.region,
      target: route53.RecordTarget.fromAlias(new LoadBalancerTarget(fargateAlbService.loadBalancer)),
      ttl: Duration.minutes(1),
      comment: 'Created from cdk'
    });
  }
}

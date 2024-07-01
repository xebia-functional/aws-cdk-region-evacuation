#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { DeployServiceAndGlobalAcceleratorStage } from '../lib/stage-2/stages/deploy-service-and-global-accelerator-stage';
import { DeployBasicInfrastructureStage } from '../lib/stage-1/stages/deploy-basic-infrastructure-stage';

const app = new cdk.App();

new DeployBasicInfrastructureStage(app, 'stage-1', {
  env: {
    account: process.env.CDK_DEPLOY_ACCOUNT ?? process.env.CDK_DEFAULT_ACCOUNT
  },
  stage: 'stage-1'
});

new DeployServiceAndGlobalAcceleratorStage(app, 'stage-2', {
  env: {
    account: process.env.CDK_DEPLOY_ACCOUNT ?? process.env.CDK_DEFAULT_ACCOUNT
  },
  stage: 'stage-2'
});

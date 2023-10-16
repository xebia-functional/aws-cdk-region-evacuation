#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { DeployServiceStage } from '../lib/stage-2/stages/deploy-service-stage';
import { DeployBasicInfrastructureStage } from '../lib/stage-1/stages/deploy-basic-infrastructure-stage';

const app = new cdk.App();

new DeployBasicInfrastructureStage(app, 'stage-1', {
  env: {
    account: process.env.CDK_DEPLOY_ACCOUNT ?? process.env.CDK_DEFAULT_ACCOUNT
  },
  stage: 'stage-1'
});

new DeployServiceStage(app, 'stage-2', {
  env: {
    account: process.env.CDK_DEPLOY_ACCOUNT ?? process.env.CDK_DEFAULT_ACCOUNT
  },
  stage: 'stage-2'
});

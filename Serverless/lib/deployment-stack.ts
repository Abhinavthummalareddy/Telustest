// lib/cdk-stack.ts
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { MyServerlessStack } from './my-serverless-stack';

export class DeploymentStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    new MyServerlessStack(this, 'ServerlessStack');
  }
}

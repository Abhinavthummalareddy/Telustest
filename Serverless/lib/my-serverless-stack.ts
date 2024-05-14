import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from "aws-cdk-lib/aws-lambda"
import * as dynamodb from "aws-cdk-lib/aws-dynamodb"
import * as apigw from "aws-cdk-lib/aws-apigateway"

export class MyServerlessStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    const userTable = new dynamodb.Table(this, 'UserTable', {
      tableName: "UserTable",
      partitionKey: { name: 'UserId', type: dynamodb.AttributeType.STRING },
      removalPolicy: cdk.RemovalPolicy.DESTROY 
    });

    const registerLambda = new lambda.Function(this, 'registerLambda', {
      functionName: "registerLambda",
      runtime: lambda.Runtime.PYTHON_3_11,
      handler: 'register.handler',
      code: lambda.Code.fromAsset('lambda/'), 
      environment: {
        TABLE_NAME: userTable.tableName,
      },
    });
    userTable.grantReadWriteData(registerLambda);
  

  
    const getUserInfoLambda = new lambda.Function(this, 'getUserInfoLambda', {
      runtime: lambda.Runtime.PYTHON_3_11,
      handler: 'getInfo.handler',
      code: lambda.Code.fromAsset('lambda/'), 
      environment: {
        TABLE_NAME: userTable.tableName,
      },
    });
    userTable.grantReadData(getUserInfoLambda);

    const registerApi = new apigw.RestApi(this,"registerAPI",{
      restApiName: "Register User",
      description: "Api for Registering User",
      defaultMethodOptions: {authorizationType: apigw.AuthorizationType.NONE}
    });

    registerApi.root
    .resourceForPath("register")
    .addMethod("POST",new apigw.LambdaIntegration(registerLambda));

    const getInfoApi = new apigw.RestApi(this, 'getInfoAPI', {
      restApiName: 'Get User Info',
      description: 'API for getting users info based on userId',
      defaultMethodOptions: {authorizationType:apigw.AuthorizationType.NONE }
    });
    const users = getInfoApi.root.addResource('users');
    const user = users.addResource('{userId}');
    const getUserIntegration = new apigw.LambdaIntegration(getUserInfoLambda);
    user.addMethod('GET', getUserIntegration);
    
  }
}

import json
import os
import boto3

dynamodb = boto3.resource('dynamodb')
table_name = os.environ['TABLE_NAME']
table = dynamodb.Table(table_name)

def handler(event, context):
    try:
        if 'pathParameters' not in event or 'userId' not in event['pathParameters']:
            return {
                'statusCode': 400,
                'body': json.dumps({'message': 'Invalid request, missing userId'})
            }
        
        user_id = event['pathParameters']['userId']
        response = table.get_item(
            Key={'UserId': user_id}
        )

        if 'Item' not in response:
            return {
                'statusCode': 404,
                'body': json.dumps({'message': 'User not found'})
            }
        return {
            'statusCode': 200,
            'body': json.dumps(response['Item'])
        }
    except Exception as e:
        print(e)
        return {
            'statusCode': 500,
            'body': json.dumps({'message': 'Internal server error'})
        }

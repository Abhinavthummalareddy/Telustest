import json
import os
import boto3
import uuid

dynamodb = boto3.resource('dynamodb')
table_name = os.environ['TABLE_NAME']
table = dynamodb.Table(table_name)

def handler(event, context):
    try:
        if 'body' not in event or not event['body']:
            return {
                'statusCode': 400,
                'body': json.dumps({'message': 'Invalid request, no body provided'})
            }
        
        request_body = json.loads(event['body'])

        if 'name' not in request_body or 'email' not in request_body:
            return {
                'statusCode': 400,
                'body': json.dumps({'message': 'Invalid request, missing name or email'})
            }

        email = request_body['email']

        # Check if the user with the given email already exists
        response = table.scan(
            FilterExpression='Email = :email',
            ExpressionAttributeValues={':email': email}
        )
        
        if response['Items']:
            return {
                'statusCode': 400,
                'body': json.dumps({'message': 'User with this email already exists'})
            }

        user_id = str(uuid.uuid4())
        item = {
            'UserId': user_id,
            'Name': request_body['name'],
            'Email': email
        }

        table.put_item(Item=item)

        return {
            'statusCode': 201,
            'body': json.dumps({'userId': user_id})
        }
    except Exception as e:
        print(e)
        return {
            'statusCode': 500,
            'body': json.dumps({'message': 'Internal server error'})
        }

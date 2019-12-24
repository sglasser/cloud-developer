import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { TodoItem } from '../../models/TodoItem';
import { getUserId } from '../../lambda/utils';

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

  const userId = getUserId(event);

  const docClient = new DocumentClient();

  const result = await docClient.query({
    TableName: process.env.TODOS_TABLE,
    KeyConditionExpression: 'userId = :u',
    ExpressionAttributeValues: {
      ':u': userId
    }
  }).promise();

  const todos = result.Items as TodoItem[];

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify(todos)
  }
}

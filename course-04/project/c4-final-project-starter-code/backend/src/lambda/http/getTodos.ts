import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { TodoItem } from '../../models/TodoItem';
import { getUserId } from '../../lambda/utils';

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  // TODO: Get all TODO items for a current user
  const userId = getUserId(event);

  console.log('userId', userId);

  const docClient = new DocumentClient();

  const result = await docClient.scan({
    TableName: process.env.TODOS_TABLE
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

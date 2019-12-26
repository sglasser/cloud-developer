import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest';
import { getUserId } from '../../lambda/utils';

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

  const todoId = event.pathParameters.todoId;
  const updatedTodo: UpdateTodoRequest = JSON.parse(event.body);
  const userId = getUserId(event);

  const docClient = new DocumentClient();

  await docClient.update({
    TableName: process.env.TODOS_TABLE,
    UpdateExpression: 'set done = :d',
    ExpressionAttributeValues: {
      ':d': updatedTodo.done
    },
    Key: { "userId": userId, "todoId": todoId}
  }).promise();

  return {
    statusCode: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: ''
  }
}

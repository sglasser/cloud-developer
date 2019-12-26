import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'

import { getUserId } from '../../lambda/utils';
import { TodoItem } from '../../models/TodoItem';
import { uuid } from 'uuidv4'

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const newTodo: CreateTodoRequest = JSON.parse(event.body)
  const docClient = new DocumentClient();

  const userId = getUserId(event);
  const todoId = uuid();
  const createdAt = new Date().toDateString();

  const todo: TodoItem = {
    userId,
    todoId,
    createdAt,
    done: false,
    ...newTodo
   }

  await docClient.put({
    TableName: process.env.TODOS_TABLE,
    Item: todo
  }).promise();

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify(todo)
  }
}

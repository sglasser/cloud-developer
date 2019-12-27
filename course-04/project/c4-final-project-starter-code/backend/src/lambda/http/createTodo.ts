import 'source-map-support/register';
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import { CreateTodoRequest } from '../../requests/CreateTodoRequest';
import { createLogger } from '../../utils/logger';
import { getUserId } from '../../lambda/utils';
import { TodoItem } from '../../models/TodoItem';
import { uuid } from 'uuidv4';
import { Db } from '../../dynamodb/db';

const logger = createLogger('createTodo');

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  
  const newTodo: CreateTodoRequest = JSON.parse(event.body);
  const userId = getUserId(event);
  const todoId = uuid();
  const createdAt = new Date().toDateString();

  const todo: TodoItem = {
    userId,
    todoId,
    createdAt,
    done: false,
    ...newTodo
  };

  logger.info('creating todo', todo);

  await Db.getInstance().save(todo);

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify(todo)
  };
}

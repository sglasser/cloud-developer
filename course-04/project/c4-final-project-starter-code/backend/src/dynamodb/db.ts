// import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { TodoItem } from '../models/TodoItem';
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest';
import * as AWSXRay from 'aws-xray-sdk';
import * as AWS from 'aws-sdk';



export class Db {

  private static instance: Db;
  docClient;

  constructor() {
    const XAWS = AWSXRay.captureAWS(AWS);
    this.docClient = new XAWS.DynamoDB.DocumentClient();
  }

  static getInstance() {
    if (!Db.instance) {
      Db.instance = new Db();
    }
    return Db.instance;
  }

  async getAll(userId): Promise<TodoItem[]> {
    const result = await this.docClient.query({
      TableName: process.env.TODOS_TABLE,
      KeyConditionExpression: 'userId = :u',
      ExpressionAttributeValues: {
        ':u': userId
      }
    }).promise();
    return result.Items as TodoItem[];
  }

  async save(todo: TodoItem) {
    return this.docClient.put({
      TableName: process.env.TODOS_TABLE,
      Item: todo
    }).promise();
  }

  async update(updatedTodo: UpdateTodoRequest, userId: string, todoId: string) {
    return this.docClient.update({
      TableName: process.env.TODOS_TABLE,
      UpdateExpression: 'set done = :d',
      ExpressionAttributeValues: {
        ':d': updatedTodo.done
      },
      Key: { "userId": userId, "todoId": todoId}
    }).promise();
  }

  async updateUrl(url: string, userId: string, todoId: string) {
    return this.docClient.update({
      TableName: process.env.TODOS_TABLE,
      UpdateExpression: 'set attachmentUrl = :u',
      ExpressionAttributeValues: {
        ':u': url
      },
      Key: { "userId": userId, "todoId": todoId}
    }).promise();
  }

  async delete(userId: string, todoId: string) {
    return this.docClient.delete({
      TableName: process.env.TODOS_TABLE,
      Key: { "userId": userId, "todoId": todoId}
    }).promise();
  }

}

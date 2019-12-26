import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda';
import { getUserId } from '../../lambda/utils';
import * as AWS from 'aws-sdk'

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  const userId = getUserId(event);

  const s3 = new AWS.S3({
    signatureVersion: 'v4'
  });

  const url = s3.getSignedUrl('putObject', {
    Bucket: `${process.env.TODOS_S3_BUCKET}/${userId}`,
    Key: todoId,
    Expires: process.env.SIGNED_URL_EXPIRATION
  });

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      uploadUrl: url
    })
  }
}

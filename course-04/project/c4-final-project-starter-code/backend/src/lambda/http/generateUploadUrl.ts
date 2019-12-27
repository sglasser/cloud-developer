import 'source-map-support/register';
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda';
import { getUserId } from '../../lambda/utils';
import { S3Client } from '../../s3/s3';
import { Db } from '../../dynamodb/db';
import { createLogger } from '../../utils/logger';

const logger = createLogger('generateUploadUrl');

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId;
  const userId = getUserId(event);

  const uploadUrl = S3Client.getInstance().getUploadUrl(userId, todoId);
  logger.info('Generated Upload url', uploadUrl);
  const downloadUrl = `${process.env.TODO_DOWNLOAD_URL}${userId}/${todoId}`;
  await Db.getInstance().updateUrl(downloadUrl, userId, todoId);
  logger.info('Updated todo with download url', downloadUrl);

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      uploadUrl: uploadUrl
    })
  };
}

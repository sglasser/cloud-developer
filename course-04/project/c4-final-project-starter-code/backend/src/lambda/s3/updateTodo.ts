import { S3Handler, S3Event } from 'aws-lambda';
import 'source-map-support/register';
import { Db } from '../../dynamodb/db';
import { createLogger } from '../../utils/logger';

export const handler: S3Handler = async (event: S3Event) => {
  const logger = createLogger('s3.updateTodo');

  for (const record of event.Records) {
    const keyArr = record.s3.object.key.split('/');
    logger.info('keyArr', keyArr);
    const downloadUrl = `${process.env.TODO_DOWNLOAD_URL}${keyArr[0]}/${keyArr[1]}`;
    logger.info('downloadUrl', downloadUrl );
    await Db.getInstance().updateUrl(downloadUrl, keyArr[0], keyArr[1]);
    logger.info('updated todo download url');
  }
}
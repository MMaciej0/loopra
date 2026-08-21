import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { S3_BUCKET } from '../config/env.js';

export const uploadToS3 = async (
  client: S3Client,
  body: Buffer,
  key: string,
  contentType: string,
) => {
  const command = new PutObjectCommand({
    Bucket: S3_BUCKET,
    Key: key,
    Body: body,
    ContentType: contentType,
  });

  const result = await client.send(command);

  return result;
};

export const deleteFromS3 = async (client: S3Client, key: string) => {
  const command = new DeleteObjectCommand({
    Bucket: S3_BUCKET,
    Key: key,
  });

  const result = await client.send(command);

  return result;
};

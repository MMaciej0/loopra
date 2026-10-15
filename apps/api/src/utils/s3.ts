import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
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

export const DOWNLOAD_URL_EXPIRES_IN_SECONDS = 5 * 60;

const attachmentDisposition = (filename: string) => {
  const fallback = filename
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\x20-\x7e]|["\\/]/g, '_');
  const encoded = encodeURIComponent(filename).replace(
    /['()*]/g,
    (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`,
  );

  return `attachment; filename="${fallback}"; filename*=UTF-8''${encoded}`;
};

export const getDownloadUrl = (
  client: S3Client,
  key: string,
  filename: string,
  contentType: string,
) => {
  const command = new GetObjectCommand({
    Bucket: S3_BUCKET,
    Key: key,
    ResponseContentDisposition: attachmentDisposition(filename),
    ResponseContentType: contentType,
  });

  return getSignedUrl(client, command, { expiresIn: DOWNLOAD_URL_EXPIRES_IN_SECONDS });
};

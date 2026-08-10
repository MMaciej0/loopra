import fastifyPlugin from 'fastify-plugin';
import { S3Client } from '@aws-sdk/client-s3';
import { S3_ACCESS_KEY_ID, S3_ENDPOINT, S3_REGION, S3_SECRET_ACCESS_KEY } from '../config/env.js';

declare module 'fastify' {
  interface FastifyInstance {
    s3: S3Client;
  }
}

export default fastifyPlugin(async (fastify) => {
  const client = new S3Client({
    endpoint: S3_ENDPOINT,
    region: S3_REGION,
    credentials: {
      accessKeyId: S3_ACCESS_KEY_ID,
      secretAccessKey: S3_SECRET_ACCESS_KEY,
    },
  });

  fastify.decorate('s3', client);

  fastify.addHook('onClose', () => {
    client.destroy();
  });
});

import fastifyPlugin from 'fastify-plugin';
import multipart from '@fastify/multipart';

export const MAX_GPX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

export default fastifyPlugin((fastify) => {
  fastify.register(multipart, {
    limits: {
      files: 1,
      fileSize: MAX_GPX_FILE_SIZE_BYTES,
    },
  });
});

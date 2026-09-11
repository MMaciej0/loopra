import fastifyPlugin from 'fastify-plugin';
import multipart from '@fastify/multipart';
import { MAX_GPX_FILE_SIZE_BYTES } from '@loopra/domain';

export default fastifyPlugin((fastify) => {
  fastify.register(multipart, {
    limits: {
      files: 1,
      fileSize: MAX_GPX_FILE_SIZE_BYTES,
    },
  });
});

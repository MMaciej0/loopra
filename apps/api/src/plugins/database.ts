import fastifyPlugin from 'fastify-plugin';
import { db, pool, type Db } from '../db/index.js';

declare module 'fastify' {
  interface FastifyInstance {
    db: Db;
  }
}

export default fastifyPlugin(async (fastify) => {
  fastify.decorate('db', db);

  fastify.addHook('onClose', async () => {
    await pool.end();
  });
});

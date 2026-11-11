import fastifyPlugin from 'fastify-plugin';
import Anthropic from '@anthropic-ai/sdk';
import { ANTHROPIC_API_KEY } from '../config/env.js';

declare module 'fastify' {
  interface FastifyInstance {
    anthropic: Anthropic;
  }
}

export default fastifyPlugin(async (fastify) => {
  const anthropic = new Anthropic({
    apiKey: ANTHROPIC_API_KEY,
  });

  fastify.decorate('anthropic', anthropic);
});

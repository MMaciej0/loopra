import type { FastifyReply } from 'fastify';

export const writeEvent = <T>(reply: FastifyReply, name: string, data: T) => {
  reply.raw.write(`event: ${name}\n`);
  reply.raw.write(`data: ${JSON.stringify(data)}\n\n`);
};

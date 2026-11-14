import type { FastifyReply } from 'fastify';

export const writeEvent = <T>(reply: FastifyReply, name: string, data: T) => {
  reply.raw.write(`event: ${name}\n`);
  reply.raw.write(`data: ${JSON.stringify(data)}\n\n`);
};

export const openEventStream = (reply: FastifyReply, onClose: () => void) => {
  reply.hijack();
  reply.raw.writeHead(200, { 'content-type': 'text/event-stream', 'cache-control': 'no-cache' });
  reply.raw.on('close', () => {
    if (!reply.raw.writableEnded) onClose();
  });

  return {
    send: <T>(event: string, data: T) => writeEvent<T>(reply, event, data),
    end: () => reply.raw.end(),
  };
};

import { buildApp } from './app.js';
import { PORT } from './config/env.js';

const SHUTDOWN_TIMEOUT_MS = 8000;

const app = buildApp();

let shuttingDown = false;

async function shutdown(signal: NodeJS.Signals) {
  if (shuttingDown) return;
  shuttingDown = true;

  app.log.info({ signal }, 'Shutting down');

  setTimeout(() => {
    app.log.error(`Shutdown did not finish in ${SHUTDOWN_TIMEOUT_MS} ms, forcing exit`);
    process.exit(1);
  }, SHUTDOWN_TIMEOUT_MS);

  try {
    await app.close();
    app.log.info('Shutdown complete');
    process.exit(0);
  } catch (error) {
    app.log.error(error, 'Shutdown failed');
    process.exit(1);
  }
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

try {
  await app.listen({ port: PORT, host: '0.0.0.0' });
} catch (error) {
  app.log.error(error);
  process.exit(1);
}

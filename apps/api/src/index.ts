import { buildApp } from './app.js';
import { PORT } from './config/env.js';

const app = buildApp();

try {
  app.listen({ port: PORT, host: '0.0.0.0' });
} catch (error) {
  app.log.error(error);
  process.exit(1);
}

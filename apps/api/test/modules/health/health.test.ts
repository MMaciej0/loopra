import { describe, expect, it } from 'vitest';
import { useApp } from '../../helpers/app.js';

describe('GET /health', () => {
  const appRef = useApp();

  it('answers 200 with every service ok when Postgres and Redis answer', async () => {
    const response = await appRef.app.inject({
      method: 'GET',
      url: '/health',
    });

    expect(response.statusCode).toBe(200);
    expect(Object.keys(response.json()).sort()).toEqual(['postgres', 'redis', 'status']);
    expect(response.json()).toEqual({ status: 'ok', postgres: 'ok', redis: 'ok' });
  });
});

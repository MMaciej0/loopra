import { describe, expect, it, vi } from 'vitest';
import type { Redis } from 'ioredis';
import { checkHealth } from '../../../src/modules/health/services/checkHealth.js';
import { useApp } from '../../helpers/app.js';

describe('checkHealth', () => {
  const appRef = useApp();

  it('answers error for Redis without sending PING when the connection is not ready', async () => {
    const ping = vi.fn().mockResolvedValue('PONG');
    const redis = { status: 'reconnecting', ping } as unknown as Redis;

    const health = await checkHealth(appRef.app.db, redis);

    expect(health).toEqual({ status: 'error', postgres: 'ok', redis: 'error' });
    expect(ping).not.toHaveBeenCalled();
  });
});
